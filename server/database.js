const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './rental_contracts.db';

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database.');
        this.createTables();
      }
    });
  }

  createTables() {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create contracts table
    const createContractsTable = `
      CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        contractNumber TEXT UNIQUE NOT NULL,
        accessCode TEXT NOT NULL,
        tenantName TEXT NOT NULL,
        tenantEmail TEXT NOT NULL,
        tenantPhone TEXT,
        tenantNationalId TEXT,
        landlordName TEXT NOT NULL,
        landlordEmail TEXT NOT NULL,
        landlordNationalId TEXT,
        propertyAddress TEXT NOT NULL,
        propertyType TEXT,
        rentAmount TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        deposit TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        signature TEXT,
        nationalId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastModified DATETIME DEFAULT CURRENT_TIMESTAMP,
        signedAt DATETIME,
        terminatedAt DATETIME,
        createdBy TEXT DEFAULT 'landlord'
      )
    `;

    this.db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready.');
        this.createDefaultAdmin();
      }
    });

    this.db.run(createContractsTable, (err) => {
      if (err) {
        console.error('Error creating contracts table:', err.message);
      } else {
        console.log('Contracts table ready.');
        this.addMissingColumns();
        this.migrateExistingData();
      }
    });
  }

  createDefaultAdmin() {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    
    // Check if admin user already exists
    this.db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err.message);
        return;
      }
      
      if (!row) {
        // Create default admin user
        bcrypt.hash('admin', saltRounds, (hashErr, hash) => {
          if (hashErr) {
            console.error('Error hashing password:', hashErr.message);
            return;
          }
          
          this.db.run(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            ['admin', hash, 'admin'],
            (insertErr) => {
              if (insertErr) {
                console.error('Error creating admin user:', insertErr.message);
              } else {
                console.log('Default admin user created.');
              }
            }
          );
        });
      }
    });
  }

  addMissingColumns() {
    // Add new columns if they don't exist (for existing databases)
    const alterQueries = [
      'ALTER TABLE contracts ADD COLUMN tenantNationalId TEXT',
      'ALTER TABLE contracts ADD COLUMN landlordNationalId TEXT'
    ];

    alterQueries.forEach(query => {
      this.db.run(query, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding column:', err.message);
        }
      });
    });
  }

  migrateExistingData() {
    const fs = require('fs');
    const csv = require('csv-parser');
    const csvPath = './contracts.csv';

    if (fs.existsSync(csvPath)) {
      console.log('Migrating existing CSV data to SQLite...');
      
      const contracts = [];
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          contracts.push(data);
        })
        .on('end', () => {
          contracts.forEach((contract) => {
            this.addContract(contract, () => {});
          });
          console.log(`Migrated ${contracts.length} contracts from CSV to SQLite.`);
          
          // Backup the CSV file
          const backupPath = `./contracts_backup_${Date.now()}.csv`;
          fs.copyFileSync(csvPath, backupPath);
          console.log(`CSV file backed up to ${backupPath}`);
        });
    }
  }

  // Contract operations
  getAllContracts(callback) {
    this.db.all('SELECT * FROM contracts ORDER BY createdAt DESC', [], callback);
  }

  getContractByNumber(contractNumber, callback) {
    this.db.get('SELECT * FROM contracts WHERE contractNumber = ?', [contractNumber], callback);
  }

  addContract(contractData, callback) {
    const {
      id, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone, tenantNationalId,
      landlordName, landlordEmail, landlordNationalId, propertyAddress, propertyType, rentAmount,
      startDate, endDate, deposit, status, signature, nationalId, createdBy
    } = contractData;

    const sql = `
      INSERT OR REPLACE INTO contracts (
        id, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone, tenantNationalId,
        landlordName, landlordEmail, landlordNationalId, propertyAddress, propertyType, rentAmount,
        startDate, endDate, deposit, status, signature, nationalId, createdBy,
        lastModified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    this.db.run(sql, [
      id || contractNumber, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone, tenantNationalId,
      landlordName, landlordEmail, landlordNationalId, propertyAddress, propertyType, rentAmount,
      startDate, endDate, deposit, status || 'draft', signature, nationalId, createdBy || 'landlord'
    ], callback);
  }

  updateContract(contractNumber, updates, callback) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(contractNumber);

    const sql = `UPDATE contracts SET ${fields}, lastModified = CURRENT_TIMESTAMP WHERE contractNumber = ?`;
    this.db.run(sql, values, callback);
  }

  deleteContract(contractNumber, callback) {
    this.db.run('DELETE FROM contracts WHERE contractNumber = ?', [contractNumber], callback);
  }

  // User operations
  getUserByUsername(username, callback) {
    this.db.get('SELECT * FROM users WHERE username = ?', [username], callback);
  }

  // Lookup operations for autofill
  getTenantByNationalId(nationalId, callback) {
    // Get the most recent contract for this tenant's national ID
    this.db.get(`
      SELECT tenantName, tenantEmail, tenantPhone 
      FROM contracts 
      WHERE tenantNationalId = ? 
      ORDER BY createdAt DESC 
      LIMIT 1
    `, [nationalId], callback);
  }

  getLandlordByNationalId(nationalId, callback) {
    // Get the most recent contract for this landlord's national ID
    this.db.get(`
      SELECT DISTINCT landlordName, landlordEmail 
      FROM contracts 
      WHERE landlordNationalId = ? 
      ORDER BY createdAt DESC 
      LIMIT 1
    `, [nationalId], callback);
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
}

module.exports = new Database();