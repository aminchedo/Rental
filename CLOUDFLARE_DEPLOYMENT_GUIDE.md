# Cloudflare Deployment Guide
## Rental Management System Migration

This guide provides comprehensive instructions for deploying your Rental Management System to Cloudflare's edge infrastructure.

## 🏗️ Architecture Overview

Your application will be deployed using:
- **Cloudflare Workers** - Serverless API backend
- **Cloudflare D1** - SQLite database at the edge
- **Cloudflare KV** - Key-value storage for caching
- **Cloudflare Pages** - Static site hosting for React frontend
- **Hono Framework** - Lightweight web framework for Workers

## 📋 Prerequisites

1. **Cloudflare Account** - Free tier is sufficient for development
2. **Node.js** - Version 18 or higher
3. **Wrangler CLI** - Cloudflare's command-line tool

### Install Wrangler CLI

```bash
npm install -g wrangler
```

### Login to Cloudflare

```bash
wrangler login
```

## 🚀 Quick Deployment

For a fully automated deployment, run:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will handle the entire deployment process automatically.

## 📖 Manual Deployment Steps

If you prefer to deploy manually or need to troubleshoot:

### Step 1: Prepare the Project

```bash
# Clone or navigate to your project
cd rental-management-system

# Install Worker dependencies
npm install
```

### Step 2: Create Cloudflare Resources

#### Create D1 Database

```bash
wrangler d1 create rental-management-db
```

Copy the `database_id` from the output and update `wrangler.toml`.

#### Create KV Namespace

```bash
wrangler kv:namespace create RENTAL_KV
```

Copy the `id` from the output and update `wrangler.toml`.

#### Update Configuration

Edit `wrangler.toml` and replace:
- `YOUR_D1_DATABASE_ID` with your actual database ID
- `YOUR_KV_NAMESPACE_ID` with your actual KV namespace ID

### Step 3: Database Migration

```bash
# Apply database schema
wrangler d1 execute rental-management-db --file=schema.sql

# Verify tables were created
wrangler d1 execute rental-management-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Step 4: Configure Secrets

Set up required secrets for your application:

```bash
# Required: JWT signing secret
wrangler secret put JWT_SECRET
# Enter a strong random string (e.g., generated with openssl rand -base64 32)

# Email service configuration (using Resend as example)
wrangler secret put EMAIL_USER
# Enter your "from" email address

wrangler secret put EMAIL_PASS
# Enter your Resend API key

# Optional: Telegram notifications
wrangler secret put TELEGRAM_BOT_TOKEN
# Enter your Telegram bot token

# Optional: WhatsApp notifications (via Twilio)
wrangler secret put WHATSAPP_ACCOUNT_SID
wrangler secret put WHATSAPP_AUTH_TOKEN
```

### Step 5: Deploy Worker API

```bash
# Deploy to production
wrangler deploy

# Deploy to development environment
wrangler deploy --env development
```

### Step 6: Deploy Frontend

```bash
cd client

# Install dependencies
npm install

# Build for production
npm run build

# Update API URL in environment config
# Edit client/.env.production and set your Worker URL

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=rental-management-frontend
```

### Step 7: Test Deployment

```bash
# Test Worker API health endpoint
curl https://rental-management-api.your-subdomain.workers.dev/api/health

# Expected response: {"status":"OK","timestamp":"..."}
```

## 🔧 Configuration Details

### Environment Variables

#### Worker Environment Variables (wrangler.toml)
```toml
[vars]
ENVIRONMENT = "production"
```

#### Frontend Environment Variables (.env.production)
```env
VITE_API_URL=https://rental-management-api.your-subdomain.workers.dev
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Database Schema

The D1 database includes these main tables:
- `users` - Admin users and authentication
- `contracts` - Rental contracts and tenant information
- `notification_settings` - Email, Telegram, WhatsApp configuration
- `expenses` - Property-related expenses
- `payments` - Rent payment tracking
- `maintenance_requests` - Maintenance and repair requests

### API Endpoints

The Worker API provides these endpoints:

#### Authentication
- `POST /api/login` - Admin/tenant login
- JWT-based authentication with bearer tokens

#### Contracts
- `GET /api/contracts` - List contracts (admin) or get single contract (tenant)
- `POST /api/contracts` - Create new contract (admin only)
- `POST /api/contracts/:contractNumber/sign` - Sign contract (tenant only)

#### Analytics
- `GET /api/charts/income` - Monthly income data
- `GET /api/charts/status` - Contract status distribution

#### Notifications
- `GET /api/settings/notifications` - Get notification settings
- `POST /api/notifications/test` - Test notification services

## 🔐 Security Configuration

### CORS Settings

The Worker is configured with CORS for:
- `http://localhost:5173` (development)
- `https://your-frontend-domain.pages.dev` (production)

Update the CORS origins in `src/index.ts` for your domain.

### Content Security Policy

The frontend includes CSP headers in `client/wrangler.toml`:
```toml
[[headers]]
for = "/*"
[headers.values]
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-worker-domain"
```

### Authentication Flow

1. Admin login: username/password → JWT token
2. Tenant login: contract number/access code → JWT token
3. JWT tokens stored in localStorage
4. Automatic token refresh on API calls
5. Logout clears tokens and redirects to login

## 📧 Email Service Setup

### Using Resend (Recommended)

1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Verify your domain
4. Set secrets:
   ```bash
   wrangler secret put EMAIL_USER
   # Enter: your-verified-domain@yourdomain.com
   
   wrangler secret put EMAIL_PASS
   # Enter: your-resend-api-key
   ```

### Using Other Email Services

The email function in `src/index.ts` can be adapted for:
- SendGrid
- Mailgun
- AWS SES
- Any REST API-based email service

## 📱 Notification Services

### Telegram Setup

1. Create bot with [@BotFather](https://t.me/botfather)
2. Get bot token
3. Set up webhook or use polling
4. Configure:
   ```bash
   wrangler secret put TELEGRAM_BOT_TOKEN
   ```

### WhatsApp Setup (via Twilio)

1. Create Twilio account
2. Set up WhatsApp Business API
3. Configure:
   ```bash
   wrangler secret put WHATSAPP_ACCOUNT_SID
   wrangler secret put WHATSAPP_AUTH_TOKEN
   ```

## 🔍 Monitoring and Debugging

### Wrangler Commands

```bash
# View live logs
wrangler tail

# View deployed versions
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]

# Check secrets
wrangler secret list
```

### Database Operations

```bash
# Query database
wrangler d1 execute rental-management-db --command="SELECT * FROM contracts LIMIT 5;"

# Backup database
wrangler d1 export rental-management-db --output=backup.sql

# Import data
wrangler d1 execute rental-management-db --file=backup.sql
```

### Performance Monitoring

- Use Cloudflare Analytics dashboard
- Monitor Worker CPU time and memory usage
- Track D1 database operations
- Set up alerts for errors

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: D1_ERROR: no such table: contracts
```
**Solution:** Run the database migration:
```bash
wrangler d1 execute rental-management-db --file=schema.sql
```

#### 2. CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution:** Update CORS origins in `src/index.ts` to include your frontend domain.

#### 3. JWT Token Issues
```
Error: Invalid JWT token
```
**Solution:** Ensure `JWT_SECRET` is set and consistent across deployments:
```bash
wrangler secret put JWT_SECRET
```

#### 4. Email Service Errors
```
Email API error: Unauthorized
```
**Solution:** Verify email service credentials and domain verification.

### Debug Mode

Enable debug logging by setting environment variable:
```bash
# In wrangler.toml
[env.development.vars]
DEBUG = "true"
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Deploy new version
wrangler deploy

# Update database schema
wrangler d1 execute rental-management-db --file=schema-updates.sql

# Update frontend
cd client && npm run build && wrangler pages deploy dist
```

### Backup Strategy

```bash
# Regular database backups
wrangler d1 export rental-management-db --output=backup-$(date +%Y%m%d).sql

# Store backups in R2 or external storage
```

## 💰 Cost Optimization

### Free Tier Limits

- **Workers:** 100,000 requests/day
- **D1:** 25 GB storage, 25 billion reads/month
- **KV:** 100,000 reads/day, 1,000 writes/day
- **Pages:** Unlimited static requests

### Optimization Tips

1. **Caching:** Use KV for frequently accessed data
2. **Compression:** Enable Brotli compression
3. **Image Optimization:** Use Cloudflare Image Resizing
4. **CDN:** Leverage Cloudflare's global CDN

## 📞 Support

### Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [Hono Framework Documentation](https://hono.dev/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

### Getting Help

1. Check Cloudflare Community Forum
2. Review Workers Discord channel
3. Open issues in the project repository
4. Consult Cloudflare support for account-specific issues

---

## 🎉 Congratulations!

Your Rental Management System is now running on Cloudflare's edge infrastructure with:

✅ Global distribution and low latency  
✅ Automatic scaling and high availability  
✅ Modern serverless architecture  
✅ Cost-effective hosting  
✅ Enterprise-grade security  

Your application is ready to serve users worldwide with Persian RTL support and all original functionality preserved.