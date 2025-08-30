# Vercel Migration Guide

## Overview
This guide covers the complete migration from Cloudflare Workers (Hono + D1 + KV) to Vercel (Serverless Functions + Postgres).

## Prerequisites

1. **Vercel Account**: Ensure you have a Vercel account
2. **PostgreSQL Database**: Set up a Vercel Postgres database or external PostgreSQL instance
3. **Environment Variables**: Prepare all required environment variables

## Migration Steps

### 1. Database Setup

#### Create Vercel Postgres Database
```bash
# In your Vercel dashboard or via CLI
vercel postgres create rental-management-db
```

#### Run Migration Script
```bash
# Get your database URL from Vercel dashboard
export POSTGRES_URL="postgresql://..."

# Run the migration
psql $POSTGRES_URL -f postgres-migration.sql
```

### 2. Environment Variables Setup

Set these in your Vercel dashboard under Settings > Environment Variables:

#### Required Variables
- `POSTGRES_URL` - Your PostgreSQL connection string
- `POSTGRES_PRISMA_URL` - PostgreSQL connection string with pgbouncer
- `POSTGRES_URL_NON_POOLING` - Direct PostgreSQL connection
- `JWT_SECRET` - Secret key for JWT tokens

#### Optional Variables (for notifications)
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Telegram chat ID
- `WHATSAPP_ACCOUNT_SID` - Twilio WhatsApp SID
- `WHATSAPP_AUTH_TOKEN` - Twilio WhatsApp token
- `WHATSAPP_NUMBER` - WhatsApp number for notifications

#### Frontend Variables
- `NEXT_PUBLIC_API_URL` - Your Vercel app URL
- `NEXT_PUBLIC_ENVIRONMENT` - production/development

### 3. Data Migration (if needed)

If you have existing data in Cloudflare D1:

1. Export data from D1:
```bash
wrangler d1 execute rental-management-db --command="SELECT * FROM users;" --output=users.csv
wrangler d1 execute rental-management-db --command="SELECT * FROM contracts;" --output=contracts.csv
# ... repeat for other tables
```

2. Import to PostgreSQL:
```bash
# Use COPY commands or INSERT statements to import the data
```

### 4. Deploy to Vercel

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### 5. Post-Deployment Verification

Test all functionality:
- [ ] Admin login works
- [ ] Tenant login with contract number/access code works
- [ ] Contract creation and email notifications
- [ ] Contract signing workflow
- [ ] Analytics charts (income/status)
- [ ] Notification settings
- [ ] RTL Persian UI displays correctly
- [ ] Dark mode functionality
- [ ] Responsive design on mobile

## Key Changes Made

### Backend Changes
- **Framework**: Hono → Vercel Serverless Functions
- **Database**: Cloudflare D1 → Vercel Postgres
- **Storage**: KV Namespace → JWT-only sessions
- **File Structure**: Single `index.ts` → Individual `/api` files

### Database Changes
- **SQL Syntax**: SQLite → PostgreSQL
- **Auto-increment**: `AUTOINCREMENT` → `SERIAL`
- **Date Functions**: `strftime()` → `TO_CHAR()`
- **Boolean Type**: `INTEGER` → `BOOLEAN`

### Frontend Changes
- **API Base URL**: Updated for Vercel deployment
- **Environment Variables**: Updated naming convention
- **Proxy Configuration**: Added Vite proxy for local development

## Performance Considerations

1. **Connection Pooling**: Using `@vercel/postgres` with built-in pooling
2. **Cold Starts**: Serverless functions may have cold start latency
3. **Database Connections**: PostgreSQL connections are managed by Vercel
4. **Static Assets**: Served efficiently by Vercel's CDN

## Security Enhancements

1. **JWT-only Authentication**: Removed session storage dependency
2. **Environment Variables**: Encrypted storage in Vercel
3. **CORS**: Properly configured for production domains
4. **SQL Injection**: Using parameterized queries

## Monitoring & Debugging

1. **Vercel Analytics**: Built-in performance monitoring
2. **Function Logs**: Available in Vercel dashboard
3. **Error Tracking**: Console errors captured in Vercel logs

## Rollback Plan

If issues arise:
1. Keep Cloudflare deployment active during migration
2. Use DNS switching for quick rollback
3. Database backup before migration
4. Environment variable backup

## Support

For issues during migration:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test database connectivity
4. Validate API endpoints individually