require('dotenv').config();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DATABASE_PATH || './rental_contracts.db';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // This should be changed in production

async function setupDatabase() {
  const db = new sqlite3.Database(DB_PATH);

  // Create tables
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createContractsTable = `
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      contractNumber TEXT UNIQUE NOT NULL,
      accessCode TEXT NOT NULL,
      tenantName TEXT NOT NULL,
      tenantEmail TEXT NOT NULL,
      tenantPhone TEXT,
      landlordName TEXT NOT NULL,
      landlordEmail TEXT NOT NULL,
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

  try {
    // Create tables
    await new Promise((resolve, reject) => {
      db.run(createUsersTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run(createContractsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Database tables created successfully');

    // Check if admin user exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingAdmin) {
      // Create admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
          [ADMIN_USERNAME, hashedPassword, 'admin'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log('✅ Admin user created successfully');
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('   ⚠️  Please change the default password in production!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Migrate existing CSV data if present
    const fs = require('fs');
    const csv = require('csv-parser');
    const csvPath = './contracts.csv';

    if (fs.existsSync(csvPath)) {
      console.log('📦 Migrating existing CSV data...');
      
      const contracts = [];
      await new Promise((resolve) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => {
            contracts.push(data);
          })
          .on('end', resolve);
      });

      for (const contract of contracts) {
        try {
          await new Promise((resolve, reject) => {
            const sql = `
              INSERT OR REPLACE INTO contracts (
                id, contractNumber, accessCode, tenantName, tenantEmail, tenantPhone,
                landlordName, landlordEmail, propertyAddress, propertyType, rentAmount,
                startDate, endDate, deposit, status, signature, nationalId, createdBy
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(sql, [
              contract.id || contract.contractNumber,
              contract.contractNumber,
              contract.accessCode,
              contract.tenantName,
              contract.tenantEmail,
              contract.tenantPhone,
              contract.landlordName,
              contract.landlordEmail,
              contract.propertyAddress,
              contract.propertyType,
              contract.rentAmount,
              contract.startDate,
              contract.endDate,
              contract.deposit,
              contract.status || 'draft',
              contract.signature,
              contract.nationalId,
              contract.createdBy || 'landlord'
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch (error) {
          console.error(`Error migrating contract ${contract.contractNumber}:`, error);
        }
      }

      console.log(`✅ Migrated ${contracts.length} contracts from CSV`);
      
      // Backup CSV file
      const backupPath = `./contracts_backup_${Date.now()}.csv`;
      fs.copyFileSync(csvPath, backupPath);
      console.log(`📋 CSV file backed up to ${backupPath}`);
    } else {
      console.log('ℹ️  No existing CSV data to migrate');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    db.close();
    console.log('✅ Database setup completed');
  }
}

setupDatabase();