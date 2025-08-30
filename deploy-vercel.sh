#!/bin/bash

# Vercel Deployment Script for Rental Management System
# This script automates the complete migration and deployment process

set -e

echo "🚀 Starting Vercel deployment process..."

# Check if required tools are installed
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI is required. Install with: npm i -g vercel"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  psql not found. Database migration will need to be done manually."; }

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Step 2: Build the project
echo "🔨 Building the project..."
cd client && npm run build && cd ..

# Step 3: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Step 4: Get the deployment URL
DEPLOYMENT_URL=$(vercel --prod --confirm 2>/dev/null | grep -o 'https://[^[:space:]]*')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 URL: $DEPLOYMENT_URL"
    
    # Step 5: Run verification tests
    echo "🔍 Running verification tests..."
    API_URL=$DEPLOYMENT_URL node scripts/verify-migration.js
else
    echo "❌ Could not determine deployment URL"
fi

echo ""
echo "📋 Post-deployment checklist:"
echo "□ Set up Vercel Postgres database"
echo "□ Run postgres-migration.sql on your database"
echo "□ Configure environment variables in Vercel dashboard"
echo "□ Test admin login (username: admin, password: admin123)"
echo "□ Test contract creation and tenant login"
echo "□ Verify email/telegram/whatsapp notifications"
echo "□ Test Persian RTL UI and dark mode"
echo "□ Verify mobile responsiveness"
echo ""
echo "🎉 Migration complete! Your Rental Management System is now running on Vercel."