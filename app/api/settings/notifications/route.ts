import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAuth } from '../../../../lib/auth'
import { handleOptions } from '../../../../lib/cors'

export const GET = requireAuth(async (request: NextRequest, payload) => {
  try {
    const result = await sql`
      SELECT * FROM notification_settings WHERE id = 1
    `
    
    const settings = result.rows[0] || {
      email_enabled: false,
      telegram_enabled: false,
      whatsapp_enabled: false
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات' }, 
      { status: 500 }
    )
  }
})

export const POST = requireAuth(async (request: NextRequest, payload) => {
  try {
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' }, 
        { status: 403 }
      )
    }
    
    const settings = await request.json()
    
    await sql`
      INSERT INTO notification_settings (
        id, email_enabled, telegram_enabled, whatsapp_enabled,
        telegram_chat_id, whatsapp_number, email_from, updated_at
      ) VALUES (
        1, ${settings.email_enabled}, ${settings.telegram_enabled}, ${settings.whatsapp_enabled},
        ${settings.telegram_chat_id || null}, ${settings.whatsapp_number || null}, 
        ${settings.email_from || null}, ${new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        email_enabled = EXCLUDED.email_enabled,
        telegram_enabled = EXCLUDED.telegram_enabled,
        whatsapp_enabled = EXCLUDED.whatsapp_enabled,
        telegram_chat_id = EXCLUDED.telegram_chat_id,
        whatsapp_number = EXCLUDED.whatsapp_number,
        email_from = EXCLUDED.email_from,
        updated_at = EXCLUDED.updated_at
    `
    
    return NextResponse.json({ success: true, message: 'تنظیمات با موفقیت ذخیره شد' })
  } catch (error) {
    console.error('Update notification settings error:', error)
    return NextResponse.json(
      { error: 'خطا در ذخیره تنظیمات' }, 
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return handleOptions()
}