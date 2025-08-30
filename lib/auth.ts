import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId?: number
  contractId?: string
  role: 'admin' | 'tenant'
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  return jwt.sign(payload, secret, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function requireAuth(handler: (request: NextRequest, payload: JWTPayload) => Promise<Response>) {
  return async (request: NextRequest) => {
    try {
      const token = extractTokenFromRequest(request)
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'دسترسی غیرمجاز' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      const payload = verifyToken(token)
      return handler(request, payload)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'دسترسی غیرمجاز' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

export function requireAdminAuth(handler: (request: NextRequest, payload: JWTPayload) => Promise<Response>) {
  return requireAuth(async (request: NextRequest, payload: JWTPayload) => {
    if (payload.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'دسترسی غیرمجاز - تنها ادمین' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return handler(request, payload)
  })
}