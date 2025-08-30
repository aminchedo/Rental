# Rental Management System - Vercel Edition

A comprehensive rental management system built with React, TypeScript, and PostgreSQL, deployed on Vercel with serverless functions.

## 🌟 Features

- **Multi-language Support**: Full Persian (RTL) and English interface
- **Digital Contract Management**: Create, sign, and manage rental contracts
- **Dual Authentication**: Admin dashboard and tenant portal access
- **Digital Signatures**: Canvas-based signature capture with national ID upload
- **Real-time Notifications**: Email, Telegram, and WhatsApp integration
- **Analytics Dashboard**: Income tracking and contract status visualization
- **Responsive Design**: Mobile-first approach with dark mode support
- **Persian Calendar**: Jalali date support throughout the system

## 🏗️ Architecture

### Backend (Vercel Serverless Functions)
- **Runtime**: Node.js 18.x
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: JWT-based with bcrypt password hashing
- **API Structure**: RESTful endpoints under `/api`

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with RTL support
- **State Management**: React Context + Local Storage
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React for consistent iconography

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Vercel CLI (`npm i -g vercel`)
- PostgreSQL database (Vercel Postgres recommended)

### 1. Clone and Install
```bash
git clone <your-repo>
cd rental-management-system
npm install
cd client && npm install && cd ..
```

### 2. Database Setup
```bash
# Create Vercel Postgres database
vercel postgres create rental-management-db

# Run migration (replace with your actual database URL)
export POSTGRES_URL="postgresql://..."
psql $POSTGRES_URL -f postgres-migration.sql
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and configure:

```bash
# Required
POSTGRES_URL=your-database-url
JWT_SECRET=your-jwt-secret

# Optional (for notifications)
EMAIL_USER=your-email
EMAIL_PASS=your-password
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
WHATSAPP_ACCOUNT_SID=your-twilio-sid
WHATSAPP_AUTH_TOKEN=your-twilio-token
WHATSAPP_NUMBER=your-whatsapp-number
```

### 4. Local Development
```bash
# Start development server
vercel dev
```

### 5. Deploy to Production
```bash
# Deploy using the provided script
./deploy-vercel.sh

# Or manually
vercel --prod
```

## 📊 Database Schema

### Core Tables
- **users**: Admin user management
- **contracts**: Rental contract storage
- **notification_settings**: System notification preferences
- **expenses**: Property expense tracking
- **payments**: Rent payment records
- **maintenance_requests**: Property maintenance tracking

### Key Features
- PostgreSQL-optimized schema with proper indexing
- Foreign key constraints for data integrity
- Materialized views for analytics performance
- Support for Persian text and RTL layouts

## 🔐 Authentication

### Admin Access
- **Username**: `admin`
- **Password**: `admin123` (change in production!)
- **Capabilities**: Full system access, contract management, analytics

### Tenant Access
- **Method**: Contract Number + Access Code
- **Capabilities**: View own contract, digital signing, payment history

## 📱 API Endpoints

### Authentication
- `POST /api/login` - Admin and tenant authentication
- `GET /api/health` - System health check

### Contracts
- `GET /api/contracts` - List contracts (admin) or get own contract (tenant)
- `POST /api/contracts` - Create new contract (admin only)
- `POST /api/contracts/[contractNumber]/sign` - Sign contract (tenant only)

### Analytics
- `GET /api/charts/income` - Monthly income data (admin only)
- `GET /api/charts/status` - Contract status distribution (admin only)

### Notifications
- `GET /api/settings/notifications` - Get notification settings (admin only)
- `PUT /api/settings/notifications` - Update notification settings (admin only)
- `POST /api/notifications/test` - Test notification services (admin only)

## 🌐 Deployment

### Vercel Configuration
The system is optimized for Vercel with:
- Serverless function routing
- Automatic CORS handling
- Environment variable management
- Static asset optimization

### Environment Variables (Vercel Dashboard)
Set these in your Vercel project settings:

#### Database
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

#### Authentication
- `JWT_SECRET`

#### Notifications (Optional)
- `EMAIL_USER`, `EMAIL_PASS`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- `WHATSAPP_ACCOUNT_SID`, `WHATSAPP_AUTH_TOKEN`, `WHATSAPP_NUMBER`

#### Frontend
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ENVIRONMENT`

## 🔧 Migration from Cloudflare

### Automated Migration
1. Run the export script: `node scripts/export-d1-data.js`
2. Set up PostgreSQL database
3. Run migration: `psql $POSTGRES_URL -f postgres-migration.sql`
4. Import data: `psql $POSTGRES_URL -f data-export/postgres-import.sql`
5. Deploy: `./deploy-vercel.sh`

### Manual Migration Steps
See `VERCEL_MIGRATION_GUIDE.md` for detailed instructions.

## 🧪 Testing

### Automated Verification
```bash
# Run verification script after deployment
API_URL=https://your-app.vercel.app node scripts/verify-migration.js
```

### Manual Testing Checklist
- [ ] Admin login and dashboard access
- [ ] Contract creation with email notifications
- [ ] Tenant login with contract credentials
- [ ] Digital signature workflow
- [ ] Analytics charts display
- [ ] Notification settings management
- [ ] Persian RTL layout and text rendering
- [ ] Dark mode toggle
- [ ] Mobile responsive design

## 🛠️ Development

### Local Development
```bash
# Start Vercel development server
vercel dev

# Or start frontend only (with API proxy)
cd client && npm run dev
```

### Project Structure
```
├── api/                    # Vercel serverless functions
│   ├── lib/               # Shared utilities
│   │   ├── auth.ts        # JWT authentication
│   │   ├── db.ts          # PostgreSQL helpers
│   │   └── notifications.ts # Notification services
│   ├── contracts/         # Contract management
│   ├── charts/           # Analytics endpoints
│   ├── settings/         # System configuration
│   └── notifications/    # Notification testing
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   └── config/       # API configuration
├── scripts/              # Migration and utility scripts
├── postgres-migration.sql # Database schema
└── vercel.json          # Vercel configuration
```

## 📈 Performance

### Optimizations
- **Database**: Connection pooling with `@vercel/postgres`
- **Frontend**: Code splitting and lazy loading
- **Assets**: Vercel CDN for static files
- **Caching**: Browser caching for static assets

### Monitoring
- Vercel Analytics for performance insights
- Function logs for debugging
- Error tracking in production

## 🔒 Security

### Implemented Measures
- JWT token-based authentication
- Parameterized SQL queries (SQL injection prevention)
- CORS configuration for production domains
- Environment variable encryption
- Input validation and sanitization

### Production Security Checklist
- [ ] Change default admin password
- [ ] Configure production CORS origins
- [ ] Set up HTTPS-only cookies
- [ ] Enable Vercel security headers
- [ ] Regular security updates

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify `POSTGRES_URL` is correctly set
- Check database server accessibility
- Ensure connection pooling is configured

#### Authentication Issues
- Verify `JWT_SECRET` is set and consistent
- Check token expiration (24h default)
- Validate CORS configuration

#### Notification Failures
- Verify service credentials are correct
- Check network connectivity to external APIs
- Validate recipient information format

### Debug Mode
Set `NODE_ENV=development` for detailed error logging.

## 📞 Support

For issues and questions:
1. Check Vercel function logs
2. Review database connection status
3. Validate environment variables
4. Test individual API endpoints

## 🔄 Updates

To update the system:
1. Make changes to code
2. Test locally with `vercel dev`
3. Deploy with `vercel --prod`
4. Run verification script

## 📄 License

MIT License - see LICENSE file for details.