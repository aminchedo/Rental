import { VercelRequest, VercelResponse } from '@vercel/node';
import { query, queryOne, execute } from '../lib/db';
import { requireAuth, requireAdminAuth, JWTPayload } from '../lib/auth';
import { sendNotificationEmail } from '../lib/notifications';

async function getContracts(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    if (payload.role === 'admin') {
      const contracts = await query('SELECT * FROM contracts ORDER BY createdAt DESC');
      return new Response(JSON.stringify(contracts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (payload.role === 'tenant') {
      const contract = await queryOne('SELECT * FROM contracts WHERE id = $1', [payload.contractId]);
      return new Response(JSON.stringify([contract]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    return new Response(JSON.stringify({ error: 'خطا در دریافت قراردادها' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function createContract(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    if (payload.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const contractData = req.body;
    
    // Generate unique contract number and access code
    const contractNumber = `RNT${Date.now()}`;
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await execute(`
      INSERT INTO contracts (
        id, contractNumber, tenantName, tenantEmail, tenantNationalId,
        landlordName, landlordEmail, landlordNationalId,
        propertyAddress, rentAmount, deposit, startDate, endDate,
        accessCode, status, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      contractId,
      contractNumber,
      contractData.tenantName,
      contractData.tenantEmail, 
      contractData.tenantNationalId,
      contractData.landlordName,
      contractData.landlordEmail,
      contractData.landlordNationalId,
      contractData.propertyAddress,
      contractData.rentAmount,
      contractData.deposit,
      contractData.startDate,
      contractData.endDate,
      accessCode,
      'draft',
      new Date().toISOString()
    ]);
    
    // Send access code via email if configured
    if (process.env.EMAIL_USER && contractData.tenantEmail) {
      await sendNotificationEmail({
        to: contractData.tenantEmail,
        subject: 'کد دسترسی قرارداد اجاره',
        body: `کد دسترسی شما: ${accessCode}\nشماره قرارداد: ${contractNumber}`
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      contractNumber, 
      accessCode,
      id: contractId 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create contract error:', error);
    return new Response(JSON.stringify({ error: 'خطا در ایجاد قرارداد' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const response = await requireAuth(getContracts)(req);
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'POST') {
      const response = await requireAdminAuth(createContract)(req);
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Contracts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}