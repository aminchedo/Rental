require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const database = require('./database');
const { sendContractSignedEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    database.getUserByUsername(username, async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true });
  });
});

// Get all contracts
app.get('/api/contracts', (req, res) => {
  database.getAllContracts((err, contracts) => {
    if (err) {
      console.error('Error fetching contracts:', err);
      return res.status(500).json({ error: 'Failed to fetch contracts' });
    }
    res.json(contracts || []);
  });
});

// Add or update contracts (batch operation for compatibility)
app.post('/api/contracts', (req, res) => {
  const contracts = req.body;
  
  if (!contracts || !Array.isArray(contracts)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  if (contracts.length === 0) {
    return res.json({ success: true, message: 'No contracts to process' });
  }

  let processed = 0;
  let errors = [];

  contracts.forEach((contract, index) => {
    database.addContract(contract, (err) => {
      processed++;
      
      if (err) {
        console.error(`Error saving contract ${contract.contractNumber}:`, err);
        errors.push(`Contract ${contract.contractNumber}: ${err.message}`);
      }

      // Check if all contracts have been processed
      if (processed === contracts.length) {
        if (errors.length > 0) {
          res.status(207).json({ 
            success: false, 
            message: 'Some contracts failed to save',
            errors: errors
          });
        } else {
          res.json({ success: true, message: 'All contracts saved successfully' });
        }
      }
    });
  });
});

// Add single contract
app.post('/api/contracts/add', (req, res) => {
  const contractData = req.body;
  
  database.addContract(contractData, (err) => {
    if (err) {
      console.error('Error adding contract:', err);
      return res.status(500).json({ error: 'Failed to add contract' });
    }
    res.json({ success: true, contract: contractData });
  });
});

// Update single contract
app.put('/api/contracts/:contractNumber', (req, res) => {
  const { contractNumber } = req.params;
  const updates = req.body;

  database.updateContract(contractNumber, updates, (err) => {
    if (err) {
      console.error('Error updating contract:', err);
      return res.status(500).json({ error: 'Failed to update contract' });
    }
    res.json({ success: true });
  });
});

// Delete contract
app.delete('/api/contracts/:contractNumber', requireAuth, (req, res) => {
  const { contractNumber } = req.params;

  database.deleteContract(contractNumber, (err) => {
    if (err) {
      console.error('Error deleting contract:', err);
      return res.status(500).json({ error: 'Failed to delete contract' });
    }
    res.json({ success: true });
  });
});

// Get single contract
app.get('/api/contracts/:contractNumber', (req, res) => {
  const { contractNumber } = req.params;

  database.getContractByNumber(contractNumber, (err, contract) => {
    if (err) {
      console.error('Error fetching contract:', err);
      return res.status(500).json({ error: 'Failed to fetch contract' });
    }
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  });
});

// Sign contract endpoint
app.post('/api/contracts/:contractNumber/sign', async (req, res) => {
  const { contractNumber } = req.params;
  const { signature } = req.body;

  try {
    // Get the contract first
    database.getContractByNumber(contractNumber, async (err, contract) => {
      if (err) {
        console.error('Error fetching contract:', err);
        return res.status(500).json({ error: 'Failed to fetch contract' });
      }

      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      // Update contract with signature and signed status
      const updates = {
        status: 'signed',
        signature: signature,
        signedAt: new Date().toISOString()
      };

      database.updateContract(contractNumber, updates, async (updateErr) => {
        if (updateErr) {
          console.error('Error updating contract:', updateErr);
          return res.status(500).json({ error: 'Failed to sign contract' });
        }

        // Send email notification to landlord
        try {
          const emailResult = await sendContractSignedEmail(
            contract.landlordEmail,
            contract.landlordName,
            contract.tenantName,
            contractNumber
          );

          if (emailResult.success) {
            console.log('Contract signed and email sent successfully');
          } else {
            console.error('Contract signed but email failed:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Continue with success response even if email fails
        }

        res.json({ success: true, message: 'Contract signed successfully' });
      });
    });
  } catch (error) {
    console.error('Contract signing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lookup tenant by National ID
app.get('/api/tenant/lookup/:nationalId', (req, res) => {
  const { nationalId } = req.params;

  // Validate National ID format (10 digits)
  if (!/^\d{10}$/.test(nationalId)) {
    return res.status(400).json({ error: 'Invalid National ID format' });
  }

  database.getTenantByNationalId(nationalId, (err, tenant) => {
    if (err) {
      console.error('Error looking up tenant:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      tenantName: tenant.tenantName,
      tenantEmail: tenant.tenantEmail,
      tenantPhone: tenant.tenantPhone
    });
  });
});

// Lookup landlord by National ID
app.get('/api/landlord/lookup/:nationalId', (req, res) => {
  const { nationalId } = req.params;

  // Validate National ID format (10 digits)
  if (!/^\d{10}$/.test(nationalId)) {
    return res.status(400).json({ error: 'Invalid National ID format' });
  }

  database.getLandlordByNationalId(nationalId, (err, landlord) => {
    if (err) {
      console.error('Error looking up landlord:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    res.json({
      landlordName: landlord.landlordName,
      landlordEmail: landlord.landlordEmail
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    session: req.session.user ? 'authenticated' : 'anonymous'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  database.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});