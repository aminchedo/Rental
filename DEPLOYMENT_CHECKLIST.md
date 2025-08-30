# Vercel Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Database Configuration
- [ ] Create Vercel Postgres database
- [ ] Note down database connection URLs
- [ ] Run `postgres-migration.sql` to create schema
- [ ] Import existing data (if migrating from Cloudflare D1)

### ✅ 2. Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables
- [ ] `POSTGRES_URL` - Main database connection
- [ ] `POSTGRES_PRISMA_URL` - Connection with pgbouncer
- [ ] `POSTGRES_URL_NON_POOLING` - Direct connection
- [ ] `JWT_SECRET` - Strong secret key for JWT tokens

#### Optional Notification Variables
- [ ] `EMAIL_USER` - Email service username
- [ ] `EMAIL_PASS` - Email service password/API key
- [ ] `TELEGRAM_BOT_TOKEN` - Telegram bot token
- [ ] `TELEGRAM_CHAT_ID` - Telegram chat ID for notifications
- [ ] `WHATSAPP_ACCOUNT_SID` - Twilio WhatsApp Account SID
- [ ] `WHATSAPP_AUTH_TOKEN` - Twilio WhatsApp Auth Token
- [ ] `WHATSAPP_NUMBER` - WhatsApp number for notifications

#### Frontend Variables
- [ ] `NEXT_PUBLIC_API_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- [ ] `NEXT_PUBLIC_ENVIRONMENT` - Set to "production"

### ✅ 3. Code Preparation
- [ ] All dependencies installed (`npm install`)
- [ ] Client dependencies installed (`cd client && npm install`)
- [ ] TypeScript compilation successful
- [ ] No linting errors

## Deployment Process

### ✅ 1. Deploy to Vercel
```bash
# Option 1: Use the automated script
./deploy-vercel.sh

# Option 2: Manual deployment
vercel --prod
```

### ✅ 2. Verify Deployment
- [ ] Deployment completed successfully
- [ ] Received deployment URL
- [ ] All serverless functions deployed

## Post-Deployment Verification

### ✅ 1. API Functionality
Run verification script:
```bash
API_URL=https://your-app.vercel.app node scripts/verify-migration.js
```

#### Manual API Tests
- [ ] `GET /api/health` - Returns 200 OK
- [ ] `POST /api/login` - Admin login works
- [ ] `GET /api/contracts` - Returns contract list
- [ ] `GET /api/charts/income` - Returns chart data
- [ ] `GET /api/charts/status` - Returns status data

### ✅ 2. Database Connectivity
- [ ] Database queries execute successfully
- [ ] Data persists correctly
- [ ] Foreign key constraints work
- [ ] Indexes are created

### ✅ 3. Authentication System
- [ ] Admin login with username/password
- [ ] Tenant login with contract number/access code
- [ ] JWT tokens generated and validated
- [ ] Protected routes require authentication

### ✅ 4. Frontend Functionality
- [ ] Application loads without errors
- [ ] Persian RTL text displays correctly
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile devices
- [ ] All navigation links work
- [ ] Forms submit successfully

### ✅ 5. Contract Management
- [ ] Admin can create new contracts
- [ ] Email notifications sent for new contracts
- [ ] Tenant can access contract with credentials
- [ ] Digital signature capture works
- [ ] Contract status updates correctly

### ✅ 6. Analytics Dashboard
- [ ] Income chart displays data
- [ ] Status chart shows distribution
- [ ] Persian month names display correctly
- [ ] Charts are responsive

### ✅ 7. Notification System
- [ ] Email notifications work (if configured)
- [ ] Telegram notifications work (if configured)
- [ ] WhatsApp notifications work (if configured)
- [ ] Test notification functionality

## Performance Verification

### ✅ 1. Load Times
- [ ] Initial page load < 3 seconds
- [ ] API responses < 2 seconds
- [ ] Database queries < 1 second

### ✅ 2. Scalability
- [ ] Concurrent user handling
- [ ] Database connection pooling
- [ ] Serverless function cold starts acceptable

## Security Verification

### ✅ 1. Authentication Security
- [ ] JWT tokens expire correctly (24h)
- [ ] Invalid tokens rejected
- [ ] Password hashing works
- [ ] Admin password changed from default

### ✅ 2. API Security
- [ ] CORS configured correctly
- [ ] SQL injection protection
- [ ] Input validation working
- [ ] Error messages don't leak sensitive info

### ✅ 3. Environment Security
- [ ] Sensitive data in environment variables
- [ ] No secrets in code repository
- [ ] HTTPS enforced in production

## Production Readiness

### ✅ 1. Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Function logs accessible
- [ ] Error tracking configured

### ✅ 2. Backup Strategy
- [ ] Database backup scheduled
- [ ] Environment variables documented
- [ ] Code repository backed up

### ✅ 3. Domain Configuration
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] DNS records updated

## Rollback Plan

### If Issues Arise
1. **Immediate**: Use Vercel rollback to previous deployment
2. **Database**: Restore from backup if data corruption
3. **DNS**: Switch back to Cloudflare if critical issues
4. **Environment**: Verify all variables are correctly set

### Emergency Contacts
- Vercel Support: support@vercel.com
- Database Provider: [Your DB provider support]

## Success Criteria

✅ **Migration Complete When:**
- [ ] All API endpoints respond correctly
- [ ] Database operations work flawlessly
- [ ] Frontend displays without errors
- [ ] Authentication flows function
- [ ] Notifications send successfully
- [ ] Analytics display accurate data
- [ ] Persian RTL layout renders correctly
- [ ] Mobile experience is smooth
- [ ] Performance meets requirements
- [ ] Security measures are active

## Next Steps After Migration

1. **Monitor**: Watch for any errors in first 24-48 hours
2. **Optimize**: Review performance metrics and optimize if needed
3. **Document**: Update any internal documentation
4. **Train**: Ensure users know about any changes
5. **Backup**: Set up regular database backups

---

**🎉 Congratulations!** Your Rental Management System is now running on Vercel with PostgreSQL, providing better scalability, performance, and reliability.