# Deployment Guide

## Deploy to Vercel (Recommended)

### Step 1: Initial Deployment

Run this in your terminal:

```bash
npx vercel
```

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Login** → Opens browser, sign in with your Vercel account
- **Link to existing project?** → `N`
- **Project name?** → Press Enter (default: `workout-tracker-app`)
- **Directory?** → Press Enter (default: `./`)
- **Override settings?** → `N`

Wait for deployment to complete. You'll get a preview URL.

### Step 2: Add Environment Variables

Your Supabase credentials:
- URL: `https://weliotdsgfjtbomakbjh.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbGlvdGRzZ2ZqdGJvbWFrYmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjczNDIsImV4cCI6MjA3OTkwMzM0Mn0.SQpW7c5XDAlwaDIUb2Darpz1SKoMJr-hS20i5lEKGfs`

**Option A: Via CLI**
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://weliotdsgfjtbomakbjh.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste the anon key above
```

**Option B: Via Dashboard** (Easier)
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://weliotdsgfjtbomakbjh.supabase.co`
   - Select: Production
4. Add:
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (paste the anon key above)
   - Select: Production

### Step 3: Deploy to Production

```bash
npx vercel --prod
```

You'll get your production URL! 🎉

---

## Alternative: Netlify (Even Easier)

### Build the app:
```bash
npm run build
```

### Deploy:
1. Go to https://app.netlify.com/drop
2. Drag the `out/` folder
3. Add environment variables in Site Settings
4. Done!

---

## After Deployment

Your app will be live at something like:
- `workout-tracker-app.vercel.app` (Vercel)
- `workout-tracker-app.netlify.app` (Netlify)

You can:
- Access it from any device
- Add it to your phone's home screen (PWA-ready)
- Share the link with others
- Your data syncs via Supabase across all devices
