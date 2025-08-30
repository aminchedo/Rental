import { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne, execute } from '../lib/db';
import { requireAdminAuth, JWTPayload } from '../lib/auth';

async function getNotificationSettings(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    const settings = await queryOne('SELECT * FROM notification_settings WHERE id = 1');
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return new Response(JSON.stringify({ error: 'خطا در دریافت تنظیمات اعلان‌ها' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateNotificationSettings(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    const settings = req.body;
    
    await execute(`
      UPDATE notification_settings 
      SET email_enabled = $1, telegram_enabled = $2, whatsapp_enabled = $3,
          telegram_chat_id = $4, whatsapp_number = $5, email_from = $6,
          updated_at = $7
      WHERE id = 1
    `, [
      settings.email_enabled,
      settings.telegram_enabled,
      settings.whatsapp_enabled,
      settings.telegram_chat_id,
      settings.whatsapp_number,
      settings.email_from,
      new Date().toISOString()
    ]);
    
    return new Response(JSON.stringify({ success: true, message: 'تنظیمات با موفقیت به‌روزرسانی شد' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return new Response(JSON.stringify({ error: 'خطا در به‌روزرسانی تنظیمات' }), {
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
      const response = await requireAdminAuth(getNotificationSettings)(req);
      const data = await response.json();
      return res.status(response.status).json(data);
    } else if (req.method === 'PUT') {
      const response = await requireAdminAuth(updateNotificationSettings)(req);
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notification settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}