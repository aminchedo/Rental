-- D1 Database Schema for Rental Management System
-- Migration from SQLite to Cloudflare D1

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  signedAt DATETIME,
  
  -- Additional fields for enhanced functionality
  propertySize TEXT,
  propertyFeatures TEXT,
  monthlyRent TEXT,
  securityDeposit TEXT,
  utilitiesIncluded TEXT,
  petPolicy TEXT,
  smokingPolicy TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_enabled BOOLEAN DEFAULT 0,
  telegram_enabled BOOLEAN DEFAULT 0, 
  whatsapp_enabled BOOLEAN DEFAULT 0,
  telegram_chat_id TEXT,
  whatsapp_number TEXT,
  email_from TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT,
  date TEXT NOT NULL,
  receipt_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT OR IGNORE INTO users (username, password_hash, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert default notification settings
INSERT OR IGNORE INTO notification_settings (id, email_enabled, telegram_enabled, whatsapp_enabled) VALUES 
(1, 0, 0, 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_email ON contracts(tenantEmail);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(createdAt);
CREATE INDEX IF NOT EXISTS idx_expenses_contract_id ON expenses(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_contract_id ON maintenance_requests(contract_id);

-- Create views for common queries
CREATE VIEW IF NOT EXISTS contract_summary AS
SELECT 
  c.id,
  c.contractNumber,
  c.tenantName,
  c.landlordName,
  c.propertyAddress,
  c.rentAmount,
  c.status,
  c.createdAt,
  c.signedAt,
  COUNT(p.id) as payment_count,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_paid
FROM contracts c
LEFT JOIN payments p ON c.id = p.contract_id
GROUP BY c.id;

CREATE VIEW IF NOT EXISTS monthly_income AS
SELECT 
  strftime('%Y-%m', createdAt) as month,
  COUNT(*) as contract_count,
  SUM(CAST(rentAmount as REAL)) as total_rent,
  AVG(CAST(rentAmount as REAL)) as avg_rent
FROM contracts 
WHERE status IN ('signed', 'active')
GROUP BY strftime('%Y-%m', createdAt);