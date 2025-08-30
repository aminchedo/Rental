import { NextResponse } from 'next/server'
import { handleOptions } from '../../../lib/cors'

export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  })
}

export async function OPTIONS() {
  return handleOptions()
}