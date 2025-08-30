import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAuth } from '../../../lib/auth'
import { sendNotificationEmail } from '../../../lib/notifications'
import { handleOptions } from '../../../lib/cors'

export const GET = requireAuth(async (request: NextRequest, payload) => {
  try {
    if (payload.role === 'admin') {
      const result = await sql`
        SELECT * FROM contracts 
        ORDER BY createdAt DESC
      `
      return NextResponse.json(result.rows)
    } else if (payload.role === 'tenant') {
      const result = await sql`
        SELECT * FROM contracts 
        WHERE id = ${payload.contractId}
      `
      return NextResponse.json(result.rows)
    }
    
    return NextResponse.json(
      { error: 'دسترسی غیرمجاز' }, 
      { status: 403 }
    )
  } catch (error) {
    console.error('Get contracts error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت قراردادها' }, 
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
    
    const contractData = await request.json()
    
    // Generate unique contract number and access code
    const contractNumber = `RNT${Date.now()}`
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString()
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await sql`
      INSERT INTO contracts (
        id, contractNumber, tenantName, tenantEmail, tenantNationalId,
        landlordName, landlordEmail, landlordNationalId,
        propertyAddress, rentAmount, deposit, startDate, endDate,
        accessCode, status, createdAt
      ) VALUES (
        ${contractId},
        ${contractNumber},
        ${contractData.tenantName},
        ${contractData.tenantEmail},
        ${contractData.tenantNationalId || null},
        ${contractData.landlordName},
        ${contractData.landlordEmail},
        ${contractData.landlordNationalId || null},
        ${contractData.propertyAddress},
        ${contractData.rentAmount},
        ${contractData.deposit || null},
        ${contractData.startDate},
        ${contractData.endDate},
        ${accessCode},
        'draft',
        ${new Date().toISOString()}
      )
    `
    
    // Send access code via email if configured
    if (process.env.EMAIL_USER && contractData.tenantEmail) {
      try {
        await sendNotificationEmail({
          to: contractData.tenantEmail,
          subject: 'کد دسترسی قرارداد اجاره',
          body: `کد دسترسی شما: ${accessCode}\nشماره قرارداد: ${contractNumber}`
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Continue execution even if email fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      contractNumber, 
      accessCode,
      id: contractId 
    })
  } catch (error) {
    console.error('Create contract error:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد قرارداد' }, 
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return handleOptions()
}