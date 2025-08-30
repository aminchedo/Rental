# 🏠 Professional Rental Management System - Cloudflare Edition

> A comprehensive, production-ready rental property management system built on the modern Cloudflare stack with Persian language support.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Hono](https://img.shields.io/badge/Hono-Framework-orange)](https://hono.dev/)

## ✨ Features

### 🏢 For Property Managers (موجر)
- ✅ **Contract Management** - Create, edit, and manage rental contracts
- ✅ **Digital Signatures** - Secure contract signing with validation
- ✅ **Financial Reports** - Comprehensive income and expense tracking
- ✅ **Tenant Communication** - Automated notifications via email/SMS
- ✅ **Document Generation** - Professional PDF contract generation
- ✅ **Dashboard Analytics** - Real-time insights and statistics
- ✅ **Multi-notification Support** - Email, Telegram, WhatsApp integration

### 🏠 For Tenants (مستأجر)
- ✅ **Secure Access** - Login with contract number and access code
- ✅ **Contract Review** - View complete contract details
- ✅ **Digital Signing** - Sign contracts with digital signature pad
- ✅ **ID Verification** - Optional national ID card upload
- ✅ **Document Download** - Get signed contract PDFs
- ✅ **Mobile Responsive** - Full mobile device support

### 🔧 Technical Features
- ✅ **Serverless Architecture** - Built on Cloudflare Workers
- ✅ **Global CDN** - Fast worldwide performance
- ✅ **Real-time Database** - Cloudflare D1 SQLite
- ✅ **Secure Authentication** - JWT-based with rate limiting
- ✅ **Audit Logging** - Complete activity tracking
- ✅ **Persian RTL Support** - Full right-to-left language support
- ✅ **PWA Ready** - Progressive Web App capabilities

## 🚀 Technology Stack

### Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers (V8 Engine)
- **Framework**: Hono.js (Fast & Lightweight)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare KV (Key-Value)
- **Authentication**: JWT with bcrypt

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with RTL support
- **Routing**: React Router v6
- **State Management**: Zustand + Context API
- **Charts**: Recharts for analytics
- **UI Components**: Headless UI + Custom components

### DevOps & Deployment
- **Build Tool**: Vite
- **Package Manager**: npm
- **Deployment**: Cloudflare Pages + Workers
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Cloudflare Analytics

## 🛠 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI installed globally

### Installation

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up database:**
   ```bash
   wrangler d1 create rental-management-db
   # Update database ID in wrangler.toml
   wrangler d1 execute rental-management-db --file=schema.sql
   ```

3. **Configure secrets:**
   ```bash
   node generate-session-secret.js
   wrangler secret put JWT_SECRET
   ```

4. **Deploy:**
   ```bash
   npm run build
   npm run build:client
   wrangler deploy
   ```

5. **Access the application:**
   - Admin: `admin` / `Admin@123!`
   - Visit your Workers URL

📖 **For detailed setup instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🖥 Screenshots

### Admin Dashboard
![Dashboard](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Admin+Dashboard+-+Analytics+%26+Contract+Management)

### Contract Creation
![Contract Form](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Contract+Creation+-+Comprehensive+Form)

### Digital Signing
![Digital Signing](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Digital+Signature+-+Secure+Signing)

### Mobile Experience
![Mobile View](https://via.placeholder.com/400x800/EF4444/FFFFFF?text=Mobile+Responsive+-+RTL+Support)

## 📊 Performance

- **Global Edge Deployment** - Sub-100ms response times worldwide
- **99.9% Uptime** - Cloudflare's enterprise-grade infrastructure
- **Automatic Scaling** - Handles traffic spikes seamlessly
- **Zero Cold Starts** - Always-on Workers runtime
- **Optimized Bundle** - <500KB initial load

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Protection against brute force
- **Input Validation** - Comprehensive data sanitization
- **Audit Logging** - Complete activity tracking
- **Encrypted Storage** - All sensitive data encrypted
- **CORS Protection** - Proper cross-origin policies

## 🌍 Internationalization

- **Persian (Farsi)** - Primary language with RTL support
- **English** - Secondary language support
- **Custom Fonts** - Vazirmatn and Tahoma for Persian text
- **Date Formatting** - Persian calendar support
- **Number Formatting** - Persian number display

## 📱 Mobile Support

- **Responsive Design** - Works on all screen sizes
- **Touch Optimized** - Mobile-first interactions
- **PWA Features** - Installable web app
- **Offline Capable** - Basic offline functionality
- **Fast Loading** - Optimized for mobile networks

## 🔧 Configuration

### Environment Variables
```bash
# Required
JWT_SECRET=your-secure-jwt-secret

# Optional - Email Notifications
EMAIL_USER=your-sender@domain.com
EMAIL_PASS=your-resend-api-key

# Optional - Telegram Notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Optional - WhatsApp Notifications (Twilio)
WHATSAPP_ACCOUNT_SID=your-twilio-sid
WHATSAPP_AUTH_TOKEN=your-twilio-token
```

### Database Schema
The system uses a comprehensive SQLite schema with:
- User management with roles
- Contract lifecycle tracking
- Payment and expense management
- Maintenance request handling
- Audit logging
- Document storage metadata

## 🧪 Testing

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## 📈 Monitoring

- **Cloudflare Analytics** - Built-in traffic and performance metrics
- **Worker Metrics** - Request count, latency, errors
- **D1 Metrics** - Database performance and usage
- **Custom Logging** - Application-specific logs via `wrangler tail`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cloudflare** - For the amazing serverless platform
- **Hono.js** - For the fast and lightweight framework
- **React Team** - For the excellent frontend library
- **Tailwind CSS** - For the utility-first CSS framework
- **Persian Community** - For RTL and localization feedback

## 📞 Support

- **Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@rental-system.com

---

**Built with ❤️ for the Persian real estate community**

*Empowering property managers with modern, secure, and scalable rental management solutions.*