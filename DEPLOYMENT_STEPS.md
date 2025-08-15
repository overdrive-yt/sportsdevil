# Deployment Steps for Fixed Google Cloud Run

## 🚨 Critical Fix Required FIRST

**BEFORE DEPLOYING**: You must set the environment variables in Google Cloud Run. The current service has NO environment variables, which is why all APIs return 500 errors.

### Step 1: Set Environment Variables (CRITICAL)

```bash
# 1. Set DATABASE_URL (MOST CRITICAL - replace with your actual database URL)
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="DATABASE_URL=postgresql://username:password@host:port/database"

# 2. Set other required variables
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXTAUTH_URL=https://sports-devil-1052972248673.europe-west2.run.app,NODE_ENV=production,NEXTAUTH_SECRET=your_random_secret_here"

# 3. Fix Sentry (choose one option):
# Option A: Set proper Sentry DSN
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXT_PUBLIC_SENTRY_DSN=your_actual_sentry_dsn"

# Option B: Remove Sentry temporarily (recommended for quick fix)
gcloud run services update sports-devil --region=europe-west2 \
  --remove-env-vars="NEXT_PUBLIC_SENTRY_DSN"
```

### Step 2: Deploy Updated Code (After Environment Variables are Set)

```bash
# Deploy the fixed version
./deploy-to-gcp.sh
```

## 🔍 Verification Steps

After deployment, run these tests:

```bash
# Test the deployment
./test-deployment-readiness.sh

# Test specific endpoints manually
curl https://sports-devil-1052972248673.europe-west2.run.app/api/products?limit=5
curl https://sports-devil-1052972248673.europe-west2.run.app/api/analytics/best-sellers?limit=3
```

## 📋 What Was Fixed

### ✅ Code Fixes Applied:
1. **Service Worker Error Handling** - Graceful failure for API errors
2. **COEP Headers** - Changed to `credentialless` for external scripts
3. **Favicon** - Already exists, no 404 errors
4. **Environment Detection** - Better handling of missing variables

### 🔧 Scripts Created:
1. `fix-cloud-run-env.sh` - Shows exact environment variable commands
2. `test-deployment-readiness.sh` - Tests deployment and identifies issues
3. `CLOUD_RUN_FIXES.md` - Complete troubleshooting guide

## 🚨 Root Cause Analysis

The main issue is **missing environment variables** in Google Cloud Run:

- **Current State**: Empty environment variables table
- **Impact**: Database connection fails → API 500 errors → Service worker fails → Sentry errors
- **Solution**: Set `DATABASE_URL` and other required variables

## 🎯 Expected Results After Fix

- ✅ All API endpoints return 200 OK
- ✅ No JavaScript console errors  
- ✅ Service worker caches successfully
- ✅ External scripts load properly
- ✅ Full e-commerce functionality restored

## ⏱️ Deployment Timeline

1. **Set Environment Variables** (5 minutes) - Service auto-redeploys
2. **Deploy Fixed Code** (10 minutes) - New version with improvements
3. **Test & Verify** (5 minutes) - Confirm everything works

**Total Time**: ~20 minutes

## 🆘 If Issues Persist

1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read sports-devil --region=europe-west2 --limit=50
   ```

2. Verify database connectivity from another client

3. Run the test script again:
   ```bash
   ./test-deployment-readiness.sh
   ```

## 🔑 Important Notes

- **Database URL Format**: `postgresql://user:password@host:port/dbname`
- **NextAuth Secret**: Generate with `openssl rand -base64 32`
- **Auto-Redeploy**: Environment variable changes trigger automatic redeployment
- **SSL Requirements**: Add `?sslmode=require` to DATABASE_URL if needed

---

**Next Action**: Set the environment variables using the commands above, then proceed with deployment.