import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'

interface Env {
  DB: D1Database
  RENTAL_KV: KVNamespace
  TELEGRAM_BOT_TOKEN?: string
  WHATSAPP_ACCOUNT_SID?: string
  WHATSAPP_AUTH_TOKEN?: string
  EMAIL_USER?: string
  EMAIL_PASS?: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration for Persian RTL frontend
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.pages.dev'],
  credentials: true
}))

// Authentication middleware
const auth = jwt({ secret: async (c) => c.env.JWT_SECRET })

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Authentication endpoints
app.post('/api/login', async (c) => {
  try {
    const { username, password, contractNumber, accessCode } = await c.req.json()
    
    if (username === 'admin') {
      // Admin login
      const adminUser = await c.env.DB.prepare(
        'SELECT * FROM users WHERE username = ? AND role = ?'
      ).bind(username, 'admin').first()
      
      if (adminUser && await bcrypt.compare(password, adminUser.password_hash)) {
        const token = await jwt.sign(
          { userId: adminUser.id, role: 'admin' },
          c.env.JWT_SECRET
        )
        return c.json({ 
          success: true, 
          token,
          user: { id: adminUser.id, username: adminUser.username, role: 'admin' }
        })
      }
    } else if (contractNumber && accessCode) {
      // Tenant login
      const contract = await c.env.DB.prepare(
        'SELECT * FROM contracts WHERE contractNumber = ? AND accessCode = ? AND status != ?'
      ).bind(contractNumber, accessCode, 'terminated').first()
      
      if (contract) {
        const token = await jwt.sign(
          { contractId: contract.id, role: 'tenant' },
          c.env.JWT_SECRET
        )
        return c.json({ 
          success: true, 
          token,
          contract: { id: contract.id, contractNumber: contract.contractNumber }
        })
      }
    }
    
    return c.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, 401)
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, message: 'خطا در ورود به سیستم' }, 500)
  }
})

// Contract management endpoints
app.get('/api/contracts', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role === 'admin') {
      const contracts = await c.env.DB.prepare('SELECT * FROM contracts ORDER BY createdAt DESC').all()
      return c.json(contracts.results)
    } else if (payload.role === 'tenant') {
      const contract = await c.env.DB.prepare('SELECT * FROM contracts WHERE id = ?').bind(payload.contractId).first()
      return c.json([contract])
    }
    
    return c.json({ error: 'دسترسی غیرمجاز' }, 403)
  } catch (error) {
    console.error('Get contracts error:', error)
    return c.json({ error: 'خطا در دریافت قراردادها' }, 500)
  }
})

app.post('/api/contracts', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const contractData = await c.req.json()
    
    // Generate unique contract number and access code
    const contractNumber = `RNT${Date.now()}`
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString()
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = await c.env.DB.prepare(`
      INSERT INTO contracts (
        id, contractNumber, tenantName, tenantEmail, tenantNationalId,
        landlordName, landlordEmail, landlordNationalId,
        propertyAddress, rentAmount, deposit, startDate, endDate,
        accessCode, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contractId,
      contractNumber,
      contractData.tenantName,
      contractData.tenantEmail, 
      contractData.tenantNationalId,
      contractData.landlordName,
      contractData.landlordEmail,
      contractData.landlordNationalId,
      contractData.propertyAddress,
      contractData.rentAmount,
      contractData.deposit,
      contractData.startDate,
      contractData.endDate,
      accessCode,
      'draft',
      new Date().toISOString()
    ).run()
    
    // Send access code via email if configured
    if (c.env.EMAIL_USER && contractData.tenantEmail) {
      await sendNotificationEmail(c.env, {
        to: contractData.tenantEmail,
        subject: 'کد دسترسی قرارداد اجاره',
        body: `کد دسترسی شما: ${accessCode}\nشماره قرارداد: ${contractNumber}`
      })
    }
    
    return c.json({ 
      success: true, 
      contractNumber, 
      accessCode,
      id: contractId 
    })
  } catch (error) {
    console.error('Create contract error:', error)
    return c.json({ error: 'خطا در ایجاد قرارداد' }, 500)
  }
})

app.post('/api/contracts/:contractNumber/sign', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const contractNumber = c.req.param('contractNumber')
    const { signature, nationalIdImage } = await c.req.json()
    
    if (payload.role !== 'tenant') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    // Update contract with signature
    await c.env.DB.prepare(`
      UPDATE contracts 
      SET signature = ?, nationalIdImage = ?, status = 'signed', signedAt = ?
      WHERE contractNumber = ?
    `).bind(signature, nationalIdImage, new Date().toISOString(), contractNumber).run()
    
    // Get contract details for notification
    const contract = await c.env.DB.prepare(
      'SELECT * FROM contracts WHERE contractNumber = ?'
    ).bind(contractNumber).first()
    
    // Send notification to landlord
    if (c.env.EMAIL_USER && contract.landlordEmail) {
      await sendNotificationEmail(c.env, {
        to: contract.landlordEmail,
        subject: 'قرارداد اجاره امضا شد',
        body: `قرارداد شماره ${contractNumber} توسط ${contract.tenantName} امضا شد.`
      })
    }
    
    // Send Telegram notification if configured
    if (c.env.TELEGRAM_BOT_TOKEN) {
      await sendTelegramNotification(c.env, `قرارداد ${contractNumber} امضا شد`)
    }
    
    return c.json({ success: true, message: 'قرارداد با موفقیت امضا شد' })
  } catch (error) {
    console.error('Sign contract error:', error)
    return c.json({ error: 'خطا در امضای قرارداد' }, 500)
  }
})

// Charts data endpoints
app.get('/api/charts/income', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const incomeData = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(CAST(rentAmount as REAL)) as income,
        COUNT(*) as contracts
      FROM contracts 
      WHERE status = 'signed'
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `).all()
    
    const persianMonths = {
      '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد',
      '04': 'تیر', '05': 'مرداد', '06': 'شهریور',
      '07': 'مهر', '08': 'آبان', '09': 'آذر',
      '10': 'دی', '11': 'بهمن', '12': 'اسفند'
    }
    
    const formattedData = incomeData.results.map((row: any) => ({
      month: persianMonths[row.month.split('-')[1]] + ' ' + row.month.split('-')[0],
      income: row.income || 0,
      contracts: row.contracts
    }))
    
    return c.json(formattedData)
  } catch (error) {
    console.error('Get income data error:', error)
    return c.json({ error: 'خطا در دریافت اطلاعات درآمد' }, 500)
  }
})

app.get('/api/charts/status', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const statusData = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM contracts
      GROUP BY status
    `).all()
    
    const statusLabels = {
      'draft': 'پیش‌نویس',
      'active': 'فعال', 
      'signed': 'امضا شده',
      'terminated': 'فسخ شده'
    }
    
    const formattedData = statusData.results.map((row: any) => ({
      status: statusLabels[row.status] || row.status,
      count: row.count
    }))
    
    return c.json(formattedData)
  } catch (error) {
    console.error('Get status data error:', error)
    return c.json({ error: 'خطا در دریافت اطلاعات وضعیت' }, 500)
  }
})

// Notification settings endpoints
app.get('/api/settings/notifications', auth, async (c) => {
  try {
    const settings = await c.env.DB.prepare(
      'SELECT * FROM notification_settings WHERE id = 1'
    ).first()
    
    return c.json(settings || {
      email_enabled: false,
      telegram_enabled: false,
      whatsapp_enabled: false
    })
  } catch (error) {
    console.error('Get notification settings error:', error)
    return c.json({ error: 'خطا در دریافت تنظیمات' }, 500)
  }
})

app.post('/api/notifications/test', auth, async (c) => {
  try {
    const { service } = await c.req.json()
    
    switch (service) {
      case 'email':
        if (!c.env.EMAIL_USER) throw new Error('Email not configured')
        await sendNotificationEmail(c.env, {
          to: c.env.EMAIL_USER,
          subject: 'تست اتصال ایمیل',
          body: 'این یک پیام تست است.'
        })
        break
        
      case 'telegram':
        if (!c.env.TELEGRAM_BOT_TOKEN) throw new Error('Telegram not configured')
        await sendTelegramNotification(c.env, 'تست اتصال تلگرام')
        break
        
      case 'whatsapp':
        if (!c.env.WHATSAPP_ACCOUNT_SID) throw new Error('WhatsApp not configured')
        await sendWhatsAppNotification(c.env, 'تست اتصال واتساپ')
        break
        
      default:
        throw new Error('Unknown service')
    }
    
    return c.json({ success: true, message: 'تست با موفقیت انجام شد' })
  } catch (error) {
    console.error('Test notification error:', error)
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Helper functions
async function sendNotificationEmail(env: Env, { to, subject, body }: { to: string, subject: string, body: string }) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return
  
  // Use Resend API for email sending
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.EMAIL_PASS}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_USER,
        to: [to],
        subject: subject,
        text: body,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }
    
    console.log(`Email sent to ${to}: ${subject}`)
  } catch (error) {
    console.error('Email sending error:', error)
  }
}

async function sendTelegramNotification(env: Env, message: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '@your_channel', // Replace with actual chat ID
        text: message,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }
    
    console.log(`Telegram notification sent: ${message}`)
  } catch (error) {
    console.error('Telegram sending error:', error)
  }
}

async function sendWhatsAppNotification(env: Env, message: string) {
  if (!env.WHATSAPP_ACCOUNT_SID || !env.WHATSAPP_AUTH_TOKEN) return
  
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.WHATSAPP_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${env.WHATSAPP_ACCOUNT_SID}:${env.WHATSAPP_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886', // Twilio WhatsApp number
        To: 'whatsapp:+your_number', // Replace with actual number
        Body: message,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }
    
    console.log(`WhatsApp notification sent: ${message}`)
  } catch (error) {
    console.error('WhatsApp sending error:', error)
  }
}

export default app