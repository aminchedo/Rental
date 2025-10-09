# Deployment Guide - Persian Chat Application

This guide provides step-by-step instructions for deploying the Persian chat application on a CPU-only VPS.

---

## Prerequisites

### System Requirements
- **OS:** Ubuntu 20.04+ (or similar Linux distribution)
- **CPU:** Minimum 4 vCPUs
- **RAM:** Minimum 8 GB
- **Storage:** Minimum 20 GB free space
- **Network:** Public IP address and domain name (for HTTPS)

### Required Software
- Python 3.10+
- Node.js 18.x+
- Nginx
- PM2
- Git
- Certbot (for Let's Encrypt SSL)

---

## Step 1: Initial Server Setup

### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x
npm --version
```

### 1.3 Install Python 3.10+
```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version  # Should show 3.10+
```

### 1.4 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl status nginx  # Should be active
```

### 1.5 Install PM2
```bash
sudo npm install -g pm2
pm2 --version
```

### 1.6 Install Git
```bash
sudo apt install -y git
git --version
```

### 1.7 Install Certbot (for SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
certbot --version
```

---

## Step 2: Clone and Setup Application

### 2.1 Create Application Directory
```bash
sudo mkdir -p /var/www
cd /var/www
```

### 2.2 Clone Repository
```bash
sudo git clone <your-repository-url> persian-chat
sudo chown -R $USER:$USER persian-chat
cd persian-chat
```

### 2.3 Setup Python Environment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# For CPU-only PyTorch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### 2.4 Create Required Directories
```bash
mkdir -p logs models datasets
```

---

## Step 3: Prepare Dataset and Train Model

### 3.1 Prepare Datasets
```bash
# Download and prepare datasets
# [Manual download from HuggingFace or automated script]

# Validate datasets
python3 scripts/check_dataset.py
```

### 3.2 Train Model (CPU)
```bash
# This will take several hours on CPU
python3 scripts/train_cpu.py \
  --epochs 3 \
  --batch_size 4 \
  --lr 5e-5 \
  --max_length 512 \
  --seed 42

# Monitor training
tail -f logs/train.log
```

### 3.3 Evaluate Model
```bash
python3 scripts/eval_cpu.py \
  --data datasets/test.jsonl \
  --model models/persian-chat

# Check results
cat logs/eval.json
```

---

## Step 4: Setup Backend

### 4.1 Install Backend Dependencies
```bash
cd backend  # or cd server (depending on your setup)
npm install
cd ..
```

### 4.2 Configure Environment
```bash
# Create .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=3001
MODEL_PATH=../models/persian-chat
LOG_LEVEL=info
EOF
```

### 4.3 Test Backend
```bash
cd backend
npm start &
sleep 3

# Test API
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام","stream":false}'

# Stop test server
pkill -f "node.*server"
cd ..
```

---

## Step 5: Setup Frontend

### 5.1 Install Frontend Dependencies
```bash
cd frontend  # or cd client
npm install
```

### 5.2 Build Frontend
```bash
# Production build
npm run build

# Verify build
ls -lh dist/  # or .next/ for Next.js
cd ..
```

---

## Step 6: Configure Nginx

### 6.1 Update Nginx Configuration
```bash
# Edit nginx config with your domain
sudo nano nginx/nginx.conf

# Replace 'your-domain.com' with your actual domain in:
# - server_name
# - ssl_certificate paths
```

### 6.2 Install Nginx Config
```bash
# Copy config to Nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/persian-chat

# Create symlink
sudo ln -s /etc/nginx/sites-available/persian-chat /etc/nginx/sites-enabled/

# Remove default config (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

### 6.3 Initial Nginx Start (HTTP only)
```bash
# Temporarily comment out SSL sections in nginx.conf
# Then reload
sudo systemctl reload nginx
```

---

## Step 7: Setup SSL with Let's Encrypt

### 7.1 Obtain SSL Certificate
```bash
# Make sure your domain points to your server IP
# Then run:
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts and provide email
```

### 7.2 Verify Certificate
```bash
sudo ls -l /etc/letsencrypt/live/your-domain.com/
# Should show: fullchain.pem, privkey.pem, chain.pem
```

### 7.3 Update Nginx with SSL
```bash
# Uncomment SSL sections in nginx.conf
# Update certificate paths if needed
sudo nano /etc/nginx/sites-available/persian-chat

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7.4 Setup Auto-renewal
```bash
# Certbot auto-renewal is usually enabled by default
# Verify with:
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run
```

---

## Step 8: Deploy with PM2

### 8.1 Update PM2 Configuration
```bash
# Edit pm2/ecosystem.config.js
# Update paths and settings as needed
nano pm2/ecosystem.config.js
```

### 8.2 Start Applications
```bash
# Start all processes
pm2 start pm2/ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs

# Monitor
pm2 monit
```

### 8.3 Save PM2 Configuration
```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup systemd

# Follow the instructions provided by PM2
# Usually: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

### 8.4 Verify PM2 Auto-start
```bash
# Reboot and check
sudo reboot

# After reboot, check PM2
pm2 status  # Processes should be running
```

---

## Step 9: Firewall Configuration

### 9.1 Configure UFW (Ubuntu Firewall)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Step 10: Verification

### 10.1 Run Acceptance Tests
```bash
cd /var/www/persian-chat

# Run full acceptance test
bash scripts/acceptance.sh
```

### 10.2 Manual Testing

#### Test Backend API
```bash
# Health check
curl https://your-domain.com/health

# API test
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام","stream":false}'
```

#### Test Frontend
```bash
# Open in browser
firefox https://your-domain.com

# Or test with curl
curl -I https://your-domain.com
```

### 10.3 Check Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/persian-chat-access.log
sudo tail -f /var/log/nginx/persian-chat-error.log

# Application logs
tail -f logs/train.log
tail -f logs/eval.json
tail -f logs/api_requests.log
```

---

## Step 11: Monitoring & Maintenance

### 11.1 PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# Restart if needed
pm2 restart persian-chat-api
pm2 restart persian-chat-frontend
```

### 11.2 Log Rotation
```bash
# PM2 log rotation (install module)
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 11.3 Nginx Log Rotation
Nginx log rotation is usually configured automatically in `/etc/logrotate.d/nginx`

### 11.4 System Resource Monitoring
```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Step 12: Backup Strategy

### 12.1 Backup Model and Data
```bash
# Create backup script
cat > /var/www/persian-chat/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/persian-chat"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup model
tar -czf $BACKUP_DIR/model_$DATE.tar.gz models/

# Backup datasets
tar -czf $BACKUP_DIR/datasets_$DATE.tar.gz datasets/

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Keep only last 7 backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/persian-chat/backup.sh
```

### 12.2 Schedule Backups (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/persian-chat/backup.sh >> /var/log/persian-chat-backup.log 2>&1
```

---

## Step 13: Security Hardening

### 13.1 Secure SSH
```bash
# Disable root login and password authentication
sudo nano /etc/ssh/sshd_config

# Set:
# PermitRootLogin no
# PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 13.2 Keep System Updated
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 13.3 Fail2Ban (Optional)
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Troubleshooting

### Issue: PM2 processes not starting
```bash
# Check PM2 logs
pm2 logs --err

# Restart PM2
pm2 restart all

# Delete and recreate
pm2 delete all
pm2 start pm2/ecosystem.config.js --env production
```

### Issue: Nginx errors
```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: SSL certificate errors
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: High CPU usage
```bash
# Check processes
htop

# Reduce PM2 instances
pm2 scale persian-chat-api 1

# Optimize model inference (consider caching)
```

### Issue: API not responding
```bash
# Check backend logs
pm2 logs persian-chat-api

# Check if port is in use
sudo netstat -tulpn | grep 3001

# Restart backend
pm2 restart persian-chat-api
```

---

## Performance Optimization

### 1. Enable Caching
- Add Redis for response caching
- Configure Nginx caching for static assets

### 2. Load Balancing
```bash
# Increase PM2 instances
pm2 scale persian-chat-api 4
```

### 3. CDN Integration
- Use Cloudflare or similar CDN
- Serve static assets from CDN

### 4. Database Optimization (if applicable)
- Index frequently queried fields
- Use connection pooling

---

## Rollback Procedure

### If deployment fails:
```bash
# Stop PM2 processes
pm2 stop all

# Restore previous version
cd /var/www/persian-chat
git checkout <previous-commit>

# Restore backups if needed
tar -xzf /var/backups/persian-chat/model_XXXXXX.tar.gz

# Restart
pm2 restart all
```

---

## Next Steps

1. ✅ Monitor application for 24-48 hours
2. ✅ Set up external monitoring (UptimeRobot, Pingdom)
3. ✅ Configure alerting (email/SMS on downtime)
4. ✅ Document any environment-specific configurations
5. ✅ Train team on maintenance procedures

---

**Deployment Checklist:**
- [ ] VPS provisioned and configured
- [ ] All dependencies installed
- [ ] Application cloned and built
- [ ] Model trained and validated
- [ ] Nginx configured with SSL
- [ ] PM2 processes running
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Acceptance tests passed
- [ ] Documentation updated

---

**Support:**
- Documentation: `docs/`
- Traceability: `docs/traceability.md`
- Report: `report.md`
- Scripts: `scripts/`

**Deployment Date:** [TO BE FILLED]  
**Deployed By:** [TO BE FILLED]  
**Version:** 1.0
