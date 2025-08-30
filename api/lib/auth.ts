import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { VercelRequest } from '@vercel/node';

export interface JWTPayload {
  userId?: number;
  contractId?: string;
  role: 'admin' | 'tenant';
  iat?: number;
  exp?: number;
}

export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

export function verifyJWT(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.verify(token, secret) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAuthToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAuth(handler: (req: VercelRequest, payload: JWTPayload) => Promise<Response>) {
  return async (req: VercelRequest): Promise<Response> => {
    try {
      const token = getAuthToken(req);
      if (!token) {
        return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const payload = verifyJWT(token);
      return handler(req, payload);
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

export function requireAdminAuth(handler: (req: VercelRequest, payload: JWTPayload) => Promise<Response>) {
  return requireAuth(async (req: VercelRequest, payload: JWTPayload) => {
    if (payload.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'دسترسی غیرمجاز' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handler(req, payload);
  });
}