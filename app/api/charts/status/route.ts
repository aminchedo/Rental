import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdminAuth } from '../../../../lib/auth'
import { handleOptions } from '../../../../lib/cors'

export const GET = requireAdminAuth(async (request: NextRequest, payload) => {
  try {
    const result = await sql`
      SELECT status, COUNT(*) as count
      FROM contracts
      GROUP BY status
    `
    
    const statusLabels = {
      'draft': 'پیش‌نویس',
      'active': 'فعال', 
      'signed': 'امضا شده',
      'terminated': 'فسخ شده'
    }
    
    const formattedData = result.rows.map((row: any) => ({
      status: statusLabels[row.status as keyof typeof statusLabels] || row.status,
      count: parseInt(row.count)
    }))
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Get status data error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات وضعیت' }, 
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return handleOptions()
}