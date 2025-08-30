import { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne, execute } from '../../lib/db';
import { requireAuth, JWTPayload } from '../../lib/auth';
import { sendNotificationEmail, sendTelegramNotification } from '../../lib/notifications';

async function signContract(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    if (payload.role !== 'tenant') {
      return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const contractNumber = req.query.contractNumber as string;
    const { signature, nationalIdImage } = req.body;
    
    // Update contract with signature
    await execute(`
      UPDATE contracts 
      SET signature = $1, nationalIdImage = $2, status = 'signed', signedAt = $3
      WHERE contractNumber = $4
    `, [signature, nationalIdImage, new Date().toISOString(), contractNumber]);
    
    // Get contract details for notification
    const contract = await queryOne(
      'SELECT * FROM contracts WHERE contractNumber = $1',
      [contractNumber]
    );
    
    // Send notification to landlord
    if (process.env.EMAIL_USER && contract && contract.landlordemail) {
      await sendNotificationEmail({
        to: contract.landlordemail,
        subject: 'قرارداد اجاره امضا شد',
        body: `قرارداد شماره ${contractNumber} توسط ${contract.tenantname} امضا شد.`
      });
    }
    
    // Send Telegram notification if configured
    if (process.env.TELEGRAM_BOT_TOKEN) {
      await sendTelegramNotification(`قرارداد ${contractNumber} امضا شد`);
    }
    
    return new Response(JSON.stringify({ success: true, message: 'قرارداد با موفقیت امضا شد' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    return new Response(JSON.stringify({ error: 'خطا در امضای قرارداد' }), {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await requireAuth(signContract)(req);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Sign contract API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}