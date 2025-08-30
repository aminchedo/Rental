// Notification utilities for Vercel environment

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export async function sendNotificationEmail(emailData: EmailData): Promise<void> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.log('Email credentials not configured, skipping email notification');
    return;
  }

  try {
    // Using a simple SMTP approach - you might want to use SendGrid, Resend, or similar
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'your_service_id',
        template_id: 'your_template_id',
        user_id: emailUser,
        template_params: {
          to_email: emailData.to,
          subject: emailData.subject,
          message: emailData.body,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    console.log(`Email notification sent to: ${emailData.to}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export async function sendTelegramNotification(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured, skipping Telegram notification');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    console.log(`Telegram notification sent: ${message}`);
  } catch (error) {
    console.error('Telegram sending error:', error);
  }
}

export async function sendWhatsAppNotification(message: string): Promise<void> {
  const accountSid = process.env.WHATSAPP_ACCOUNT_SID;
  const authToken = process.env.WHATSAPP_AUTH_TOKEN;
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  
  if (!accountSid || !authToken || !whatsappNumber) {
    console.log('WhatsApp credentials not configured, skipping WhatsApp notification');
    return;
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886', // Twilio WhatsApp number
        To: `whatsapp:${whatsappNumber}`,
        Body: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    console.log(`WhatsApp notification sent: ${message}`);
  } catch (error) {
    console.error('WhatsApp sending error:', error);
  }
}