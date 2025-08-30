import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { requireAdminAuth } from '../../../../lib/auth'
import { handleOptions } from '../../../../lib/cors'

export const GET = requireAdminAuth(async (request: NextRequest, payload) => {
  try {
    const result = await sql`
      SELECT 
        TO_CHAR(createdAt, 'YYYY-MM') as month,
        SUM(CAST(rentAmount as DECIMAL)) as income,
        COUNT(*) as contracts
      FROM contracts 
      WHERE status = 'signed'
      GROUP BY TO_CHAR(createdAt, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `
    
    const persianMonths = {
      '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد',
      '04': 'تیر', '05': 'مرداد', '06': 'شهریور',
      '07': 'مهر', '08': 'آبان', '09': 'آذر',
      '10': 'دی', '11': 'بهمن', '12': 'اسفند'
    }
    
    const formattedData = result.rows.map((row: any) => ({
      month: persianMonths[row.month.split('-')[1] as keyof typeof persianMonths] + ' ' + row.month.split('-')[0],
      income: parseFloat(row.income) || 0,
      contracts: row.contracts
    }))
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Get income data error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات درآمد' }, 
      { status: 500 }
    )
  }
})

export async function OPTIONS() {
  return handleOptions()
}