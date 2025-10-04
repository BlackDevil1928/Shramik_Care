#!/bin/bash

# Kerala Migrant Health System - Vercel Setup Script
# This script helps you deploy to Vercel quickly

echo "🏥 Kerala Migrant Health System - Vercel Deployment Setup"
echo "==========================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""
echo "🔑 Environment Variables Required:"
echo "-----------------------------------"
echo "1. NEXT_PUBLIC_SUPABASE_URL"
echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "3. SUPABASE_SERVICE_ROLE_KEY"
echo "4. JWT_SECRET"
echo "5. ENCRYPTION_KEY"
echo ""

read -p "Do you want to proceed with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting Vercel deployment..."
echo ""

# Login to Vercel
echo "📝 Logging in to Vercel..."
vercel login

echo ""
echo "🔧 Setting up project..."
echo ""

# Deploy to Vercel
vercel

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Next Steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add environment variables in Project Settings → Environment Variables"
echo "3. Redeploy if needed: vercel --prod"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
