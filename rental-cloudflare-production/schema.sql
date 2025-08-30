-- Enhanced D1 Database Schema for Professional Rental Management System
-- Production-ready schema with comprehensive features and security

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table with comprehensive fields
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contractNumber TEXT UNIQUE NOT NULL,
  accessCode TEXT NOT NULL,
  
  -- Tenant information
  tenantName TEXT NOT NULL,
  tenantEmail TEXT NOT NULL,
  tenantPhone TEXT,
  tenantNationalId TEXT,
  
  -- Landlord information
  landlordName TEXT NOT NULL,
  landlordEmail TEXT NOT NULL,
  landlordPhone TEXT,
  landlordNationalId TEXT,
  
  -- Property details
  propertyAddress TEXT NOT NULL,
  propertyType TEXT DEFAULT 'مسکونی',
  propertySize TEXT,
  propertyFeatures TEXT,
  
  -- Financial terms
  rentAmount TEXT NOT NULL,
  deposit TEXT DEFAULT '0',
  securityDeposit TEXT,
  monthlyRent TEXT,
  
  -- Contract terms
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  
  -- Additional terms
  utilitiesIncluded TEXT,
  petPolicy TEXT DEFAULT 'مجاز نیست',
  smokingPolicy TEXT DEFAULT 'مجاز نیست',
  notes TEXT,
  
  -- Status and signatures
  status TEXT DEFAULT 'draft',
  signature TEXT,
  nationalIdImage TEXT,
  
  -- Timestamps
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  signedAt DATETIME,
  deletedAt DATETIME,
  
  -- Metadata
  created_by INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  
  FOREIGN KEY (created_by) REFERENCES users (id)
);

-- Enhanced notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_enabled BOOLEAN DEFAULT 0,
  telegram_enabled BOOLEAN DEFAULT 0, 
  whatsapp_enabled BOOLEAN DEFAULT 0,
  
  -- Service configurations
  email_from TEXT,
  telegram_chat_id TEXT,
  telegram_bot_username TEXT,
  whatsapp_number TEXT,
  
  -- Notification preferences
  notify_on_contract_created BOOLEAN DEFAULT 1,
  notify_on_contract_signed BOOLEAN DEFAULT 1,
  notify_on_contract_expired BOOLEAN DEFAULT 1,
  notify_on_payment_due BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expenses tracking
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date TEXT NOT NULL,
  receipt_image TEXT,
  approved BOOLEAN DEFAULT 0,
  approved_by INTEGER,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contract_id) REFERENCES contracts (id),
  FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- Payments tracking
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  due_date TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  notes TEXT,
  late_fee REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Maintenance requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  estimated_cost REAL,
  actual_cost REAL,
  assigned_to TEXT,
  photos TEXT, -- JSON array of photo URLs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Comprehensive audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  contract_id TEXT,
  action TEXT NOT NULL,
  details TEXT, -- JSON data
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (contract_id) REFERENCES contracts (id)
);

-- Document storage metadata
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  document_type TEXT, -- 'contract', 'id_card', 'receipt', etc.
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contract_id) REFERENCES contracts (id),
  FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  app_name TEXT DEFAULT 'سیستم مدیریت املاک',
  app_version TEXT DEFAULT '2.0.0',
  default_currency TEXT DEFAULT 'تومان',
  default_locale TEXT DEFAULT 'fa-IR',
  timezone TEXT DEFAULT 'Asia/Tehran',
  
  -- Business settings
  late_payment_fee_percentage REAL DEFAULT 5.0,
  contract_renewal_notice_days INTEGER DEFAULT 30,
  payment_due_notice_days INTEGER DEFAULT 3,
  
  -- Security settings
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  session_timeout_hours INTEGER DEFAULT 24,
  
  -- Feature flags
  enable_online_payments BOOLEAN DEFAULT 0,
  enable_maintenance_requests BOOLEAN DEFAULT 1,
  enable_document_upload BOOLEAN DEFAULT 1,
  enable_notifications BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
-- Password: Admin@123! (hashed with bcrypt)
INSERT OR IGNORE INTO users (username, password_hash, full_name, email, role, active) VALUES 
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6uk6L7Q1NO', 'مدیر سیستم', 'admin@rental-system.com', 'admin', 1);

-- Insert default notification settings
INSERT OR IGNORE INTO notification_settings (id, email_enabled, telegram_enabled, whatsapp_enabled) VALUES 
(1, 0, 0, 0);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (id) VALUES (1);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_email ON contracts(tenantEmail);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(createdAt);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contractNumber);
CREATE INDEX IF NOT EXISTS idx_contracts_access_code ON contracts(accessCode);

CREATE INDEX IF NOT EXISTS idx_expenses_contract_id ON expenses(contract_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_contract_id ON maintenance_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_contract_id ON audit_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_documents_contract_id ON documents(contract_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Create views for common queries
CREATE VIEW IF NOT EXISTS contract_summary AS
SELECT 
  c.id,
  c.contractNumber,
  c.tenantName,
  c.tenantEmail,
  c.landlordName,
  c.propertyAddress,
  c.rentAmount,
  c.status,
  c.createdAt,
  c.signedAt,
  c.startDate,
  c.endDate,
  COUNT(p.id) as payment_count,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_paid,
  SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as total_pending,
  COUNT(m.id) as maintenance_requests,
  COUNT(d.id) as document_count
FROM contracts c
LEFT JOIN payments p ON c.id = p.contract_id
LEFT JOIN maintenance_requests m ON c.id = m.contract_id
LEFT JOIN documents d ON c.id = d.contract_id
WHERE c.status != 'deleted'
GROUP BY c.id;

CREATE VIEW IF NOT EXISTS monthly_income AS
SELECT 
  strftime('%Y-%m', createdAt) as month,
  strftime('%Y', createdAt) as year,
  strftime('%m', createdAt) as month_num,
  COUNT(*) as contract_count,
  SUM(CAST(rentAmount as REAL)) as total_rent,
  AVG(CAST(rentAmount as REAL)) as avg_rent,
  COUNT(CASE WHEN status = 'signed' THEN 1 END) as signed_contracts,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts
FROM contracts 
WHERE status IN ('signed', 'active') AND status != 'deleted'
GROUP BY strftime('%Y-%m', createdAt)
ORDER BY month DESC;

CREATE VIEW IF NOT EXISTS payment_summary AS
SELECT 
  p.*,
  c.contractNumber,
  c.tenantName,
  c.propertyAddress,
  CASE 
    WHEN p.due_date < date('now') AND p.status = 'pending' THEN 1 
    ELSE 0 
  END as is_overdue,
  CASE 
    WHEN p.due_date BETWEEN date('now') AND date('now', '+3 days') AND p.status = 'pending' THEN 1 
    ELSE 0 
  END as is_due_soon
FROM payments p
JOIN contracts c ON p.contract_id = c.id
WHERE c.status != 'deleted';

CREATE VIEW IF NOT EXISTS maintenance_summary AS
SELECT 
  m.*,
  c.contractNumber,
  c.tenantName,
  c.propertyAddress,
  c.tenantPhone,
  julianday('now') - julianday(m.created_at) as days_open
FROM maintenance_requests m
JOIN contracts c ON m.contract_id = c.id
WHERE c.status != 'deleted';

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_contracts_timestamp 
AFTER UPDATE ON contracts
BEGIN
  UPDATE contracts SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_expenses_timestamp 
AFTER UPDATE ON expenses
BEGIN
  UPDATE expenses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_payments_timestamp 
AFTER UPDATE ON payments
BEGIN
  UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_maintenance_timestamp 
AFTER UPDATE ON maintenance_requests
BEGIN
  UPDATE maintenance_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to automatically create audit log entries
CREATE TRIGGER IF NOT EXISTS audit_contract_changes 
AFTER UPDATE ON contracts
BEGIN
  INSERT INTO audit_logs (contract_id, action, details, created_at)
  VALUES (NEW.id, 'contract_updated', 
    json_object(
      'old_status', OLD.status,
      'new_status', NEW.status,
      'updated_fields', 'auto_detected'
    ), 
    CURRENT_TIMESTAMP);
END;

-- Sample data for testing (optional - remove in production)
-- INSERT INTO contracts (
--   id, contractNumber, accessCode, tenantName, tenantEmail, 
--   landlordName, landlordEmail, propertyAddress, rentAmount, 
--   startDate, endDate, status, createdAt
-- ) VALUES 
-- ('sample_1', 'RNT1000001', '123456', 'احمد محمدی', 'ahmad@example.com',
--  'علی رضایی', 'ali@example.com', 'تهران، خیابان ولیعصر', '15000000',
--  '2024-01-01', '2024-12-31', 'active', CURRENT_TIMESTAMP);

-- Final optimizations
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000;
PRAGMA temp_store = memory;