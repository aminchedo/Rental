-- PostgreSQL Migration Script for Rental Management System
-- Migrating from Cloudflare D1/SQLite to Vercel Postgres

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS contract_summary CASCADE;
DROP VIEW IF EXISTS monthly_income CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contracts table
CREATE TABLE contracts (
  id VARCHAR(255) PRIMARY KEY,
  contractNumber VARCHAR(255) UNIQUE NOT NULL,
  accessCode VARCHAR(255) NOT NULL,
  tenantName VARCHAR(255) NOT NULL,
  tenantEmail VARCHAR(255) NOT NULL,
  tenantPhone VARCHAR(255),
  tenantNationalId VARCHAR(255),
  landlordName VARCHAR(255) NOT NULL,
  landlordEmail VARCHAR(255) NOT NULL,
  landlordNationalId VARCHAR(255),
  propertyAddress TEXT NOT NULL,
  propertyType VARCHAR(255),
  rentAmount VARCHAR(255) NOT NULL,
  deposit VARCHAR(255),
  startDate VARCHAR(255) NOT NULL,
  endDate VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  signature TEXT,
  nationalIdImage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signedAt TIMESTAMP,
  
  -- Additional fields for enhanced functionality
  propertySize VARCHAR(255),
  propertyFeatures TEXT,
  monthlyRent VARCHAR(255),
  securityDeposit VARCHAR(255),
  utilitiesIncluded TEXT,
  petPolicy TEXT,
  smokingPolicy TEXT,
  notes TEXT
);

-- Create notification_settings table
CREATE TABLE notification_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_enabled BOOLEAN DEFAULT FALSE,
  telegram_enabled BOOLEAN DEFAULT FALSE, 
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  telegram_chat_id VARCHAR(255),
  whatsapp_number VARCHAR(255),
  email_from VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  contract_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  date VARCHAR(255) NOT NULL,
  receipt_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  contract_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_date VARCHAR(255) NOT NULL,
  payment_method VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);

-- Create maintenance_requests table
CREATE TABLE maintenance_requests (
  id SERIAL PRIMARY KEY,
  contract_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default notification settings
INSERT INTO notification_settings (id, email_enabled, telegram_enabled, whatsapp_enabled) VALUES 
(1, FALSE, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_email ON contracts(tenantEmail);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(createdAt);
CREATE INDEX IF NOT EXISTS idx_expenses_contract_id ON expenses(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_contract_id ON maintenance_requests(contract_id);

-- Create views for common queries (PostgreSQL syntax)
CREATE VIEW contract_summary AS
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
GROUP BY c.id, c.contractNumber, c.tenantName, c.landlordName, c.propertyAddress, c.rentAmount, c.status, c.createdAt, c.signedAt;

CREATE VIEW monthly_income AS
SELECT 
  TO_CHAR(createdAt, 'YYYY-MM') as month,
  COUNT(*) as contract_count,
  SUM(CAST(rentAmount as DECIMAL)) as total_rent,
  AVG(CAST(rentAmount as DECIMAL)) as avg_rent
FROM contracts 
WHERE status IN ('signed', 'active')
GROUP BY TO_CHAR(createdAt, 'YYYY-MM');