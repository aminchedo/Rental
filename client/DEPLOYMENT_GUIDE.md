# Frontend Deployment Guide - Cloudflare Integration

## Production Deployment to Cloudflare Pages

### Prerequisites
- Cloudflare account with Pages enabled
- Wrangler CLI installed: `npm install -g wrangler`
- Authenticated with Cloudflare: `wrangler auth login`

### Environment Configuration

#### Production Environment Variables
```bash
VITE_API_BASE_URL=https://rental-management-api.amin-chinisaz-edu.workers.dev
VITE_APP_ENV=production
```

#### Development Environment Variables
```bash
VITE_API_BASE_URL=https://rental-management-api.amin-chinisaz-edu.workers.dev
VITE_APP_ENV=development
```

### Deployment Commands

#### Production Deployment
```bash
# Build and deploy to production
npm run deploy

# Or step by step:
npm run build:production
npx wrangler pages deploy dist --project-name=rental-management-frontend
```

#### Preview Deployment
```bash
# Build and deploy to preview environment
npm run deploy:preview
```

### Manual Deployment Steps

1. **Build the application:**
```bash
cd client
npm install
npm run build:production
```

2. **Deploy to Cloudflare Pages:**
```bash
npx wrangler pages deploy dist --project-name=rental-management-frontend --compatibility-date=2025-03-07
```

3. **Set environment variables in Cloudflare Dashboard:**
   - Go to Cloudflare Dashboard → Pages → rental-management-frontend
   - Navigate to Settings → Environment Variables
   - Add production variables:
     - `VITE_API_BASE_URL`: `https://rental-management-api.amin-chinisaz-edu.workers.dev`
     - `VITE_APP_ENV`: `production`

### Production Verification

After deployment, verify the following:

1. **API Connectivity:**
```bash
# Test from deployed frontend
curl https://rental-management-frontend.pages.dev
```

2. **Health Check:**
```bash
# Verify API endpoint is reachable
curl https://rental-management-api.amin-chinisaz-edu.workers.dev/api/health
```

3. **Admin Login Test:**
   - Username: `admin`
   - Password: `admin`

4. **Performance Check:**
   - Page load time < 2 seconds
   - Mobile responsiveness
   - Persian RTL layout

### Expected URLs
- **Frontend**: `https://rental-management-frontend.pages.dev`
- **Backend API**: `https://rental-management-api.amin-chinisaz-edu.workers.dev`

### Troubleshooting

#### Common Issues:

1. **Environment Variables Not Loading:**
   - Check Cloudflare Pages dashboard environment variables
   - Ensure variables start with `VITE_` prefix
   - Redeploy after changing environment variables

2. **API Calls Failing:**
   - Verify CORS settings in backend
   - Check API endpoint URLs
   - Confirm JWT token handling

3. **Build Failures:**
   - Check Node.js version compatibility
   - Clear node_modules and reinstall
   - Verify all dependencies are installed

4. **Persian Font Issues:**
   - Ensure Vazirmatn font is loaded
   - Check RTL CSS directives
   - Verify text alignment in production

### Production Features Enabled

✅ **Real API Integration**
- Production Cloudflare Worker endpoints
- JWT authentication with real tokens
- Database-backed contract management

✅ **Persian Localization**
- RTL layout support
- Persian error messages
- Vazirmatn font loading

✅ **Performance Optimization**
- Code splitting for faster loads
- Asset optimization
- CDN delivery via Cloudflare

✅ **Mobile Support**
- Responsive design
- Touch-friendly interface
- PWA capabilities

### Security Features

- HTTPS enforced
- JWT token expiration handling
- Input validation and sanitization
- CORS protection
- Rate limiting via Cloudflare

### Monitoring

Monitor the application via:
- Cloudflare Analytics
- Real User Monitoring (RUM)
- Performance insights
- Error tracking

For support, check the logs in Cloudflare Dashboard → Workers & Pages → rental-management-frontend → Functions.