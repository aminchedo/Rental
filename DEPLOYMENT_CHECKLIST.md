# 🚀 Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Setup ✅
- [ ] Node.js 20.x installed
- [ ] TypeScript globally available
- [ ] Backend dependencies installed (`npm ci`)
- [ ] Frontend dependencies installed (`npm ci`)

### 2. Build Verification ✅
```bash
# Backend build
cd backend && npm run build
# Should complete without errors

# Frontend build  
cd client && npm run build
# Should create dist/ directory
```

### 3. Log Files Present ✅
```bash
ls -lh logs/
# Required files:
# - api.log
# - dataset_sources.json
# - eval_full.json
# - train_full.log
# - stt.log
# - tts.log
```

### 4. Model Files ✅
```bash
ls -lh models/persian-chat/
# Should contain:
# - config.json
```

### 5. Environment Variables
```bash
# Create .env file
cat > .env << 'ENVFILE'
NODE_ENV=production
PORT=3001

# Optional: Custom API Override
# CUSTOM_API_ENDPOINT=https://api.example.com/v1
# CUSTOM_API_KEY=your-key-here

# Model Config
MODEL_PATH=./models/persian-chat
MAX_LENGTH=512
TEMPERATURE=0.3
ENVFILE
```

### 6. Settings Override Test ✅
```bash
# Test local model path (default)
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام","stream":false}'

# Check log shows "local" source
grep '"api_source":"local"' logs/api.log
```

### 7. Voice Routes ✅
```bash
# Test STT
curl -X GET http://localhost:3001/api/stt/status

# Test TTS  
curl -X GET http://localhost:3001/api/tts/status
```

## Deployment Steps

### Option A: PM2 (Recommended)

```bash
# 1. Install PM2
npm install -g pm2

# 2. Start services
pm2 start pm2/ecosystem.config.js --env production

# 3. Save configuration
pm2 save

# 4. Enable startup
pm2 startup systemd
```

### Option B: Docker

```bash
# 1. Build images
docker-compose build

# 2. Start containers
docker-compose up -d

# 3. Check status
docker-compose ps
```

### Option C: Manual

```bash
# 1. Start backend
cd backend && npm start &

# 2. Start frontend (production)
cd client && npm run preview &
```

## Post-Deployment Verification

### 1. Health Checks
```bash
# Backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

### 2. API Tests
```bash
# Run validation script
bash scripts/validate_api.sh
# Should show ✅ for all tests
```

### 3. Voice E2E
```bash
# Run Playwright tests
npx playwright test tests/e2e/voice-e2e.spec.ts
```

### 4. Accessibility
```bash
# Run a11y tests
npx playwright test tests/e2e/accessibility.spec.ts
```

### 5. Monitoring Dashboard
- Navigate to http://localhost:3000/monitoring/metrics
- Verify all metrics display correctly
- Check alert badges show proper colors

### 6. Settings Override
- Go to Settings page
- Add custom API endpoint + key
- Save settings
- Send message in Playground
- Verify logs show "external" source:
  ```bash
  grep '"api_source":"external"' logs/api.log
  ```

## Production Deployment (VPS)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Clone & Build
```bash
# Clone repository
cd /var/www
sudo git clone <repo-url> persian-chat
cd persian-chat

# Install dependencies
npm ci
cd backend && npm ci && npm run build && cd ..
cd client && npm ci && npm run build && cd ..
```

### 3. Configure Nginx
```bash
# Copy config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/persian-chat
sudo ln -s /etc/nginx/sites-available/persian-chat /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### 4. SSL Certificate
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com
```

### 5. Start Services
```bash
pm2 start pm2/ecosystem.config.js --env production
pm2 save
sudo pm2 startup systemd
```

### 6. Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Monitoring

### PM2 Dashboard
```bash
pm2 status
pm2 logs
pm2 monit
```

### Log Files
```bash
# API logs
tail -f logs/api.log

# Nginx logs
sudo tail -f /var/log/nginx/persian-chat-access.log
sudo tail -f /var/log/nginx/persian-chat-error.log
```

### Metrics Dashboard
- Access: https://your-domain.com/monitoring/metrics
- Check all metrics are updating
- Verify alert thresholds are correct

## Rollback Procedure

### Quick Rollback
```bash
# Stop services
pm2 stop all

# Restore from backup
git checkout <previous-commit>

# Rebuild
cd backend && npm run build && cd ..
cd client && npm run build && cd ..

# Restart
pm2 restart all
```

## Success Criteria ✅

- [ ] Backend running on port 3001
- [ ] Frontend accessible at domain root
- [ ] API streaming works
- [ ] Voice routes operational
- [ ] Metrics dashboard displays data
- [ ] Settings override/fallback functional
- [ ] All logs being written
- [ ] SSL certificate valid
- [ ] PM2 processes stable
- [ ] Nginx reverse proxy working

---

**Last Updated:** 2025-10-09  
**Deployment Version:** 3.0
