import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { serveStatic } from 'hono/cloudflare-workers'
import bcrypt from 'bcryptjs'

interface Env {
  DB: D1Database
  RENTAL_KV: KVNamespace
  ASSETS: Fetcher
  TELEGRAM_BOT_TOKEN?: string
  WHATSAPP_ACCOUNT_SID?: string
  WHATSAPP_AUTH_TOKEN?: string
  EMAIL_USER?: string
  EMAIL_PASS?: string
  JWT_SECRET: string
  ENVIRONMENT: string
  APP_NAME: string
  APP_VERSION: string
  DEFAULT_LOCALE: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration for Persian RTL frontend
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://*.pages.dev', 'https://*.workers.dev'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Serve static assets from Cloudflare Pages
app.get('/assets/*', serveStatic({ root: './' }))
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))

// Authentication middleware
const auth = jwt({
  secret: async (c) => c.env.JWT_SECRET,
  cookie: 'auth-token'
})

// Health check with enhanced information
app.get('/api/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: c.env.APP_VERSION || '2.0.0',
    environment: c.env.ENVIRONMENT || 'production',
    locale: c.env.DEFAULT_LOCALE || 'fa-IR',
    services: {
      database: 'D1',
      cache: 'KV',
      notifications: {
        email: !!c.env.EMAIL_USER,
        telegram: !!c.env.TELEGRAM_BOT_TOKEN,
        whatsapp: !!c.env.WHATSAPP_ACCOUNT_SID
      }
    }
  })
})

// Enhanced authentication endpoints
app.post('/api/login', async (c) => {
  try {
    const { username, password, contractNumber, accessCode } = await c.req.json()
    
    if (username === 'admin' && password) {
      // Admin login with enhanced security
      const adminUser = await c.env.DB.prepare(
        'SELECT * FROM users WHERE username = ? AND role = ? AND active = 1'
      ).bind(username, 'admin').first()
      
      if (adminUser && await bcrypt.compare(password, adminUser.password_hash)) {
        const token = await jwt.sign(
          { 
            userId: adminUser.id, 
            role: 'admin',
            username: adminUser.username,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          },
          c.env.JWT_SECRET
        )
        
        // Log successful login
        await c.env.DB.prepare(
          'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          adminUser.id,
          'admin_login',
          JSON.stringify({ username, success: true }),
          c.req.header('CF-Connecting-IP') || 'unknown',
          new Date().toISOString()
        ).run()
        
        return c.json({ 
          success: true, 
          token,
          user: { 
            id: adminUser.id, 
            username: adminUser.username, 
            role: 'admin',
            name: adminUser.full_name || 'مدیر سیستم'
          }
        })
      }
    } else if (contractNumber && accessCode) {
      // Tenant login with rate limiting
      const rateLimitKey = `login_attempts:${contractNumber}`
      const attempts = await c.env.RENTAL_KV.get(rateLimitKey)
      
      if (attempts && parseInt(attempts) >= 5) {
        return c.json({ 
          success: false, 
          message: 'تعداد تلاش‌های ناموفق زیاد است. لطفاً بعداً تلاش کنید.' 
        }, 429)
      }
      
      const contract = await c.env.DB.prepare(
        'SELECT * FROM contracts WHERE contractNumber = ? AND accessCode = ? AND status != ?'
      ).bind(contractNumber, accessCode, 'terminated').first()
      
      if (contract) {
        const token = await jwt.sign(
          { 
            contractId: contract.id, 
            role: 'tenant',
            contractNumber: contract.contractNumber,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
          },
          c.env.JWT_SECRET
        )
        
        // Clear rate limiting on successful login
        await c.env.RENTAL_KV.delete(rateLimitKey)
        
        // Log successful tenant login
        await c.env.DB.prepare(
          'INSERT INTO audit_logs (contract_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(
          contract.id,
          'tenant_login',
          JSON.stringify({ contractNumber, success: true }),
          c.req.header('CF-Connecting-IP') || 'unknown',
          new Date().toISOString()
        ).run()
        
        return c.json({ 
          success: true, 
          token,
          contract: { 
            id: contract.id, 
            contractNumber: contract.contractNumber,
            tenantName: contract.tenantName
          }
        })
      } else {
        // Increment failed attempts
        const currentAttempts = attempts ? parseInt(attempts) + 1 : 1
        await c.env.RENTAL_KV.put(rateLimitKey, currentAttempts.toString(), { expirationTtl: 3600 })
      }
    }
    
    return c.json({ success: false, message: 'اطلاعات ورود نادرست است' }, 401)
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, message: 'خطا در ورود به سیستم' }, 500)
  }
})

// Enhanced logout endpoint
app.post('/api/logout', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    // Log logout activity
    if (payload.role === 'admin') {
      await c.env.DB.prepare(
        'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        payload.userId,
        'admin_logout',
        JSON.stringify({ username: payload.username }),
        c.req.header('CF-Connecting-IP') || 'unknown',
        new Date().toISOString()
      ).run()
    } else if (payload.role === 'tenant') {
      await c.env.DB.prepare(
        'INSERT INTO audit_logs (contract_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        payload.contractId,
        'tenant_logout',
        JSON.stringify({ contractNumber: payload.contractNumber }),
        c.req.header('CF-Connecting-IP') || 'unknown',
        new Date().toISOString()
      ).run()
    }
    
    return c.json({ success: true, message: 'با موفقیت خارج شدید' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ success: false, message: 'خطا در خروج از سیستم' }, 500)
  }
})

// Enhanced contract management endpoints
app.get('/api/contracts', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role === 'admin') {
      const page = parseInt(c.req.query('page') || '1')
      const limit = parseInt(c.req.query('limit') || '10')
      const status = c.req.query('status')
      const search = c.req.query('search')
      const offset = (page - 1) * limit
      
      let query = 'SELECT * FROM contracts'
      let countQuery = 'SELECT COUNT(*) as total FROM contracts'
      const params: any[] = []
      
      const conditions: string[] = []
      if (status && status !== 'all') {
        conditions.push('status = ?')
        params.push(status)
      }
      if (search) {
        conditions.push('(tenantName LIKE ? OR contractNumber LIKE ? OR propertyAddress LIKE ?)')
        const searchParam = `%${search}%`
        params.push(searchParam, searchParam, searchParam)
      }
      
      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ')
        query += whereClause
        countQuery += whereClause
      }
      
      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
      params.push(limit, offset)
      
      const [contracts, total] = await Promise.all([
        c.env.DB.prepare(query).bind(...params).all(),
        c.env.DB.prepare(countQuery).bind(...params.slice(0, -2)).first()
      ])
      
      return c.json({
        contracts: contracts.results,
        pagination: {
          page,
          limit,
          total: total.total,
          totalPages: Math.ceil(total.total / limit)
        }
      })
    } else if (payload.role === 'tenant') {
      const contract = await c.env.DB.prepare(
        'SELECT * FROM contracts WHERE id = ?'
      ).bind(payload.contractId).first()
      
      return c.json({ contracts: [contract] })
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
    
    // Enhanced validation
    const requiredFields = ['tenantName', 'tenantEmail', 'landlordName', 'landlordEmail', 'propertyAddress', 'rentAmount', 'startDate', 'endDate']
    const missingFields = requiredFields.filter(field => !contractData[field])
    
    if (missingFields.length > 0) {
      return c.json({ 
        error: `فیلدهای اجباری وارد نشده: ${missingFields.join(', ')}` 
      }, 400)
    }
    
    // Generate unique identifiers
    const contractNumber = `RNT${Date.now()}`
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString()
    const contractId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = await c.env.DB.prepare(`
      INSERT INTO contracts (
        id, contractNumber, tenantName, tenantEmail, tenantPhone, tenantNationalId,
        landlordName, landlordEmail, landlordNationalId,
        propertyAddress, propertyType, rentAmount, deposit, startDate, endDate,
        accessCode, status, createdAt, propertySize, propertyFeatures,
        utilitiesIncluded, petPolicy, smokingPolicy, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contractId,
      contractNumber,
      contractData.tenantName,
      contractData.tenantEmail,
      contractData.tenantPhone || '',
      contractData.tenantNationalId || '',
      contractData.landlordName,
      contractData.landlordEmail,
      contractData.landlordNationalId || '',
      contractData.propertyAddress,
      contractData.propertyType || 'مسکونی',
      contractData.rentAmount,
      contractData.deposit || '0',
      contractData.startDate,
      contractData.endDate,
      accessCode,
      'draft',
      new Date().toISOString(),
      contractData.propertySize || '',
      contractData.propertyFeatures || '',
      contractData.utilitiesIncluded || '',
      contractData.petPolicy || 'مجاز نیست',
      contractData.smokingPolicy || 'مجاز نیست',
      contractData.notes || ''
    ).run()
    
    // Log contract creation
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'contract_created',
      JSON.stringify({ contractNumber, tenantName: contractData.tenantName }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run()
    
    // Send access code via email if configured
    if (c.env.EMAIL_USER && contractData.tenantEmail) {
      await sendNotificationEmail(c.env, {
        to: contractData.tenantEmail,
        subject: 'کد دسترسی قرارداد اجاره - سیستم مدیریت املاک',
        body: `
سلام ${contractData.tenantName} عزیز،

قرارداد اجاره شما با موفقیت ایجاد شد.

اطلاعات دسترسی:
شماره قرارداد: ${contractNumber}
کد دسترسی: ${accessCode}

برای مشاهده و امضای قرارداد خود وارد سیستم شوید.

با تشکر
تیم مدیریت املاک
        `
      })
    }
    
    // Cache contract data for quick access
    await c.env.RENTAL_KV.put(
      `contract:${contractNumber}`,
      JSON.stringify({ id: contractId, accessCode, status: 'draft' }),
      { expirationTtl: 86400 * 30 } // 30 days
    )
    
    return c.json({ 
      success: true, 
      contractNumber, 
      accessCode,
      id: contractId,
      message: 'قرارداد با موفقیت ایجاد شد'
    })
  } catch (error) {
    console.error('Create contract error:', error)
    return c.json({ error: 'خطا در ایجاد قرارداد' }, 500)
  }
})

app.put('/api/contracts/:id', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const contractId = c.req.param('id')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const updateData = await c.req.json()
    const allowedFields = [
      'tenantName', 'tenantEmail', 'tenantPhone', 'tenantNationalId',
      'landlordName', 'landlordEmail', 'landlordNationalId',
      'propertyAddress', 'propertyType', 'rentAmount', 'deposit',
      'startDate', 'endDate', 'propertySize', 'propertyFeatures',
      'utilitiesIncluded', 'petPolicy', 'smokingPolicy', 'notes'
    ]
    
    const updateFields = Object.keys(updateData).filter(key => allowedFields.includes(key))
    if (updateFields.length === 0) {
      return c.json({ error: 'هیچ فیلد قابل بروزرسانی ارسال نشده' }, 400)
    }
    
    const setClause = updateFields.map(field => `${field} = ?`).join(', ')
    const values = updateFields.map(field => updateData[field])
    values.push(new Date().toISOString(), contractId)
    
    await c.env.DB.prepare(`
      UPDATE contracts 
      SET ${setClause}, updatedAt = ?
      WHERE id = ?
    `).bind(...values).run()
    
    // Log contract update
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'contract_updated',
      JSON.stringify({ contractId, updatedFields: updateFields }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run()
    
    return c.json({ success: true, message: 'قرارداد با موفقیت بروزرسانی شد' })
  } catch (error) {
    console.error('Update contract error:', error)
    return c.json({ error: 'خطا در بروزرسانی قرارداد' }, 500)
  }
})

app.delete('/api/contracts/:id', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const contractId = c.req.param('id')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    // Get contract info before deletion
    const contract = await c.env.DB.prepare(
      'SELECT contractNumber FROM contracts WHERE id = ?'
    ).bind(contractId).first()
    
    if (!contract) {
      return c.json({ error: 'قرارداد یافت نشد' }, 404)
    }
    
    // Soft delete - update status instead of actual deletion
    await c.env.DB.prepare(
      'UPDATE contracts SET status = ?, deletedAt = ? WHERE id = ?'
    ).bind('deleted', new Date().toISOString(), contractId).run()
    
    // Remove from cache
    await c.env.RENTAL_KV.delete(`contract:${contract.contractNumber}`)
    
    // Log contract deletion
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'contract_deleted',
      JSON.stringify({ contractId, contractNumber: contract.contractNumber }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run()
    
    return c.json({ success: true, message: 'قرارداد با موفقیت حذف شد' })
  } catch (error) {
    console.error('Delete contract error:', error)
    return c.json({ error: 'خطا در حذف قرارداد' }, 500)
  }
})

// Enhanced contract signing with digital signature validation
app.post('/api/contracts/:contractNumber/sign', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const contractNumber = c.req.param('contractNumber')
    const { signature, nationalIdImage } = await c.req.json()
    
    if (payload.role !== 'tenant') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    // Validate signature data
    if (!signature || signature.length < 100) {
      return c.json({ error: 'امضای دیجیتال معتبر نیست' }, 400)
    }
    
    // Get contract details
    const contract = await c.env.DB.prepare(
      'SELECT * FROM contracts WHERE contractNumber = ? AND id = ?'
    ).bind(contractNumber, payload.contractId).first()
    
    if (!contract) {
      return c.json({ error: 'قرارداد یافت نشد' }, 404)
    }
    
    if (contract.status === 'signed') {
      return c.json({ error: 'این قرارداد قبلاً امضا شده است' }, 400)
    }
    
    // Update contract with signature and timestamp
    const signedAt = new Date().toISOString()
    await c.env.DB.prepare(`
      UPDATE contracts 
      SET signature = ?, nationalIdImage = ?, status = 'signed', signedAt = ?
      WHERE contractNumber = ?
    `).bind(signature, nationalIdImage, signedAt, contractNumber).run()
    
    // Log contract signing
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (contract_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      contract.id,
      'contract_signed',
      JSON.stringify({ 
        contractNumber, 
        tenantName: contract.tenantName,
        signedAt,
        hasNationalId: !!nationalIdImage 
      }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      signedAt
    ).run()
    
    // Update cache
    await c.env.RENTAL_KV.put(
      `contract:${contractNumber}`,
      JSON.stringify({ 
        id: contract.id, 
        accessCode: contract.accessCode, 
        status: 'signed',
        signedAt 
      }),
      { expirationTtl: 86400 * 365 } // 1 year for signed contracts
    )
    
    // Send notifications
    const notifications = []
    
    // Email to landlord
    if (c.env.EMAIL_USER && contract.landlordEmail) {
      notifications.push(sendNotificationEmail(c.env, {
        to: contract.landlordEmail,
        subject: `قرارداد ${contractNumber} امضا شد`,
        body: `
سلام ${contract.landlordName} عزیز،

قرارداد شماره ${contractNumber} توسط ${contract.tenantName} امضا شد.

اطلاعات قرارداد:
- مستأجر: ${contract.tenantName}
- آدرس ملک: ${contract.propertyAddress}
- مبلغ اجاره: ${contract.rentAmount} تومان
- تاریخ امضا: ${new Date(signedAt).toLocaleDateString('fa-IR')}

برای مشاهده جزئیات کامل وارد سیستم مدیریت شوید.

با تشکر
سیستم مدیریت املاک
        `
      }))
    }
    
    // Telegram notification
    if (c.env.TELEGRAM_BOT_TOKEN) {
      notifications.push(sendTelegramNotification(c.env, 
        `🎉 قرارداد جدید امضا شد!\n\n` +
        `📋 شماره: ${contractNumber}\n` +
        `👤 مستأجر: ${contract.tenantName}\n` +
        `🏠 آدرس: ${contract.propertyAddress}\n` +
        `💰 اجاره: ${contract.rentAmount} تومان\n` +
        `📅 تاریخ: ${new Date(signedAt).toLocaleDateString('fa-IR')}`
      ))
    }
    
    // WhatsApp notification
    if (c.env.WHATSAPP_ACCOUNT_SID) {
      notifications.push(sendWhatsAppNotification(c.env,
        `قرارداد ${contractNumber} توسط ${contract.tenantName} امضا شد. مبلغ اجاره: ${contract.rentAmount} تومان`
      ))
    }
    
    // Wait for all notifications to complete
    await Promise.allSettled(notifications)
    
    return c.json({ 
      success: true, 
      message: 'قرارداد با موفقیت امضا شد',
      signedAt,
      contractNumber
    })
  } catch (error) {
    console.error('Sign contract error:', error)
    return c.json({ error: 'خطا در امضای قرارداد' }, 500)
  }
})

// Enhanced financial reporting endpoints
app.get('/api/charts/income', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const period = c.req.query('period') || '12' // months
    const groupBy = c.req.query('groupBy') || 'month'
    
    let dateFormat: string
    let limit: number
    
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d'
        limit = parseInt(period) || 30
        break
      case 'week':
        dateFormat = '%Y-%W'
        limit = parseInt(period) || 12
        break
      case 'month':
      default:
        dateFormat = '%Y-%m'
        limit = parseInt(period) || 12
        break
    }
    
    const incomeData = await c.env.DB.prepare(`
      SELECT 
        strftime('${dateFormat}', createdAt) as period,
        SUM(CAST(rentAmount as REAL)) as income,
        COUNT(*) as contracts,
        AVG(CAST(rentAmount as REAL)) as avgRent
      FROM contracts 
      WHERE status IN ('signed', 'active') 
        AND createdAt >= datetime('now', '-${limit} ${groupBy}s')
      GROUP BY strftime('${dateFormat}', createdAt)
      ORDER BY period DESC
      LIMIT ${limit}
    `).all()
    
    // Persian month names for better UX
    const persianMonths = {
      '01': 'فروردین', '02': 'اردیبهشت', '03': 'خرداد',
      '04': 'تیر', '05': 'مرداد', '06': 'شهریور',
      '07': 'مهر', '08': 'آبان', '09': 'آذر',
      '10': 'دی', '11': 'بهمن', '12': 'اسفند'
    }
    
    const formattedData = incomeData.results.map((row: any) => {
      let displayPeriod = row.period
      
      if (groupBy === 'month' && row.period) {
        const [year, month] = row.period.split('-')
        displayPeriod = `${persianMonths[month]} ${year}`
      }
      
      return {
        period: displayPeriod,
        income: Math.round(row.income || 0),
        contracts: row.contracts,
        avgRent: Math.round(row.avgRent || 0)
      }
    })
    
    return c.json({
      data: formattedData.reverse(),
      summary: {
        totalIncome: formattedData.reduce((sum, item) => sum + item.income, 0),
        totalContracts: formattedData.reduce((sum, item) => sum + item.contracts, 0),
        avgIncome: Math.round(formattedData.reduce((sum, item) => sum + item.income, 0) / formattedData.length) || 0
      }
    })
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
      SELECT 
        status, 
        COUNT(*) as count,
        SUM(CAST(rentAmount as REAL)) as totalValue
      FROM contracts
      WHERE status != 'deleted'
      GROUP BY status
    `).all()
    
    const statusLabels = {
      'draft': 'پیش‌نویس',
      'active': 'فعال', 
      'signed': 'امضا شده',
      'terminated': 'فسخ شده',
      'expired': 'منقضی شده'
    }
    
    const statusColors = {
      'draft': '#f59e0b',
      'active': '#10b981', 
      'signed': '#3b82f6',
      'terminated': '#ef4444',
      'expired': '#6b7280'
    }
    
    const formattedData = statusData.results.map((row: any) => ({
      status: statusLabels[row.status] || row.status,
      count: row.count,
      totalValue: Math.round(row.totalValue || 0),
      color: statusColors[row.status] || '#6b7280'
    }))
    
    return c.json({
      data: formattedData,
      summary: {
        totalContracts: formattedData.reduce((sum, item) => sum + item.count, 0),
        totalValue: formattedData.reduce((sum, item) => sum + item.totalValue, 0)
      }
    })
  } catch (error) {
    console.error('Get status data error:', error)
    return c.json({ error: 'خطا در دریافت اطلاعات وضعیت' }, 500)
  }
})

// Property analytics endpoint
app.get('/api/charts/properties', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const [typeData, sizeData, locationData] = await Promise.all([
      // Property types
      c.env.DB.prepare(`
        SELECT 
          propertyType as type, 
          COUNT(*) as count,
          AVG(CAST(rentAmount as REAL)) as avgRent
        FROM contracts 
        WHERE status IN ('signed', 'active') AND propertyType != ''
        GROUP BY propertyType
        ORDER BY count DESC
      `).all(),
      
      // Property sizes
      c.env.DB.prepare(`
        SELECT 
          CASE 
            WHEN CAST(propertySize as INTEGER) < 50 THEN 'کمتر از 50 متر'
            WHEN CAST(propertySize as INTEGER) < 100 THEN '50-100 متر'
            WHEN CAST(propertySize as INTEGER) < 150 THEN '100-150 متر'
            ELSE 'بیشتر از 150 متر'
          END as sizeRange,
          COUNT(*) as count,
          AVG(CAST(rentAmount as REAL)) as avgRent
        FROM contracts 
        WHERE status IN ('signed', 'active') AND propertySize != '' AND propertySize IS NOT NULL
        GROUP BY sizeRange
        ORDER BY count DESC
      `).all(),
      
      // Top locations
      c.env.DB.prepare(`
        SELECT 
          propertyAddress,
          COUNT(*) as count,
          AVG(CAST(rentAmount as REAL)) as avgRent
        FROM contracts 
        WHERE status IN ('signed', 'active')
        GROUP BY propertyAddress
        ORDER BY count DESC
        LIMIT 10
      `).all()
    ])
    
    return c.json({
      propertyTypes: typeData.results,
      propertySizes: sizeData.results,
      topLocations: locationData.results
    })
  } catch (error) {
    console.error('Get property analytics error:', error)
    return c.json({ error: 'خطا در دریافت اطلاعات املاک' }, 500)
  }
})

// Enhanced notification settings
app.get('/api/settings/notifications', auth, async (c) => {
  try {
    const settings = await c.env.DB.prepare(
      'SELECT * FROM notification_settings WHERE id = 1'
    ).first()
    
    return c.json(settings || {
      id: 1,
      email_enabled: false,
      telegram_enabled: false,
      whatsapp_enabled: false,
      email_from: '',
      telegram_chat_id: '',
      whatsapp_number: ''
    })
  } catch (error) {
    console.error('Get notification settings error:', error)
    return c.json({ error: 'خطا در دریافت تنظیمات' }, 500)
  }
})

app.put('/api/settings/notifications', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const settings = await c.req.json()
    
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO notification_settings (
        id, email_enabled, telegram_enabled, whatsapp_enabled,
        email_from, telegram_chat_id, whatsapp_number, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      settings.email_enabled ? 1 : 0,
      settings.telegram_enabled ? 1 : 0,
      settings.whatsapp_enabled ? 1 : 0,
      settings.email_from || '',
      settings.telegram_chat_id || '',
      settings.whatsapp_number || '',
      new Date().toISOString()
    ).run()
    
    // Log settings update
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'settings_updated',
      JSON.stringify({ type: 'notifications', settings }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run()
    
    return c.json({ success: true, message: 'تنظیمات با موفقیت بروزرسانی شد' })
  } catch (error) {
    console.error('Update notification settings error:', error)
    return c.json({ error: 'خطا در بروزرسانی تنظیمات' }, 500)
  }
})

// Enhanced notification testing
app.post('/api/notifications/test', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const { service, recipient } = await c.req.json()
    
    switch (service) {
      case 'email':
        if (!c.env.EMAIL_USER) throw new Error('Email service not configured')
        await sendNotificationEmail(c.env, {
          to: recipient || c.env.EMAIL_USER,
          subject: 'تست اتصال ایمیل - سیستم مدیریت املاک',
          body: `
این یک پیام تست است.

سیستم ایمیل شما به درستی پیکربندی شده و آماده ارسال اعلان‌ها می‌باشد.

تاریخ تست: ${new Date().toLocaleDateString('fa-IR')}
زمان تست: ${new Date().toLocaleTimeString('fa-IR')}

سیستم مدیریت املاک
          `
        })
        break
        
      case 'telegram':
        if (!c.env.TELEGRAM_BOT_TOKEN) throw new Error('Telegram bot not configured')
        await sendTelegramNotification(c.env, 
          `🔔 تست اتصال تلگرام\n\n` +
          `سیستم تلگرام شما به درستی پیکربندی شده است.\n\n` +
          `📅 ${new Date().toLocaleDateString('fa-IR')}\n` +
          `🕐 ${new Date().toLocaleTimeString('fa-IR')}\n\n` +
          `✅ سیستم مدیریت املاک`
        )
        break
        
      case 'whatsapp':
        if (!c.env.WHATSAPP_ACCOUNT_SID) throw new Error('WhatsApp service not configured')
        await sendWhatsAppNotification(c.env,
          `تست اتصال واتساپ - سیستم مدیریت املاک. ` +
          `تاریخ: ${new Date().toLocaleDateString('fa-IR')} ` +
          `ساعت: ${new Date().toLocaleTimeString('fa-IR')}`
        )
        break
        
      default:
        throw new Error('Unknown notification service')
    }
    
    // Log test notification
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'notification_test',
      JSON.stringify({ service, recipient, success: true }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run()
    
    return c.json({ success: true, message: `تست ${service} با موفقیت انجام شد` })
  } catch (error) {
    console.error('Test notification error:', error)
    
    // Log failed test
    const payload = c.get('jwtPayload')
    await c.env.DB.prepare(
      'INSERT INTO audit_logs (user_id, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      payload.userId,
      'notification_test',
      JSON.stringify({ service: c.req.json().service, success: false, error: error.message }),
      c.req.header('CF-Connecting-IP') || 'unknown',
      new Date().toISOString()
    ).run().catch(() => {})
    
    return c.json({ success: false, message: error.message }, 500)
  }
})

// Audit logs endpoint for admin
app.get('/api/audit-logs', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const action = c.req.query('action')
    const offset = (page - 1) * limit
    
    let query = `
      SELECT al.*, u.username, c.contractNumber 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN contracts c ON al.contract_id = c.id
    `
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs'
    const params: any[] = []
    
    if (action && action !== 'all') {
      query += ' WHERE al.action = ?'
      countQuery += ' WHERE action = ?'
      params.push(action)
    }
    
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)
    
    const [logs, total] = await Promise.all([
      c.env.DB.prepare(query).bind(...params).all(),
      c.env.DB.prepare(countQuery).bind(...params.slice(0, -2)).first()
    ])
    
    return c.json({
      logs: logs.results,
      pagination: {
        page,
        limit,
        total: total.total,
        totalPages: Math.ceil(total.total / limit)
      }
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return c.json({ error: 'خطا در دریافت گزارش‌های سیستم' }, 500)
  }
})

// System statistics endpoint
app.get('/api/dashboard/stats', auth, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    if (payload.role !== 'admin') {
      return c.json({ error: 'دسترسی غیرمجاز' }, 403)
    }
    
    const [
      totalContracts,
      activeContracts,
      signedContracts,
      totalIncome,
      thisMonthIncome,
      recentActivity
    ] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM contracts WHERE status != 'deleted'").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'active'").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'signed'").first(),
      c.env.DB.prepare("SELECT SUM(CAST(rentAmount as REAL)) as total FROM contracts WHERE status IN ('signed', 'active')").first(),
      c.env.DB.prepare("SELECT SUM(CAST(rentAmount as REAL)) as total FROM contracts WHERE status IN ('signed', 'active') AND strftime('%Y-%m', createdAt) = strftime('%Y-%m', 'now')").first(),
      c.env.DB.prepare("SELECT action, COUNT(*) as count FROM audit_logs WHERE created_at >= datetime('now', '-7 days') GROUP BY action ORDER BY count DESC LIMIT 5").all()
    ])
    
    return c.json({
      contracts: {
        total: totalContracts.count,
        active: activeContracts.count,
        signed: signedContracts.count,
        draft: totalContracts.count - activeContracts.count - signedContracts.count
      },
      income: {
        total: Math.round(totalIncome.total || 0),
        thisMonth: Math.round(thisMonthIncome.total || 0)
      },
      recentActivity: recentActivity.results
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return c.json({ error: 'خطا در دریافت آمار سیستم' }, 500)
  }
})

// Helper functions for notifications
async function sendNotificationEmail(env: Env, { to, subject, body }: { to: string, subject: string, body: string }) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return
  
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
        html: body.replace(/\n/g, '<br>')
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Email API error: ${response.statusText} - ${error}`)
    }
    
    console.log(`Email sent successfully to ${to}: ${subject}`)
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

async function sendTelegramNotification(env: Env, message: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return
  
  try {
    const settings = await env.DB.prepare(
      'SELECT telegram_chat_id FROM notification_settings WHERE id = 1'
    ).first()
    
    const chatId = settings?.telegram_chat_id || '@your_channel'
    
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Telegram API error: ${response.statusText} - ${error}`)
    }
    
    console.log(`Telegram notification sent: ${message.substring(0, 50)}...`)
  } catch (error) {
    console.error('Telegram sending error:', error)
    throw error
  }
}

async function sendWhatsAppNotification(env: Env, message: string) {
  if (!env.WHATSAPP_ACCOUNT_SID || !env.WHATSAPP_AUTH_TOKEN) return
  
  try {
    const settings = await env.DB.prepare(
      'SELECT whatsapp_number FROM notification_settings WHERE id = 1'
    ).first()
    
    const toNumber = settings?.whatsapp_number || '+1234567890'
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.WHATSAPP_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${env.WHATSAPP_ACCOUNT_SID}:${env.WHATSAPP_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886', // Twilio WhatsApp number
        To: `whatsapp:${toNumber}`,
        Body: message,
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WhatsApp API error: ${response.statusText} - ${error}`)
    }
    
    console.log(`WhatsApp notification sent: ${message.substring(0, 50)}...`)
  } catch (error) {
    console.error('WhatsApp sending error:', error)
    throw error
  }
}

// Serve the React app for all other routes (SPA routing)
app.get('*', serveStatic({ root: './', path: './index.html' }))

export default app