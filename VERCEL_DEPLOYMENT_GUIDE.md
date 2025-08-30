# Vercel Deployment Guide - Rental Management System

## 🚀 Migration Overview

This guide covers the complete migration from Cloudflare Workers to Vercel, including database migration from D1 to Vercel Postgres.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## 🗄️ Database Setup

### 1. Create Vercel Postgres Database

```bash
# Login to Vercel
vercel login

# Link your project
vercel link

# Create Postgres database
vercel postgres create rental-management-db
```

### 2. Get Database Connection String

```bash
# Get your database URL
vercel env pull .env.local
```

### 3. Initialize Database Schema

```bash
# Run database initialization
npm run db:init
```

### 4. Migrate Existing Data (Optional)

If you have existing SQLite data:

```bash
# Export SQLite data first
node scripts/export-sqlite-data.js

# Then migrate to PostgreSQL
npm run db:migrate
```

## 🔧 Environment Variables Setup

### Required Environment Variables

Set these in your Vercel dashboard or via CLI:

```bash
# Database (Auto-configured by Vercel Postgres)
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
vercel env add POSTGRES_URL_NON_POOLING

# Authentication
vercel env add JWT_SECRET

# Email Configuration (Resend)
vercel env add EMAIL_USER
vercel env add EMAIL_PASS

# Telegram Configuration (Optional)
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID

# WhatsApp Configuration (Optional)
vercel env add WHATSAPP_ACCOUNT_SID
vercel env add WHATSAPP_AUTH_TOKEN
vercel env add WHATSAPP_TO_NUMBER

# Frontend Configuration
vercel env add NEXT_PUBLIC_API_URL
```

### Setting Environment Variables via CLI

```bash
# JWT Secret (generate a strong secret)
vercel env add JWT_SECRET

# Email configuration (using Resend)
vercel env add EMAIL_USER
vercel env add EMAIL_PASS

# Optional: Telegram notifications
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID

# Optional: WhatsApp notifications
vercel env add WHATSAPP_ACCOUNT_SID
vercel env add WHATSAPP_AUTH_TOKEN
vercel env add WHATSAPP_TO_NUMBER
```

## 🚀 Deployment Steps

### 1. Deploy to Vercel

```bash
# Build and deploy
vercel --prod
```

### 2. Verify Deployment

1. Check API health: `https://your-app.vercel.app/api/health`
2. Test login functionality
3. Verify database connections

### 3. Configure Domain (Optional)

```bash
# Add custom domain
vercel domains add yourdomain.com
```

## 📁 Project Structure

```
rental-management-vercel/
├── app/
│   ├── api/
│   │   ├── health/route.ts
│   │   ├── login/route.ts
│   │   ├── contracts/
│   │   │   ├── route.ts
│   │   │   └── [contractNumber]/sign/route.ts
│   │   ├── charts/
│   │   │   ├── income/route.ts
│   │   │   └── status/route.ts
│   │   ├── settings/notifications/route.ts
│   │   └── notifications/test/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── notifications.ts
│   └── cors.ts
├── components/
├── scripts/
│   ├── init-db.js
│   ├── migrate-data.js
│   └── export-sqlite-data.js
├── vercel.json
├── next.config.js
└── package.json
```

## 🔄 API Endpoints Migration

| Original Cloudflare | New Vercel Endpoint |
|-------------------|-------------------|
| `/api/health` | `/api/health` |
| `/api/login` | `/api/login` |
| `/api/contracts` | `/api/contracts` |
| `/api/contracts/:id/sign` | `/api/contracts/[contractNumber]/sign` |
| `/api/charts/income` | `/api/charts/income` |
| `/api/charts/status` | `/api/charts/status` |
| `/api/settings/notifications` | `/api/settings/notifications` |
| `/api/notifications/test` | `/api/notifications/test` |

## 🛠️ Key Changes Made

### Backend Changes
- ✅ Migrated from Hono to Next.js API Routes
- ✅ Replaced Cloudflare D1 with Vercel Postgres
- ✅ Updated SQL queries for PostgreSQL compatibility
- ✅ Implemented proper JWT authentication
- ✅ Added CORS support for API routes
- ✅ Created serverless-compatible notification system

### Frontend Changes
- ✅ Migrated from Vite to Next.js
- ✅ Updated API configuration for Vercel endpoints
- ✅ Maintained React Router for client-side routing
- ✅ Preserved all UI components and styling
- ✅ Updated build configuration for Vercel Pages

### Database Changes
- ✅ Converted SQLite schema to PostgreSQL
- ✅ Updated data types (INTEGER → SERIAL, REAL → DECIMAL)
- ✅ Added proper foreign key constraints
- ✅ Created migration scripts for data transfer
- ✅ Implemented connection pooling with @vercel/postgres

## 🧪 Testing

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npm run db:init

# Start development server
npm run dev
```

### Production Testing

1. **API Health Check**: Visit `/api/health`
2. **Authentication**: Test admin login with username: `admin`, password: `admin123`
3. **Contract Management**: Create and sign test contracts
4. **Notifications**: Test email/Telegram/WhatsApp if configured

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **Database Access**: Vercel Postgres provides built-in security
3. **CORS**: Configured for your specific domain
4. **Environment Variables**: All sensitive data stored securely in Vercel

## 📊 Performance Optimizations

1. **Connection Pooling**: Using @vercel/postgres for efficient connections
2. **Serverless Functions**: Auto-scaling based on demand
3. **Static Assets**: Optimized delivery via Vercel CDN
4. **Build Optimization**: Next.js optimizations for production

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify POSTGRES_URL is correctly set
   - Check Vercel Postgres dashboard for connection status

2. **JWT Authentication Issues**
   - Ensure JWT_SECRET is set and consistent
   - Check token expiration settings

3. **CORS Errors**
   - Verify NEXT_PUBLIC_API_URL matches your domain
   - Check CORS headers in browser dev tools

4. **Build Failures**
   - Run `npm run type-check` to identify TypeScript issues
   - Check all dependencies are properly installed

### Support

For additional support:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review Next.js API routes guide: [nextjs.org/docs/app/building-your-application/routing/route-handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
3. Vercel Postgres documentation: [vercel.com/docs/storage/vercel-postgres](https://vercel.com/docs/storage/vercel-postgres)

## ✅ Migration Checklist

- [ ] Vercel account created and CLI installed
- [ ] Project linked to Vercel
- [ ] Postgres database created
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Data migrated (if applicable)
- [ ] Application deployed
- [ ] API endpoints tested
- [ ] Frontend functionality verified
- [ ] Notifications tested (if configured)
- [ ] Custom domain configured (if needed)

## 🎉 Post-Migration

Your Rental Management System is now fully migrated to Vercel! The application benefits from:

- **Serverless Architecture**: Auto-scaling and cost-effective
- **PostgreSQL Database**: More robust than SQLite
- **Global CDN**: Fast content delivery worldwide
- **Built-in Analytics**: Monitor performance and usage
- **Zero Configuration**: Automatic HTTPS and deployments