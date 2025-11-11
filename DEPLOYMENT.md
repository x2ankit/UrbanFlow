# UrbanFlow - Deployment Guide

## 🚀 Best Deployment Option: Vercel (Recommended)

Vercel is the optimal choice for your React + Vite app because:

- ✅ Zero-config Vite support
- ✅ Automatic HTTPS
- ✅ Global CDN (300+ locations)
- ✅ Free tier: 100GB bandwidth, unlimited deployments
- ✅ Built-in analytics
- ✅ Perfect SPA routing handling
- ✅ Instant rollbacks

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Ready

You'll need these values (don't commit them):

```bash
VITE_SUPABASE_URL=https://pzihbdsyoycubpxsryxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6aWhiZHN5b3ljdWJweHNyeXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTkzMTAsImV4cCI6MjA3ODM3NTMxMH0.2c5p2n6EsSlg3Mb_yrKDfEne084M2Zq-KjI6NWXyxWM
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 2. Supabase Configuration

- ✅ Run SQL migrations (8 files in `supabase/migrations/`)
- ✅ Enable Google OAuth provider with Client ID & Secret
- ⚠️ Update Auth Site URL to your production domain

### 3. Google Cloud Configuration

- ✅ Add production domain to OAuth authorized origins
- ✅ Add production domain to Maps API key restrictions

---

## 🎯 Option 1: Deploy to Vercel (FASTEST - 3 minutes)

### Step 1: Push to GitHub

```powershell
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - UrbanFlow app ready for deployment"

# Create GitHub repo and push
git branch -M main
git remote add origin https://github.com/x2ankit/urban-flow-web.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com/new
2. **Import Git Repository** → Select `x2ankit/urban-flow-web`
3. **Configure Project:**

   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Add Environment Variables** (click "Add" for each):

   ```
   VITE_SUPABASE_URL = https://pzihbdsyoycubpxsryxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = <your-key>
   VITE_GOOGLE_MAPS_API_KEY = <your-key>
   ```

5. Click **Deploy** 🚀

### Step 3: Get Your URL

Vercel will give you: `https://urban-flow-web.vercel.app`

You can add a custom domain later:

- Project Settings → Domains → Add Domain
- Example: `urbanflow.com`

---

## 🎯 Option 2: Deploy to Netlify (3 minutes)

### Deploy Steps

1. Go to https://app.netlify.com/start
2. **Import from Git** → Select `x2ankit/urban-flow-web`
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment variables:**

   - Site settings → Build & deploy → Environment
   - Add same variables as Vercel

5. Deploy!

Your site: `https://urban-flow-web.netlify.app`

---

## 🎯 Option 3: Deploy to Cloudflare Pages (Fast & Free)

### Deploy Steps

1. Go to https://dash.cloudflare.com/ → Workers & Pages
2. **Create Application** → **Pages** → **Connect to Git**
3. Select repository: `urban-flow-web`
4. **Build settings:**

   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`

5. **Environment variables:**

   - Settings → Environment Variables
   - Add same variables

6. **Save and Deploy**

Your site: `https://urban-flow-web.pages.dev`

---

## 🔧 Post-Deployment Configuration (CRITICAL)

### 1. Update Supabase Auth Settings

Go to: https://pzihbdsyoycubpxsryxx.supabase.co

**Authentication → URL Configuration:**

```
Site URL: https://urban-flow-web.vercel.app
Additional redirect URLs:
  - http://localhost:8081
  - http://localhost:5173
  - https://urban-flow-web.vercel.app
```

**Save changes**

### 2. Update Google OAuth Settings

Go to: https://console.cloud.google.com/apis/credentials

**Your OAuth Client → Edit:**

**Authorized JavaScript origins:**

```
http://localhost:8081
http://localhost:5173
https://urban-flow-web.vercel.app
```

**Authorized redirect URIs:**

```
https://pzihbdsyoycubpxsryxx.supabase.co/auth/v1/callback
```

**Save**

### 3. Update Google Maps API Key

Go to: https://console.cloud.google.com/apis/credentials

**Your Maps API Key → Edit:**

**Application restrictions → HTTP referrers:**

```
http://localhost:8081/*
http://localhost:5173/*
https://urban-flow-web.vercel.app/*
```

**Save**

---

## 🧪 Testing Your Deployment

### 1. Test Authentication

- Visit: `https://urban-flow-web.vercel.app/auth`
- Try email signup/login ✓
- Try Google OAuth login ✓
- Should redirect to dashboard ✓

### 2. Test Google Maps

- Visit: `https://urban-flow-web.vercel.app/ride-booking`
- Map should load ✓
- Autocomplete should work ✓
- Current location should work ✓

### 3. Test Real-time (if enabled)

- Create test ride
- Check location updates work ✓

---

## 🎨 Custom Domain Setup (Optional)

### On Vercel:

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Vercel → Project Settings → Domains
3. Add `urbanflow.com`
4. Update DNS records as instructed
5. Vercel auto-provisions SSL

### Update after custom domain:

- Supabase Site URL → `https://urbanflow.com`
- Google OAuth origins → add `https://urbanflow.com`
- Google Maps referrers → add `https://urbanflow.com/*`

---

## 📊 Performance Optimizations

### Already Configured (in vercel.json):

- ✅ SPA routing (all routes → index.html)
- ✅ Asset caching (1 year for immutable assets)
- ✅ Compression enabled

### Future Optimizations:

1. **Code splitting** (already warned by Vite):

   ```typescript
   // Use dynamic imports for heavy components
   const Dashboard = lazy(() => import("./pages/Dashboard"));
   ```

2. **Image optimization**:

   - Convert `hero-illustration.jpg` to WebP
   - Use responsive images

3. **Bundle analysis**:
   ```powershell
   npm install -D rollup-plugin-visualizer
   ```

---

## 🔒 Security Checklist

### Before Going Live:

- [ ] SQL migrations run in Supabase ✓
- [ ] RLS policies enabled (check in Supabase)
- [ ] Environment variables set (no secrets in code)
- [ ] Google OAuth configured for production domain
- [ ] Maps API key restricted to your domains only
- [ ] HTTPS enforced (automatic on Vercel/Netlify/CF)
- [ ] Test unauthorized database access attempts

### Enable in Supabase:

1. **Row Level Security** - Go to each table → Enable RLS
2. **Email rate limiting** - Authentication → Rate Limiting
3. **Database backups** - Settings → Database → Backups

---

## 📈 Monitoring Setup

### Vercel Analytics (Free)

1. Project → Analytics tab
2. Enable Web Analytics
3. See real-time traffic, performance

### Supabase Logs

1. Dashboard → Logs
2. Enable log retention
3. Monitor API usage, errors

### Optional: Sentry (Error Tracking)

```powershell
npm install @sentry/react
```

Add to `main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

---

## 🚨 Troubleshooting Deployment Issues

### Build Fails

```powershell
# Clear cache and rebuild locally
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Routes Don't Work (404)

- Check `vercel.json` rewrites are correct
- For Netlify: verify `_redirects` file in `public/`

### Environment Variables Not Working

- Must start with `VITE_` prefix
- Redeploy after adding new variables
- Check in browser console: `import.meta.env.VITE_SUPABASE_URL`

### Google OAuth Fails

- Check redirect URI exactly matches Supabase callback
- Verify production domain in authorized origins
- Wait 2-3 minutes after updating Google settings

### Maps Don't Load

- Check API key in environment variables
- Verify domain in Maps API restrictions
- Check browser console for specific error

---

## 🎉 Quick Deploy Command (Vercel CLI)

### Install Vercel CLI:

```powershell
npm install -g vercel
```

### Deploy:

```powershell
vercel
```

Follow prompts, it will:

1. Auto-detect Vite
2. Ask for environment variables
3. Deploy in ~30 seconds
4. Give you production URL

### Deploy to production:

```powershell
vercel --prod
```

---

## 📝 Deployment Summary

**Recommended:** Vercel  
**Alternative 1:** Netlify  
**Alternative 2:** Cloudflare Pages

**Time to deploy:** 3-5 minutes  
**Cost:** $0 (free tier is generous)  
**Performance:** Global CDN, <100ms TTFB  
**SSL:** Automatic  
**Custom domain:** Supported (free)

**Your app will be live at:**  
`https://urban-flow-web.vercel.app` (or chosen domain)

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://pzihbdsyoycubpxsryxx.supabase.co
- **Google Cloud Console:** https://console.cloud.google.com
- **GitHub Repo:** https://github.com/x2ankit/urban-flow-web

---

**Ready to deploy?** Just run:

```powershell
git add .
git commit -m "Ready for production"
git push
```

Then visit Vercel and click **New Project**! 🚀
