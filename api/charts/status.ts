import { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';
import { requireAdminAuth, JWTPayload } from '../lib/auth';

async function getStatusData(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    const statusData = await query(`
      SELECT status, COUNT(*) as count
      FROM contracts
      GROUP BY status
    `);
    
    const statusLabels = {
      'draft': 'پیش‌نویس',
      'active': 'فعال', 
      'signed': 'امضا شده',
      'terminated': 'فسخ شده'
    };
    
    const formattedData = statusData.map((row: any) => ({
      status: statusLabels[row.status as keyof typeof statusLabels] || row.status,
      count: row.count
    }));
    
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get status data error:', error);
    return new Response(JSON.stringify({ error: 'خطا در دریافت اطلاعات وضعیت' }), {
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await requireAdminAuth(getStatusData)(req);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Status chart API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}