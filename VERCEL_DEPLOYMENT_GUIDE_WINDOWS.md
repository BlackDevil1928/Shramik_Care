# 🚀 Vercel Deployment Guide for Windows (PowerShell)

## ✅ Build Status: SUCCESS
Your Kerala Migrant Health System is now ready for Vercel deployment!

---

## 📋 Step 1: Verify Local Environment Variables

### Check if `.env.local` exists:
```powershell
Test-Path .env.local
```

### Create or update `.env.local`:
```powershell
# Create the file
New-Item -ItemType File -Path .env.local -Force

# Open in notepad
notepad .env.local
```

### Add these variables to `.env.local`:
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Security (REQUIRED)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
ENCRYPTION_KEY=your_encryption_key_32_chars_minimum

# Application (RECOMMENDED)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vapi.ai (OPTIONAL - for voice features)
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=your_vapi_phone
VAPI_ASSISTANT_ID_EN=assistant_id_en
VAPI_ASSISTANT_ID_HI=assistant_id_hi
VAPI_ASSISTANT_ID_ML=assistant_id_ml
```

### Verify environment variables are loaded:
```powershell
# Test build with local env vars
npm run build
```

---

## 📋 Step 2: Install Vercel CLI

### Install globally:
```powershell
npm install -g vercel
```

### Verify installation:
```powershell
vercel --version
```

### Login to Vercel:
```powershell
vercel login
```

---

## 📋 Step 3: Set Environment Variables on Vercel

### Option A: Using Vercel CLI (Recommended)

```powershell
# Navigate to project directory
cd "G:\void\PS(2)\Kerala-Migrant-Health-System"

# Add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# When prompted:
# - Select: Production, Preview, Development (select all)
# - Enter your Supabase URL

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# When prompted:
# - Select: Production, Preview, Development
# - Enter your Supabase anon key

# Add SUPABASE_SERVICE_ROLE_KEY (CRITICAL - Production & Preview only)
vercel env add SUPABASE_SERVICE_ROLE_KEY
# When prompted:
# - Select: Production, Preview (NOT Development for security)
# - Enter your Supabase service role key

# Add JWT_SECRET
vercel env add JWT_SECRET
# When prompted:
# - Select: Production, Preview, Development
# - Enter a secure random string (32+ characters)

# Add ENCRYPTION_KEY
vercel env add ENCRYPTION_KEY
# When prompted:
# - Select: Production, Preview, Development
# - Enter a secure random string (32+ characters)

# Add NEXT_PUBLIC_APP_URL (will be updated after deployment)
vercel env add NEXT_PUBLIC_APP_URL
# When prompted:
# - Select: Production
# - Enter: https://your-app-name.vercel.app (temporary, update later)
```

### Generate secure secrets (if needed):
```powershell
# Generate a random 32-character string for JWT_SECRET
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate another for ENCRYPTION_KEY
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add each variable manually

---

## 📋 Step 4: Deploy to Vercel

### Initial Deployment:
```powershell
# From project root
cd "G:\void\PS(2)\Kerala-Migrant-Health-System"

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No (first time) / Yes (subsequent)
# - Project name? kerala-migrant-health-system (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No
```

### Production Deployment:
```powershell
# Deploy to production
vercel --prod
```

### Verify deployment:
```powershell
# Check deployment status
vercel ls

# Open deployed site
vercel open
```

---

## 📋 Step 5: Update Environment Variables

### After first deployment, update NEXT_PUBLIC_APP_URL:
```powershell
# Get your Vercel URL (e.g., https://kerala-migrant-health-xxxx.vercel.app)
# Then update the env var:
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL
# Enter your actual Vercel URL
```

### View all environment variables:
```powershell
vercel env ls
```

### Pull environment variables to local:
```powershell
vercel env pull .env.vercel
```

---

## 📋 Step 6: Configure Supabase

### Add Vercel domain to Supabase allowed origins:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Authentication" → "URL Configuration"
4. Add to "Site URL": `https://your-app.vercel.app`
5. Add to "Redirect URLs":
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`
6. Save changes

---

## 📋 Step 7: Verify Deployment

### Check build logs:
```powershell
vercel logs
```

### Test API endpoints:
```powershell
# Test dashboard stats API
curl https://your-app.vercel.app/api/dashboard/stats

# Test anonymous reports API
curl https://your-app.vercel.app/api/reports/anonymous
```

### Open the deployed app:
```powershell
# Opens in default browser
start https://your-app.vercel.app
```

---

## 🔧 Troubleshooting

### Build fails on Vercel:
```powershell
# Check local build first
npm run build

# View detailed logs
vercel logs --follow

# Redeploy with verbose output
vercel --prod --debug
```

### Environment variables not working:
```powershell
# List all env vars
vercel env ls

# Remove and re-add specific var
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME
```

### Database connection issues:
```powershell
# Test Supabase connection locally
node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); console.log('Connected:', supabase ? 'Yes' : 'No');"
```

---

## ✅ Final Deployment Checklist

### Pre-Deployment:
- [ ] `.env.local` file created with all required variables
- [ ] Local build succeeds: `npm run build`
- [ ] All TypeScript errors fixed
- [ ] Supabase project created and configured
- [ ] Database tables created (if needed)

### Vercel Configuration:
- [ ] Vercel CLI installed
- [ ] Logged in to Vercel: `vercel login`
- [ ] All environment variables added to Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `JWT_SECRET` set (32+ characters)
- [ ] `ENCRYPTION_KEY` set (32+ characters)

### Deployment:
- [ ] Initial deployment completed: `vercel`
- [ ] Production deployment completed: `vercel --prod`
- [ ] Deployment URL obtained
- [ ] `NEXT_PUBLIC_APP_URL` updated with actual URL

### Post-Deployment:
- [ ] Supabase callback URLs configured
- [ ] Site URL updated in Supabase
- [ ] Homepage loads successfully
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

---

## 🎯 Quick Commands Reference

```powershell
# Build and test locally
npm run build
npm run start

# Deploy to Vercel preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Open deployed site
vercel open

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME production
```

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase Docs**: https://supabase.com/docs

---

## 🎉 Success!

Once deployed, your Kerala Migrant Health System will be available at:
- **Production**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api/*`

Monitor your deployment at: https://vercel.com/dashboard

---

**Last Updated**: 2025-10-04  
**Platform**: Windows PowerShell  
**Next.js**: 15.5.4  
**Region**: Mumbai (BOM1)
