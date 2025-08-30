import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth, JWTPayload } from '../lib/auth';
import { sendNotificationEmail, sendTelegramNotification, sendWhatsAppNotification } from '../lib/notifications';

async function testNotifications(req: VercelRequest, payload: JWTPayload): Promise<Response> {
  try {
    const { type, recipient } = req.body;
    const testMessage = 'این یک پیام تست است - سیستم مدیریت اجاره';
    
    switch (type) {
      case 'email':
        if (!recipient) {
          return new Response(JSON.stringify({ error: 'آدرس ایمیل الزامی است' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        await sendNotificationEmail({
          to: recipient,
          subject: 'تست اعلان ایمیل',
          body: testMessage
        });
        break;
        
      case 'telegram':
        await sendTelegramNotification(testMessage);
        break;
        
      case 'whatsapp':
        await sendWhatsAppNotification(testMessage);
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'نوع اعلان نامعتبر است' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({ success: true, message: 'اعلان تست با موفقیت ارسال شد' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return new Response(JSON.stringify({ error: 'خطا در ارسال اعلان تست' }), {
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
    const response = await requireAdminAuth(testNotifications)(req);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Test notifications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}