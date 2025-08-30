#!/bin/bash

echo "🚀 Starting Vercel deployment for Rental Management System..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Link project to Vercel
echo "🔗 Linking project to Vercel..."
vercel link

# Create Postgres database
echo "🗄️ Setting up Vercel Postgres database..."
vercel postgres create rental-management-db || echo "Database might already exist"

# Pull environment variables
echo "📋 Setting up environment variables..."
vercel env pull .env.local

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize database
echo "🔧 Initializing database schema..."
npm run db:init

# Build the project
echo "🏗️ Building project..."
npm run build

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

# Verify deployment
echo "✅ Verifying deployment..."
npm run verify

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables in Vercel dashboard"
echo "2. Configure notification services (email, Telegram, WhatsApp)"
echo "3. Test all functionality"
echo "4. Add custom domain if needed"
echo ""
echo "🔗 Your application is now live on Vercel!"