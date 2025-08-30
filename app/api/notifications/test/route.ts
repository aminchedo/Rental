import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../lib/auth'
import { sendNotificationEmail, sendTelegramNotification, sendWhatsAppNotification } from '../../../../lib/notifications'
import { handleOptions } from '../../../../lib/cors'

export const POST = requireAuth(async (request: NextRequest, payload) => {
  try {
    const { service } = await request.json()
    
    switch (service) {
      case 'email':
        if (!process.env.EMAIL_USER) {
          throw new Error('Email not configured')
        }
        await sendNotificationEmail({
          to: process.env.EMAIL_USER,
          subject: 'تست اتصال ایمیل',
          body: 'این یک پیام تست است.'
        })
        break
        
      case 'telegram':
        if (!process.env.TELEGRAM_BOT_TOKEN) {
          throw new Error('Telegram not configured')
        }
        await sendTelegramNotification('تست اتصال تلگرام')
        break
        
      case 'whatsapp':
        if (!process.env.WHATSAPP_ACCOUNT_SID) {
          throw new Error('WhatsApp not configured')
        }
        await sendWhatsAppNotification('تست اتصال واتساپ')
        break
        
      default:
        throw new Error('Unknown service')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'تست با موفقیت انجام شد' 
    })
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return handleOptions()
}