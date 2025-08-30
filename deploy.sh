#!/bin/bash

# Cloudflare Rental Management System Deployment Script
# This script automates the complete deployment process

set -e

echo "🚀 Starting Cloudflare Rental Management System Deployment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    print_warning "Not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

print_success "Wrangler CLI found and authenticated"

# Step 1: Install dependencies
print_status "Installing Worker dependencies..."
npm install
print_success "Worker dependencies installed"

# Step 2: Create D1 database
print_status "Creating D1 database..."
DB_OUTPUT=$(wrangler d1 create rental-management-db 2>&1 || true)
if echo "$DB_OUTPUT" | grep -q "already exists"; then
    print_warning "D1 database already exists"
    DB_ID=$(wrangler d1 list | grep "rental-management-db" | awk '{print $2}')
else
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | cut -d'"' -f4)
    print_success "D1 database created with ID: $DB_ID"
fi

# Step 3: Create KV namespace
print_status "Creating KV namespace..."
KV_OUTPUT=$(wrangler kv:namespace create RENTAL_KV 2>&1 || true)
if echo "$KV_OUTPUT" | grep -q "already exists"; then
    print_warning "KV namespace already exists"
    KV_ID=$(wrangler kv:namespace list | grep "RENTAL_KV" | jq -r '.id')
else
    KV_ID=$(echo "$KV_OUTPUT" | grep "id" | cut -d'"' -f4)
    print_success "KV namespace created with ID: $KV_ID"
fi

# Step 4: Update wrangler.toml with actual IDs
print_status "Updating wrangler.toml configuration..."
sed -i.bak "s/YOUR_D1_DATABASE_ID/$DB_ID/g" wrangler.toml
sed -i.bak "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" wrangler.toml
rm wrangler.toml.bak
print_success "Configuration updated"

# Step 5: Run database migration
print_status "Running database migration..."
wrangler d1 execute rental-management-db --file=schema.sql
print_success "Database schema created"

# Step 6: Set up secrets (interactive)
print_status "Setting up secrets..."
echo "Please provide the following secrets (press Enter to skip):"

read -p "JWT Secret (recommended: generate a strong random string): " jwt_secret
if [ ! -z "$jwt_secret" ]; then
    echo "$jwt_secret" | wrangler secret put JWT_SECRET
    print_success "JWT_SECRET set"
fi

read -p "Email service API key (e.g., Resend API key): " email_key
if [ ! -z "$email_key" ]; then
    echo "$email_key" | wrangler secret put EMAIL_PASS
    print_success "EMAIL_PASS set"
fi

read -p "Email from address: " email_from
if [ ! -z "$email_from" ]; then
    echo "$email_from" | wrangler secret put EMAIL_USER
    print_success "EMAIL_USER set"
fi

read -p "Telegram Bot Token (optional): " telegram_token
if [ ! -z "$telegram_token" ]; then
    echo "$telegram_token" | wrangler secret put TELEGRAM_BOT_TOKEN
    print_success "TELEGRAM_BOT_TOKEN set"
fi

read -p "WhatsApp Account SID (optional): " whatsapp_sid
if [ ! -z "$whatsapp_sid" ]; then
    echo "$whatsapp_sid" | wrangler secret put WHATSAPP_ACCOUNT_SID
    print_success "WHATSAPP_ACCOUNT_SID set"
fi

read -p "WhatsApp Auth Token (optional): " whatsapp_token
if [ ! -z "$whatsapp_token" ]; then
    echo "$whatsapp_token" | wrangler secret put WHATSAPP_AUTH_TOKEN
    print_success "WHATSAPP_AUTH_TOKEN set"
fi

# Step 7: Deploy the Worker
print_status "Deploying Worker to Cloudflare..."
wrangler deploy
WORKER_URL=$(wrangler whoami | grep "Account ID" | awk '{print $3}')
print_success "Worker deployed successfully!"

# Step 8: Deploy frontend to Pages
print_status "Deploying frontend to Cloudflare Pages..."
cd client

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build the frontend
print_status "Building frontend..."
npm run build
print_success "Frontend built successfully"

# Update environment variables for production
WORKER_DOMAIN=$(wrangler whoami 2>/dev/null | grep "subdomain" | awk '{print $2}' || echo "your-subdomain")
sed -i.bak "s/your-subdomain/$WORKER_DOMAIN/g" .env.production
rm .env.production.bak 2>/dev/null || true

# Deploy to Pages
print_status "Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=rental-management-frontend --compatibility-date=2024-12-01
cd ..

print_success "Frontend deployed to Cloudflare Pages!"

# Step 9: Test deployment
print_status "Testing deployment..."
WORKER_URL="https://rental-management-api.$WORKER_DOMAIN.workers.dev"
if curl -s "$WORKER_URL/api/health" | grep -q "OK"; then
    print_success "Worker API is responding correctly"
else
    print_warning "Worker API test failed - please check manually"
fi

# Final success message
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
print_success "Worker API: $WORKER_URL"
print_success "Frontend: https://rental-management-frontend.pages.dev"
echo ""
print_status "Next steps:"
echo "1. Visit your frontend URL to test the application"
echo "2. Login with username 'admin' and password 'admin123'"
echo "3. Update notification settings in the admin panel"
echo "4. Create your first rental contract"
echo ""
print_warning "Security reminders:"
echo "- Change the default admin password"
echo "- Set up proper email service configuration"
echo "- Configure notification services as needed"
echo "- Review and update CORS settings for production"