import { sql } from '@vercel/postgres';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface Contract {
  id: string;
  contractnumber: string;
  accesscode: string;
  tenantname: string;
  tenantemail: string;
  tenantphone?: string;
  tenantnationalid?: string;
  landlordname: string;
  landlordemail: string;
  landlordnationalid?: string;
  propertyaddress: string;
  propertytype?: string;
  rentamount: string;
  deposit?: string;
  startdate: string;
  enddate: string;
  status: string;
  signature?: string;
  nationalidimage?: string;
  createdat: string;
  signedat?: string;
  propertysize?: string;
  propertyfeatures?: string;
  monthlyrent?: string;
  securitydeposit?: string;
  utilitiesincluded?: string;
  petpolicy?: string;
  smokingpolicy?: string;
  notes?: string;
}

export interface NotificationSettings {
  id: number;
  email_enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  telegram_chat_id?: string;
  whatsapp_number?: string;
  email_from?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  contract_id?: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
  receipt_image?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  contract_id?: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: number;
  contract_id?: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at?: string;
}

// Database connection helper
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql.query(text, params || []);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get a single row
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] : null;
}

// Helper function for INSERT/UPDATE/DELETE operations
export async function execute(text: string, params?: any[]): Promise<void> {
  try {
    await sql.query(text, params || []);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}