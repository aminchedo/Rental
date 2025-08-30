import { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';
import { requireAdminAuth, JWTPayload } from '../lib/auth';

async function getIncomeData(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    const incomeData = await query(`
      SELECT 
        TO_CHAR(createdAt, 'YYYY-MM') as month,
        SUM(CAST(rentAmount as DECIMAL)) as income,
        COUNT(*) as contracts
      FROM contracts 
      WHERE status = 'signed'
      GROUP BY TO_CHAR(createdAt, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    const persianMonths = {
      '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد',
      '04': 'تیر', '05': 'مرداد', '06': 'شهریور',
      '07': 'مهر', '08': 'آبان', '09': 'آذر',
      '10': 'دی', '11': 'بهمن', '12': 'اسفند'
    };
    
    const formattedData = incomeData.map((row: any) => ({
      month: persianMonths[row.month.split('-')[1] as keyof typeof persianMonths] + ' ' + row.month.split('-')[0],
      income: row.income || 0,
      contracts: row.contracts
    }));
    
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get income data error:', error);
    return new Response(JSON.stringify({ error: 'خطا در دریافت اطلاعات درآمد' }), {
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
    const response = await requireAdminAuth(getIncomeData)(req);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Income chart API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}