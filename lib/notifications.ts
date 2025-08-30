// Notification utilities for Vercel environment

export interface EmailOptions {
  to: string
  subject: string
  body: string
}

export async function sendNotificationEmail({ to, subject, body }: EmailOptions): Promise<void> {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  
  if (!emailUser || !emailPass) {
    console.warn('Email not configured - skipping email notification')
    return
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailPass}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailUser,
        to: [to],
        subject: subject,
        text: body,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }
    
    console.log(`Email sent to ${to}: ${subject}`)
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function sendTelegramNotification(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || '@your_channel'
  
  if (!botToken) {
    console.warn('Telegram not configured - skipping Telegram notification')
    return
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
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }
    
    console.log(`Telegram notification sent: ${message}`)
  } catch (error) {
    console.error('Telegram sending error:', error)
    throw error
  }
}

export async function sendWhatsAppNotification(message: string): Promise<void> {
  const accountSid = process.env.WHATSAPP_ACCOUNT_SID
  const authToken = process.env.WHATSAPP_AUTH_TOKEN
  const toNumber = process.env.WHATSAPP_TO_NUMBER || '+your_number'
  
  if (!accountSid || !authToken) {
    console.warn('WhatsApp not configured - skipping WhatsApp notification')
    return
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
        To: `whatsapp:${toNumber}`,
        Body: message,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }
    
    console.log(`WhatsApp notification sent: ${message}`)
  } catch (error) {
    console.error('WhatsApp sending error:', error)
    throw error
  }
}