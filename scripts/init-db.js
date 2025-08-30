const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    console.log('Initializing Vercel Postgres database...');
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Contracts table
    await sql`
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
        deposit TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        signature TEXT,
        nationalIdImage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        signedAt TIMESTAMP,
        propertySize TEXT,
        propertyFeatures TEXT,
        monthlyRent TEXT,
        securityDeposit TEXT,
        utilitiesIncluded TEXT,
        petPolicy TEXT,
        smokingPolicy TEXT,
        notes TEXT
      )
    `;

    // Notification settings table
    await sql`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id SERIAL PRIMARY KEY,
        email_enabled BOOLEAN DEFAULT FALSE,
        telegram_enabled BOOLEAN DEFAULT FALSE,
        whatsapp_enabled BOOLEAN DEFAULT FALSE,
        telegram_chat_id TEXT,
        whatsapp_number TEXT,
        email_from TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        contract_id TEXT,
        amount DECIMAL NOT NULL,
        description TEXT,
        category TEXT,
        date TEXT NOT NULL,
        receipt_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )
    `;

    // Payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        contract_id TEXT,
        amount DECIMAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )
    `;

    // Maintenance requests table
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        contract_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts (id)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contracts_tenant_email ON contracts(tenantEmail)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(createdAt)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_contract_id ON expenses(contract_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_maintenance_contract_id ON maintenance_requests(contract_id)`;

    // Insert default admin user if not exists
    await sql`
      INSERT INTO users (username, password_hash, role) 
      VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      ON CONFLICT (username) DO NOTHING
    `;

    // Insert default notification settings if not exists
    await sql`
      INSERT INTO notification_settings (id, email_enabled, telegram_enabled, whatsapp_enabled) 
      VALUES (1, FALSE, FALSE, FALSE)
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };