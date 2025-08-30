# 🏠 Rental Management System - Vercel Edition

A comprehensive rental property management system built with Next.js and deployed on Vercel, featuring Persian/Farsi language support and RTL layout.

## 🚀 Features

- **Contract Management**: Create, sign, and manage rental contracts
- **Tenant Portal**: Secure access for tenants to view their contracts
- **Financial Analytics**: Income tracking and expense management
- **Multi-channel Notifications**: Email, Telegram, and WhatsApp support
- **Persian/RTL Interface**: Full Persian language support with RTL layout
- **Digital Signatures**: Electronic contract signing capability
- **Document Upload**: National ID and receipt image management

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Vercel Postgres with connection pooling
- **Authentication**: JWT-based stateless authentication
- **Deployment**: Vercel (auto-scaling serverless)
- **Notifications**: Resend (Email), Telegram API, Twilio (WhatsApp)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Vercel account
- Git repository

### Installation

1. **Clone and Install**
```bash
git clone <your-repo>
cd rental-management-vercel
npm install
```

2. **Environment Setup**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

3. **Database Setup**
```bash
# Create Vercel Postgres database
vercel postgres create rental-management-db

# Initialize schema
npm run db:init

# Optional: Migrate existing data
npm run db:migrate
```

4. **Development**
```bash
npm run dev
```

5. **Deploy**
```bash
vercel --prod
```

## 🔧 Configuration

### Required Environment Variables

```env
# Database (Auto-configured by Vercel)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Email (Resend)
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=re_your-resend-api-key

# Optional: Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Optional: WhatsApp (Twilio)
WHATSAPP_ACCOUNT_SID=your-twilio-sid
WHATSAPP_AUTH_TOKEN=your-twilio-token
WHATSAPP_TO_NUMBER=+1234567890
```

## 🔐 Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

⚠️ **Important**: Change the default admin password in production!

## 📱 Usage

### Admin Dashboard
1. Login with admin credentials
2. Create new rental contracts
3. View analytics and reports
4. Manage notification settings
5. Track payments and expenses

### Tenant Portal
1. Login with contract number and access code
2. View contract details
3. Sign contracts digitally
4. Upload required documents

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/login` | Authentication |
| GET | `/api/contracts` | List contracts |
| POST | `/api/contracts` | Create contract |
| POST | `/api/contracts/[contractNumber]/sign` | Sign contract |
| GET | `/api/charts/income` | Income analytics |
| GET | `/api/charts/status` | Status analytics |
| GET/POST | `/api/settings/notifications` | Notification settings |
| POST | `/api/notifications/test` | Test notifications |

## 🗄️ Database Schema

### Tables
- **users**: Admin user management
- **contracts**: Rental contract storage
- **notification_settings**: Notification preferences
- **expenses**: Expense tracking
- **payments**: Payment records
- **maintenance_requests**: Maintenance tracking

## 🔔 Notification Services

### Email (Resend)
- Contract creation notifications
- Signing confirmations
- System alerts

### Telegram
- Real-time contract updates
- System status notifications

### WhatsApp (Twilio)
- Important contract notifications
- Urgent system alerts

## 🧪 Testing

### Local Testing
```bash
npm run dev
npm run verify-deployment
```

### Production Testing
```bash
# Verify all endpoints
node scripts/verify-deployment.js
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:init` - Initialize database
- `npm run db:migrate` - Migrate data
- `npm run type-check` - TypeScript validation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable security
- SQL injection prevention
- XSS protection

## 🌐 Internationalization

- Full Persian/Farsi language support
- RTL (Right-to-Left) layout
- Persian date formatting
- Localized error messages

## 📊 Analytics & Monitoring

- Income tracking by month
- Contract status distribution
- Payment analytics
- Vercel Analytics integration
- Real-time performance monitoring

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Verify POSTGRES_URL is set
2. **Authentication**: Check JWT_SECRET configuration
3. **CORS Errors**: Verify NEXT_PUBLIC_API_URL
4. **Build Errors**: Run `npm run type-check`

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for the Persian rental management community**