# Google Cloud Run Deployment Fixes

## Issues Identified from Console Logs

Your Google Cloud Run deployment at `sports-devil-1052972248673.europe-west2.run.app` has several critical issues:

### 🚨 Critical Issues (Causing 500 Errors)

1. **Database Connection Failure**
   - API endpoints returning 500 errors: `/api/products`, `/api/analytics/best-sellers`, `/api/analytics/new-arrivals`
   - Root cause: Missing or incorrect `DATABASE_URL` environment variable
   - **Impact**: Core functionality broken, no products/analytics loading

2. **Sentry Configuration Error**
   - Invalid DSN: `[UPDATE_WITH_PRODUCTION_SENTRY_DSN]`
   - Causing JavaScript errors in the browser
   - **Impact**: Error tracking broken, client-side errors

### ⚠️ Medium Priority Issues

3. **Service Worker Cache Failures**
   - `Cache.addAll()` failing due to API 500 errors
   - **Impact**: Offline functionality compromised

4. **COEP/CORS Issues**
   - Elfsight platform.js blocked by Cross-Origin-Embedder-Policy
   - **Impact**: External widgets not loading

### ✅ Fixed Issues

5. **Missing Favicon** - ✅ FIXED
   - Added proper favicon handling
   
6. **Service Worker Error Handling** - ✅ FIXED
   - Improved error handling for failed requests

7. **COEP Headers** - ✅ FIXED
   - Changed from `require-corp` to `credentialless`

## 🔧 How to Fix

### Step 1: Fix Database Connection (CRITICAL)

Run this command to set your database URL:

```bash
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="DATABASE_URL=postgresql://username:password@host:port/database"
```

**Important**: Replace with your actual PostgreSQL connection string.

### Step 2: Fix Sentry Configuration

**Option A: Set proper Sentry DSN**
```bash
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXT_PUBLIC_SENTRY_DSN=your_actual_sentry_dsn_here"
```

**Option B: Disable Sentry temporarily**
```bash
gcloud run services update sports-devil --region=europe-west2 \
  --remove-env-vars="NEXT_PUBLIC_SENTRY_DSN"
```

### Step 3: Set Required Environment Variables

```bash
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXTAUTH_URL=https://sports-devil-1052972248673.europe-west2.run.app,NODE_ENV=production,NEXTAUTH_SECRET=your_secret_here"
```

### Step 4: Deploy Updated Code

After environment variables are set, deploy the fixed code:

```bash
# Build and deploy the fixes
npm run build
./deploy-to-gcp.sh
```

## 🧪 Testing Your Fixes

Use the provided scripts to test your deployment:

```bash
# Test the current deployment
./test-deployment-readiness.sh

# Get detailed environment variable commands
./fix-cloud-run-env.sh
```

## 📋 Environment Variables Checklist

Ensure these are set in Google Cloud Run:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_SECRET` - Random secret for NextAuth
- ✅ `NEXTAUTH_URL` - Your app URL
- ✅ `NODE_ENV=production`
- ✅ `NEXT_PUBLIC_SENTRY_DSN` - Your Sentry DSN (or remove if not using)

## 🔍 Verification Steps

After applying fixes:

1. **Check API endpoints**: Visit `/api/products` - should return JSON, not 500 error
2. **Check console logs**: No more Sentry DSN errors
3. **Check service worker**: Should cache without errors
4. **Check external scripts**: Elfsight should load without COEP errors

## 💡 Database Connection Troubleshooting

If database connection still fails:

1. **Network Access**: Ensure your PostgreSQL database allows connections from Google Cloud Run
2. **Firewall Rules**: Check if IP restrictions are blocking the connection
3. **Connection String**: Verify format: `postgresql://user:password@host:port/dbname`
4. **SSL Requirements**: Add `?sslmode=require` if your database requires SSL

## 🚀 Expected Results After Fixes

- ✅ All API endpoints return 200 OK
- ✅ No JavaScript errors in console
- ✅ Service worker caches successfully  
- ✅ External widgets load properly
- ✅ Full e-commerce functionality restored

## ⏱️ Timeline

- **Immediate**: Set environment variables (5 minutes)
- **Short-term**: Redeploy with fixes (10 minutes)  
- **Verification**: Test all endpoints (5 minutes)

**Total estimated fix time**: 20-30 minutes

## 📞 Need Help?

If issues persist after following these steps:

1. Run `./test-deployment-readiness.sh` for detailed diagnostics
2. Check Cloud Run logs: `gcloud run services logs read sports-devil --region=europe-west2`
3. Verify database connectivity from another client
4. Ensure billing is enabled for your Google Cloud project

---

**Next Action**: Run `./fix-cloud-run-env.sh` to get the exact commands for your setup.