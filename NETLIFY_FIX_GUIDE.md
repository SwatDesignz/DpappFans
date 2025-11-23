# Netlify Deployment Fix Guide

## Problem
Your website shows a white page on Netlify because:
1. ❌ Missing `netlify.toml` configuration
2. ❌ Missing `_redirects` for SPA routing
3. ❌ Environment variables not configured on Netlify

## Solution - Follow These Steps

### ✅ Step 1: Configuration Files (DONE)
I've created:
- `netlify.toml` - Build configuration
- `public/_redirects` - SPA routing support

### ✅ Step 2: Push Changes to GitHub

```bash
git add netlify.toml public/_redirects
git commit -m "Add Netlify configuration files"
git push origin main
```

### ✅ Step 3: Configure Environment Variables on Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your SpotLight site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables (click "Add a variable" for each):

**Required Variables:**
- `VITE_SUPABASE_URL` = Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**Optional (if using Stripe):**
- `VITE_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key

**Note:** Get these values from your local `.env` file (don't share them here!)

### ✅ Step 4: Verify Build Settings

In Netlify dashboard → **Site settings** → **Build & deploy** → **Build settings**:

- **Base directory:** (leave empty or set to `.`)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### ✅ Step 5: Trigger Redeploy

After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (usually 1-2 minutes)

### ✅ Step 6: Check Browser Console

If still showing white page:
1. Open your Netlify site
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for any error messages (especially about missing environment variables)

## Common Issues & Fixes

### Issue: "Failed to load module"
**Fix:** Environment variables missing. Go back to Step 3.

### Issue: "404 on refresh"
**Fix:** The `_redirects` file should fix this. Make sure it's in the `public` folder.

### Issue: Build fails
**Fix:** Check the build logs in Netlify. Usually it's a missing dependency or Node version issue.

### Issue: Supabase connection errors
**Fix:** Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct.

## Need More Help?

If you're still seeing a white page after following these steps:
1. Share the browser console errors with me
2. Share the Netlify build log (from the Deploys tab)
3. Confirm you've added all environment variables

## Quick Checklist

- [ ] `netlify.toml` file created ✅
- [ ] `public/_redirects` file created ✅
- [ ] Changes pushed to GitHub
- [ ] Environment variables added to Netlify
- [ ] Build settings verified
- [ ] Site redeployed
- [ ] Browser console checked for errors
