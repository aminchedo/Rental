# 🚀 Deployment Guide - Rental Contract Management System

This guide provides step-by-step instructions for deploying the rental contract management system to production using Render.com.

## 📋 Prerequisites

- A [Render.com](https://render.com) account
- Your code repository pushed to GitHub/GitLab
- Basic understanding of environment variables

## 🏗️ Deployment Architecture

The application consists of two services:
1. **Frontend**: React application (Static Site)
2. **Backend**: Node.js/Express server (Web Service)

## 📂 Project Structure for Deployment

```
rental-contract-system/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── dist/              # Built files (generated)
├── server/                # Node.js backend
│   ├── server.js
│   ├── database.js
│   ├── Dockerfile         # ✅ Created in this guide
│   └── package.json
├── render.yaml            # ✅ Created in this guide
└── DEPLOYMENT_GUIDE.md    # ✅ This file
```

## 🔧 Step-by-Step Deployment Instructions

### Step 1: Prepare Your Repository

1. **Push to GitHub/GitLab**:
   ```bash
   git add .
   git commit -m "feat: add deployment configuration files"
   git push origin main
   ```

2. **Verify Files**: Ensure these files exist in your repository:
   - `server/Dockerfile`
   - `render.yaml` (in root directory)
   - All source code committed

### Step 2: Create Render Account and Connect Repository

1. **Sign up/Login** to [Render.com](https://render.com)
2. **Connect GitHub/GitLab**: Link your repository to Render
3. **Select Repository**: Choose your rental contract system repository

### Step 3: Deploy Using render.yaml (Recommended)

1. **Create New Blueprint**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Select your connected repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:
   Set these in Render Dashboard for the backend service:
   ```
   SESSION_SECRET=your-secure-random-string-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   NODE_ENV=production
   ```

3. **Deploy**: Click "Apply" to start the deployment

### Step 4: Alternative Manual Deployment

If you prefer manual service creation:

#### 4a. Deploy Backend (Web Service)

1. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Select `server` directory as root

2. **Configure Backend**:
   ```
   Name: rental-contract-backend
   Environment: Node
   Build Command: npm ci
   Start Command: npm start
   ```

3. **Set Environment Variables** (same as above)

4. **Add Persistent Disk**:
   - Name: `rental-contract-data`
   - Mount Path: `/app/data`
   - Size: 1GB (for SQLite database)

#### 4b. Deploy Frontend (Static Site)

1. **Create Static Site**:
   - Click "New +" → "Static Site"
   - Connect your repository
   - Select `client` directory as root

2. **Configure Frontend**:
   ```
   Name: rental-contract-frontend
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   ```

### Step 5: Configure Frontend-Backend Communication

1. **Get Backend URL**: Copy your backend service URL from Render (e.g., `https://your-backend.onrender.com`)

2. **Update Frontend Configuration**:
   In your `client/src` code, you may need to update API base URLs to point to your production backend URL instead of `localhost:5001`.

   **Option A**: Create environment-based configuration
   **Option B**: Update axios base URL in your React app

### Step 6: Database Setup

1. **Database Initialization**: The SQLite database will be created automatically on first run
2. **Persistent Storage**: The database file will be stored on the persistent disk mounted at `/app/data`
3. **Admin User**: The default admin user (admin/admin) will be created automatically

### Step 7: SSL and Custom Domain (Optional)

1. **SSL Certificate**: Render provides automatic SSL certificates
2. **Custom Domain**: You can add your custom domain in the service settings
3. **CORS Configuration**: Update CORS settings in `server/server.js` if needed for your domain

## 🔐 Environment Variables Reference

### Backend Service Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | ✅ |
| `PORT` | Server port | `5001` | ✅ |
| `SESSION_SECRET` | Session encryption key | `your-secure-random-string` | ✅ |
| `EMAIL_USER` | SMTP email username | `your-email@gmail.com` | ⚠️ |
| `EMAIL_PASS` | SMTP email password | `your-app-password` | ⚠️ |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` | ⚠️ |
| `EMAIL_PORT` | SMTP server port | `587` | ⚠️ |

**Note**: Email variables are optional but recommended for contract notifications.

### Frontend Service Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | ✅ |

## 🔍 Deployment Verification

After deployment, verify these endpoints:

1. **Frontend**: Your static site URL should load the login page
2. **Backend Health**: `https://your-backend.onrender.com/api/health` should return status OK
3. **Database**: Login with admin/admin should work
4. **Features**: Test image upload, chart loading, and dark mode toggle

## 📱 Production Configuration Notes

### Database
- **SQLite File**: Stored on persistent disk at `/app/data/contracts.db`
- **Backups**: Consider implementing regular backups of the SQLite file
- **Scaling**: For high traffic, consider migrating to PostgreSQL

### Performance
- **Static Assets**: Frontend assets are served via Render's CDN
- **Caching**: Render provides automatic caching for static assets
- **Compression**: Gzip compression is enabled by default

### Security
- **HTTPS**: All traffic is automatically encrypted with SSL
- **Environment Variables**: Sensitive data stored securely in Render
- **File Uploads**: Image uploads are validated and size-limited

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Database Issues**:
   - Ensure persistent disk is properly mounted
   - Check database initialization in logs
   - Verify file permissions

3. **CORS Errors**:
   - Update CORS origin in `server/server.js`
   - Add your frontend domain to allowed origins

4. **Environment Variables**:
   - Double-check all required environment variables are set
   - Verify EMAIL settings if email features are not working

### Logs and Monitoring

- **Access Logs**: Available in Render dashboard
- **Error Monitoring**: Check service logs for errors
- **Health Checks**: Monitor `/api/health` endpoint status

## 🔄 Updates and Maintenance

### Deploying Updates

1. **Push Changes**: 
   ```bash
   git push origin main
   ```

2. **Automatic Deployment**: Render will automatically redeploy on git push

3. **Manual Deployment**: Use "Manual Deploy" button in Render dashboard if needed

### Database Migrations

For future database schema changes:
1. Create migration scripts
2. Run during deployment or manually via Render shell
3. Test on staging environment first

## 🎯 Production Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Email configuration is working (test notifications)
- [ ] Database is properly initialized with admin user
- [ ] SSL certificate is active
- [ ] All features tested in production environment
- [ ] Backup strategy implemented for database
- [ ] Monitoring and logging configured
- [ ] Custom domain configured (if applicable)

## 📞 Support

For deployment issues:
1. Check Render documentation: [docs.render.com](https://docs.render.com)
2. Review service logs in Render dashboard
3. Test locally first to isolate issues
4. Check GitHub repository for latest updates

---

**Deployment Configuration Created**: December 2024  
**Platform**: Render.com  
**Architecture**: Static Site + Web Service + Persistent Storage  
**Database**: SQLite with persistent disk  
**SSL**: Automatic HTTPS  
**Status**: ✅ Production Ready