import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { signToken, comparePassword } from '../../../lib/auth'
import { sendNotificationEmail } from '../../../lib/notifications'
import { handleOptions } from '../../../lib/cors'

export async function POST(request: NextRequest) {
  try {
    const { username, password, contractNumber, accessCode } = await request.json()
    
    if (username === 'admin') {
      // Admin login
      const result = await sql`
        SELECT * FROM users 
        WHERE username = ${username} AND role = 'admin'
      `
      
      const adminUser = result.rows[0]
      
      if (adminUser && await comparePassword(password, adminUser.password_hash)) {
        const token = signToken({
          userId: adminUser.id,
          role: 'admin'
        })
        
        return NextResponse.json({ 
          success: true, 
          token,
          user: { 
            id: adminUser.id, 
            username: adminUser.username, 
            role: 'admin' 
          }
        })
      }
    } else if (contractNumber && accessCode) {
      // Tenant login
      const result = await sql`
        SELECT * FROM contracts 
        WHERE contractNumber = ${contractNumber} 
        AND accessCode = ${accessCode} 
        AND status != 'terminated'
      `
      
      const contract = result.rows[0]
      
      if (contract) {
        const token = signToken({
          contractId: contract.id,
          role: 'tenant'
        })
        
        return NextResponse.json({ 
          success: true, 
          token,
          contract: { 
            id: contract.id, 
            contractNumber: contract.contractnumber 
          }
        })
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, 
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'خطا در ورود به سیستم' }, 
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return handleOptions()
}