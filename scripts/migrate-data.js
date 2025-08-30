const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables for local development
require('dotenv').config();

async function migrateData() {
  try {
    console.log('Starting data migration from SQLite to PostgreSQL...');
    
    // Check if there's existing SQLite data to migrate
    const sqliteDbPath = path.join(__dirname, '..', 'rental.db');
    
    if (!fs.existsSync(sqliteDbPath)) {
      console.log('No SQLite database found. Starting with fresh PostgreSQL database.');
      return;
    }
    
    // For this migration, we'll assume the data is exported to JSON files
    // In a real scenario, you would export from SQLite first
    
    const dataDir = path.join(__dirname, 'migration-data');
    
    if (!fs.existsSync(dataDir)) {
      console.log('No migration data directory found. Creating sample data...');
      
      // Create sample data for demonstration
      const sampleContract = {
        id: `contract_${Date.now()}_sample`,
        contractNumber: 'RNT1234567890',
        accessCode: '123456',
        tenantName: 'احمد محمدی',
        tenantEmail: 'ahmad@example.com',
        tenantPhone: '09123456789',
        tenantNationalId: '1234567890',
        landlordName: 'علی رضایی',
        landlordEmail: 'ali@example.com',
        landlordNationalId: '0987654321',
        propertyAddress: 'تهران، خیابان ولیعصر، پلاک 123',
        propertyType: 'آپارتمان',
        rentAmount: '15000000',
        deposit: '45000000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'signed',
        createdAt: new Date().toISOString(),
        signedAt: new Date().toISOString()
      };
      
      // Insert sample contract
      await sql`
        INSERT INTO contracts (
          id, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone,
          tenantNationalId, landlordName, landlordEmail, landlordNationalId,
          propertyAddress, propertyType, rentAmount, deposit, startDate, endDate,
          status, createdAt, signedAt
        ) VALUES (
          ${sampleContract.id}, ${sampleContract.contractNumber}, ${sampleContract.accessCode},
          ${sampleContract.tenantName}, ${sampleContract.tenantEmail}, ${sampleContract.tenantPhone},
          ${sampleContract.tenantNationalId}, ${sampleContract.landlordName}, ${sampleContract.landlordEmail},
          ${sampleContract.landlordNationalId}, ${sampleContract.propertyAddress}, ${sampleContract.propertyType},
          ${sampleContract.rentAmount}, ${sampleContract.deposit}, ${sampleContract.startDate},
          ${sampleContract.endDate}, ${sampleContract.status}, ${sampleContract.createdAt},
          ${sampleContract.signedAt}
        )
        ON CONFLICT (contractNumber) DO NOTHING
      `;
      
      console.log('✅ Sample data inserted');
      return;
    }
    
    // Migrate contracts
    const contractsFile = path.join(dataDir, 'contracts.json');
    if (fs.existsSync(contractsFile)) {
      const contracts = JSON.parse(fs.readFileSync(contractsFile, 'utf8'));
      
      for (const contract of contracts) {
        await sql`
          INSERT INTO contracts (
            id, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone,
            tenantNationalId, landlordName, landlordEmail, landlordNationalId,
            propertyAddress, propertyType, rentAmount, deposit, startDate, endDate,
            status, signature, nationalIdImage, createdAt, signedAt,
            propertySize, propertyFeatures, monthlyRent, securityDeposit,
            utilitiesIncluded, petPolicy, smokingPolicy, notes
          ) VALUES (
            ${contract.id}, ${contract.contractNumber}, ${contract.accessCode},
            ${contract.tenantName}, ${contract.tenantEmail}, ${contract.tenantPhone},
            ${contract.tenantNationalId}, ${contract.landlordName}, ${contract.landlordEmail},
            ${contract.landlordNationalId}, ${contract.propertyAddress}, ${contract.propertyType},
            ${contract.rentAmount}, ${contract.deposit}, ${contract.startDate},
            ${contract.endDate}, ${contract.status}, ${contract.signature},
            ${contract.nationalIdImage}, ${contract.createdAt}, ${contract.signedAt},
            ${contract.propertySize}, ${contract.propertyFeatures}, ${contract.monthlyRent},
            ${contract.securityDeposit}, ${contract.utilitiesIncluded}, ${contract.petPolicy},
            ${contract.smokingPolicy}, ${contract.notes}
          )
          ON CONFLICT (contractNumber) DO NOTHING
        `;
      }
      
      console.log(`✅ Migrated ${contracts.length} contracts`);
    }
    
    // Migrate expenses
    const expensesFile = path.join(dataDir, 'expenses.json');
    if (fs.existsSync(expensesFile)) {
      const expenses = JSON.parse(fs.readFileSync(expensesFile, 'utf8'));
      
      for (const expense of expenses) {
        await sql`
          INSERT INTO expenses (
            contract_id, amount, description, category, date, receipt_image, created_at
          ) VALUES (
            ${expense.contract_id}, ${expense.amount}, ${expense.description},
            ${expense.category}, ${expense.date}, ${expense.receipt_image}, ${expense.created_at}
          )
        `;
      }
      
      console.log(`✅ Migrated ${expenses.length} expenses`);
    }
    
    // Migrate payments
    const paymentsFile = path.join(dataDir, 'payments.json');
    if (fs.existsSync(paymentsFile)) {
      const payments = JSON.parse(fs.readFileSync(paymentsFile, 'utf8'));
      
      for (const payment of payments) {
        await sql`
          INSERT INTO payments (
            contract_id, amount, payment_date, payment_method, status, notes, created_at
          ) VALUES (
            ${payment.contract_id}, ${payment.amount}, ${payment.payment_date},
            ${payment.payment_method}, ${payment.status}, ${payment.notes}, ${payment.created_at}
          )
        `;
      }
      
      console.log(`✅ Migrated ${payments.length} payments`);
    }
    
    // Migrate maintenance requests
    const maintenanceFile = path.join(dataDir, 'maintenance_requests.json');
    if (fs.existsSync(maintenanceFile)) {
      const maintenanceRequests = JSON.parse(fs.readFileSync(maintenanceFile, 'utf8'));
      
      for (const request of maintenanceRequests) {
        await sql`
          INSERT INTO maintenance_requests (
            contract_id, title, description, priority, status, created_at, resolved_at
          ) VALUES (
            ${request.contract_id}, ${request.title}, ${request.description},
            ${request.priority}, ${request.status}, ${request.created_at}, ${request.resolved_at}
          )
        `;
      }
      
      console.log(`✅ Migrated ${maintenanceRequests.length} maintenance requests`);
    }
    
    console.log('✅ Data migration completed successfully');
  } catch (error) {
    console.error('❌ Data migration error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };