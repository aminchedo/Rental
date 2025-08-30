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

    // Create notification_settings table
    const createNotificationSettingsTable = `
      CREATE TABLE IF NOT EXISTS notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT UNIQUE NOT NULL,
        enabled BOOLEAN DEFAULT 0,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createNotificationSettingsTable, (err) => {
      if (err) {
        console.error('Error creating notification_settings table:', err.message);
      } else {
        console.log('Notification settings table ready.');
        this.initializeNotificationSettings();
      }
    });

    // Create expenses table
    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id TEXT,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT DEFAULT 'عمومی',
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT DEFAULT 'admin',
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )
    `;

    this.db.run(createExpensesTable, (err) => {
      if (err) {
        console.error('Error creating expenses table:', err.message);
      } else {
        console.log('Expenses table ready.');
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

  // Chart data operations
  getMonthlyIncomeData(callback) {
    const sql = `
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(CAST(monthlyRent as INTEGER)) as income,
        COUNT(*) as contracts
      FROM contracts 
      WHERE status IN ('active', 'signed')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `;
    
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      // Format data for chart display
      const formattedData = rows.map(row => ({
        month: this.formatPersianMonth(row.month),
        income: parseInt(row.income) || 0,
        contracts: row.contracts
      })).reverse(); // Reverse to show chronological order
      
      callback(null, formattedData);
    });
  }

  getContractStatusData(callback) {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM contracts 
      GROUP BY status
    `;
    
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      // Format data for pie chart with Persian labels and colors
      const statusMap = {
        'active': { label: 'فعال', color: '#10B981' },
        'signed': { label: 'امضا شده', color: '#8B5CF6' },
        'pending': { label: 'در انتظار', color: '#F59E0B' },
        'terminated': { label: 'فسخ شده', color: '#EF4444' },
        'expired': { label: 'منقضی شده', color: '#6B7280' }
      };
      
      const formattedData = rows.map(row => ({
        status: row.status,
        count: row.count,
        label: statusMap[row.status]?.label || row.status,
        color: statusMap[row.status]?.color || '#6B7280'
      }));
      
      callback(null, formattedData);
    });
  }

  // Helper function to format month to Persian
  formatPersianMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    // Simple conversion - in a real app you'd want proper Jalali conversion
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex] || month} ${year}`;
  }

  // Initialize default notification settings
  initializeNotificationSettings() {
    const defaultSettings = [
      { service_name: 'email', enabled: 1, config: '{}' },
      { service_name: 'telegram', enabled: 0, config: '{}' },
      { service_name: 'whatsapp', enabled: 0, config: '{}' }
    ];

    defaultSettings.forEach(setting => {
      this.db.run(
        'INSERT OR IGNORE INTO notification_settings (service_name, enabled, config) VALUES (?, ?, ?)',
        [setting.service_name, setting.enabled, setting.config],
        (err) => {
          if (err) {
            console.error(`Error initializing ${setting.service_name} settings:`, err.message);
          }
        }
      );
    });
  }

  // Notification Settings Methods
  getNotificationSettings(callback) {
    const sql = 'SELECT * FROM notification_settings ORDER BY service_name';
    this.db.all(sql, [], callback);
  }

  updateNotificationSetting(serviceName, enabled, config, callback) {
    const sql = `
      UPDATE notification_settings 
      SET enabled = ?, config = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE service_name = ?
    `;
    this.db.run(sql, [enabled, JSON.stringify(config), serviceName], callback);
  }

  getNotificationSetting(serviceName, callback) {
    const sql = 'SELECT * FROM notification_settings WHERE service_name = ?';
    this.db.get(sql, [serviceName], callback);
  }

  // Expenses Methods
  addExpense(expenseData, callback) {
    const { contract_id, amount, description, category, date, created_by } = expenseData;
    const sql = `
      INSERT INTO expenses (contract_id, amount, description, category, date, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    this.db.run(sql, [contract_id, amount, description, category, date, created_by], function(err) {
      callback(err, err ? null : { id: this.lastID, ...expenseData });
    });
  }

  getExpenses(callback) {
    const sql = `
      SELECT e.*, c.contractNumber, c.tenantName 
      FROM expenses e
      LEFT JOIN contracts c ON e.contract_id = c.id
      ORDER BY e.date DESC, e.created_at DESC
    `;
    this.db.all(sql, [], callback);
  }

  getExpensesByContract(contractId, callback) {
    const sql = `
      SELECT e.*, c.contractNumber, c.tenantName 
      FROM expenses e
      LEFT JOIN contracts c ON e.contract_id = c.id
      WHERE e.contract_id = ?
      ORDER BY e.date DESC, e.created_at DESC
    `;
    this.db.all(sql, [contractId], callback);
  }

  getExpenseById(id, callback) {
    const sql = `
      SELECT e.*, c.contractNumber, c.tenantName 
      FROM expenses e
      LEFT JOIN contracts c ON e.contract_id = c.id
      WHERE e.id = ?
    `;
    this.db.get(sql, [id], callback);
  }

  updateExpense(id, expenseData, callback) {
    const { contract_id, amount, description, category, date } = expenseData;
    const sql = `
      UPDATE expenses 
      SET contract_id = ?, amount = ?, description = ?, category = ?, date = ?
      WHERE id = ?
    `;
    this.db.run(sql, [contract_id, amount, description, category, date, id], callback);
  }

  deleteExpense(id, callback) {
    const sql = 'DELETE FROM expenses WHERE id = ?';
    this.db.run(sql, [id], callback);
  }

  getExpensesSummary(callback) {
    const sql = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average
      FROM expenses 
      GROUP BY category
      ORDER BY total DESC
    `;
    this.db.all(sql, [], callback);
  }

  getMonthlyExpenses(callback) {
    const sql = `
      SELECT 
        strftime('%Y', date) as year,
        strftime('%m', date) as month,
        SUM(amount) as expenses,
        COUNT(*) as count
      FROM expenses 
      WHERE date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY year, month
    `;
    
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      // Format data for chart display
      const formattedData = rows.map(row => ({
        month: this.formatPersianMonth(`${row.year}-${row.month}`),
        expenses: parseInt(row.expenses) || 0,
        count: row.count
      })).reverse(); // Reverse to show chronological order
      
      callback(null, formattedData);
    });
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