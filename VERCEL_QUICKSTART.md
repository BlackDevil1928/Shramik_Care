# 🚀 Vercel Quick Start - Kerala Migrant Health System

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 5-Minute Setup

### 1. Fork/Clone Repository
```bash
git clone https://github.com/yourusername/Kerala-Migrant-Health-System.git
cd Kerala-Migrant-Health-System
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_32_chars_min
ENCRYPTION_KEY=your_encryption_key_32_chars_min
```

### 4. Test Build Locally
```bash
npm run build
npm run start
```

### 5. Deploy to Vercel

**Option A: Via GitHub**
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables
6. Deploy!

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
```

## ✅ Post-Deployment Checklist

- [ ] Build successful on Vercel
- [ ] Environment variables added
- [ ] Supabase connection working
- [ ] Test API endpoints
- [ ] Verify pages load correctly
- [ ] Check mobile responsiveness
- [ ] Test voice features (if configured)

## 🔧 Environment Variables for Vercel

Add these in: **Project Settings → Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key |
| `JWT_SECRET` | ✅ Yes | 32+ character secret for JWT |
| `ENCRYPTION_KEY` | ✅ Yes | 32+ character encryption key |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Recommended | Your Vercel domain |
| `VAPI_API_KEY` | ❌ Optional | For voice AI features |
| `VAPI_PHONE_NUMBER` | ❌ Optional | For voice calls |

## 🌍 Regional Configuration

The app uses Mumbai (`bom1`) region by default. To change:

Edit `vercel.json`:
```json
{
  "regions": ["bom1"]
}
```

Available regions:
- `bom1` - Mumbai (Best for Kerala)
- `sin1` - Singapore
- `hnd1` - Tokyo

## 🐛 Common Issues & Fixes

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
1. Ensure variables are added in Vercel dashboard
2. Prefix client-side vars with `NEXT_PUBLIC_`
3. Redeploy after adding new variables

### Database Connection Issues
1. Check Supabase URL and keys
2. Verify Supabase project is active
3. Ensure database tables exist

## 📊 Monitor Your Deployment

- **Dashboard**: https://vercel.com/dashboard
- **Logs**: Project → Logs
- **Analytics**: Project → Analytics
- **Deployments**: Project → Deployments

## 🔄 Update Your Deployment

**Automatic** (with GitHub):
```bash
git add .
git commit -m "Update"
git push
```

**Manual** (with CLI):
```bash
vercel --prod
```

## 📞 Support

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🌐 [Vercel Docs](https://vercel.com/docs)
- 💬 [Next.js Docs](https://nextjs.org/docs)

## ⚡ Performance Tips

1. **Enable Edge Functions** - Faster response times
2. **Use Image Optimization** - Built-in with Next.js
3. **Enable Analytics** - Monitor performance
4. **Set up Caching** - Reduce load times
5. **Use CDN** - Automatic with Vercel

## 🎯 Success Metrics

After deployment, verify:
- ✅ Homepage loads < 2s
- ✅ API responses < 500ms
- ✅ Mobile score > 90 (Lighthouse)
- ✅ No console errors
- ✅ All features working

## 🎉 You're Live!

Your Kerala Migrant Health System is now deployed!

**Next Steps:**
1. Share your URL with stakeholders
2. Set up custom domain (optional)
3. Configure Supabase webhooks
4. Enable monitoring & alerts
5. Document API endpoints

---

**Deployed on Vercel** ⚡️ | **Powered by Next.js** ⚛️ | **Healthcare for All** 🏥
