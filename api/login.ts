import { VercelRequest, VercelResponse } from '@vercel/node';
import { queryOne } from './lib/db';
import { signJWT, comparePassword } from './lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, contractNumber, accessCode } = req.body;
    
    if (username === 'admin') {
      // Admin login
      const adminUser = await queryOne(
        'SELECT * FROM users WHERE username = $1 AND role = $2',
        [username, 'admin']
      );
      
      if (adminUser && await comparePassword(password, adminUser.password_hash)) {
        const token = signJWT({
          userId: adminUser.id,
          role: 'admin'
        });
        
        return res.status(200).json({ 
          success: true, 
          token,
          user: { id: adminUser.id, username: adminUser.username, role: 'admin' }
        });
      }
    } else if (contractNumber && accessCode) {
      // Tenant login
      const contract = await queryOne(
        'SELECT * FROM contracts WHERE contractNumber = $1 AND accessCode = $2 AND status != $3',
        [contractNumber, accessCode, 'terminated']
      );
      
      if (contract) {
        const token = signJWT({
          contractId: contract.id,
          role: 'tenant'
        });
        
        return res.status(200).json({ 
          success: true, 
          token,
          contract: { id: contract.id, contractNumber: contract.contractnumber }
        });
      }
    }
    
    return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'خطا در ورود به سیستم' });
  }
}