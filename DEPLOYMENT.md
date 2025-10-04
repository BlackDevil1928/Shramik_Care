# Vercel Deployment Guide - Kerala Migrant Health System

This guide will help you deploy the Kerala Migrant Health System to Vercel.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/Kerala-Migrant-Health-System)

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account** - Create a project at [supabase.com](https://supabase.com)
3. **GitHub Repository** (recommended) - Push your code to GitHub for automatic deployments

## 🔧 Step-by-Step Deployment

### 1. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Copy your project URL and keys from Settings → API
3. Set up your database tables using the schema in `/database/schema.sql`

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_secure_random_string_32_chars_minimum
ENCRYPTION_KEY=your_encryption_key_32_chars_minimum
```

#### Optional Variables:
```bash
# Vapi.ai (Voice AI features)
VAPI_API_KEY=your_vapi_key
VAPI_PHONE_NUMBER=your_phone
VAPI_ASSISTANT_ID_EN=assistant_id
VAPI_ASSISTANT_ID_HI=assistant_id
VAPI_ASSISTANT_ID_ML=assistant_id

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure the following:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. Add environment variables in the "Environment Variables" section
7. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

5. For production deployment:
   ```bash
   vercel --prod
   ```

### 4. Post-Deployment Configuration

#### Set Custom Domain (Optional)
1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

#### Configure Supabase Callbacks
Update your Supabase authentication settings:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to "Site URL"
3. Add callback URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/api/auth/callback`

#### Set up Edge Functions (if using)
Configure edge functions for optimal performance in Indian regions:
```bash
vercel env add VERCEL_REGION bom1
```

## 🔒 Security Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase RLS (Row Level Security) policies are configured
- [ ] API routes have proper authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled for public endpoints
- [ ] JWT_SECRET and ENCRYPTION_KEY are strong random strings

## 🌍 Regional Configuration

The app is optimized for Indian users with:
- Primary region: `bom1` (Mumbai)
- This can be changed in `vercel.json`

Available regions:
- `bom1` - Mumbai, India (Recommended for Kerala)
- `sin1` - Singapore
- `hnd1` - Tokyo
- `iad1` - Washington DC

## 📊 Monitoring & Analytics

### Enable Vercel Analytics
1. Go to your project on Vercel
2. Navigate to "Analytics"
3. Enable "Web Analytics"

### Set up Logging
Vercel automatically captures:
- Build logs
- Function logs
- Runtime logs

Access them via: Project → Logs

## 🔄 Automatic Deployments

With GitHub integration:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests automatically create preview deployments

### Branch Deployments
- `main` → Production (your-app.vercel.app)
- `staging` → Staging (your-app-staging.vercel.app)
- Feature branches → Preview URLs

## 🐛 Troubleshooting

### Build Fails
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (18.x recommended)
4. Check TypeScript errors: `npm run build` locally

### Environment Variables Not Working
1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding new environment variables
3. Check for typos in variable names

### Database Connection Issues
1. Verify Supabase URL and keys are correct
2. Check Supabase project is active
3. Ensure database tables are created
4. Verify RLS policies allow access

### API Routes Timing Out
- Vercel Serverless Functions have a 10s timeout on Hobby plan
- Consider upgrading to Pro for 60s timeout
- Or optimize slow database queries

## 🔧 Advanced Configuration

### Custom Build Command
Edit `vercel.json`:
```json
{
  "buildCommand": "npm run build && npm run postbuild"
}
```

### Custom Headers
Already configured in `vercel.json` for CORS

### Redirects & Rewrites
Add to `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

## 📈 Performance Optimization

### Image Optimization
Next.js Image component is automatically optimized by Vercel

### Caching
Configure in `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## 🆘 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` locally successfully
- [ ] All environment variables documented
- [ ] Database migrations completed
- [ ] Supabase RLS policies tested
- [ ] API endpoints tested with authentication
- [ ] Error boundaries implemented
- [ ] Loading states implemented
- [ ] Mobile responsiveness tested
- [ ] Cross-browser testing completed
- [ ] Accessibility (a11y) tested
- [ ] SEO metadata configured
- [ ] Analytics set up
- [ ] Error monitoring configured
- [ ] Backup strategy in place

## 🎉 You're Ready!

Once deployed, your Kerala Migrant Health System will be live at:
- **Production**: `https://your-domain.vercel.app`
- **API**: `https://your-domain.vercel.app/api/*`

Monitor your deployment at the [Vercel Dashboard](https://vercel.com/dashboard).
