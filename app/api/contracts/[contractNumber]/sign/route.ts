import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAuth } from '../../../../../lib/auth'
import { sendNotificationEmail, sendTelegramNotification } from '../../../../../lib/notifications'
import { handleOptions } from '../../../../../lib/cors'

export async function POST(
  request: NextRequest,
  { params }: { params: { contractNumber: string } }
) {
  return requireAuth(async (request: NextRequest, payload) => {
    try {
      if (payload.role !== 'tenant') {
        return NextResponse.json(
          { error: 'دسترسی غیرمجاز' }, 
          { status: 403 }
        )
      }
      
      const contractNumber = params.contractNumber
      const { signature, nationalIdImage } = await request.json()
      
      // Update contract with signature
      await sql`
        UPDATE contracts 
        SET signature = ${signature}, 
            nationalIdImage = ${nationalIdImage}, 
            status = 'signed', 
            signedAt = ${new Date().toISOString()}
        WHERE contractNumber = ${contractNumber}
      `
      
      // Get contract details for notification
      const result = await sql`
        SELECT * FROM contracts 
        WHERE contractNumber = ${contractNumber}
      `
      
      const contract = result.rows[0]
      
      // Send notification to landlord
      if (process.env.EMAIL_USER && contract && contract.landlordemail) {
        try {
          await sendNotificationEmail({
            to: contract.landlordemail,
            subject: 'قرارداد اجاره امضا شد',
            body: `قرارداد شماره ${contractNumber} توسط ${contract.tenantname} امضا شد.`
          })
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError)
        }
      }
      
      // Send Telegram notification if configured
      if (process.env.TELEGRAM_BOT_TOKEN) {
        try {
          await sendTelegramNotification(`قرارداد ${contractNumber} امضا شد`)
        } catch (telegramError) {
          console.error('Failed to send Telegram notification:', telegramError)
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'قرارداد با موفقیت امضا شد' 
      })
    } catch (error) {
      console.error('Sign contract error:', error)
      return NextResponse.json(
        { error: 'خطا در امضای قرارداد' }, 
        { status: 500 }
      )
    }
      })(request, payload)
}

export async function OPTIONS() {
  return handleOptions()
}