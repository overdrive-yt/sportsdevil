# 🚨 IMMEDIATE ACTION REQUIRED - Google Cloud Run Fixes

Your Google Cloud Run deployment has critical issues causing 500 errors. Here's exactly what to do:

## 🔥 URGENT: Fix Database Connection (5 minutes)

**The main issue**: Your Cloud Run service has NO environment variables set, so the database connection fails.

### 1. Set DATABASE_URL (CRITICAL)
```bash
# Replace with your actual PostgreSQL URL
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="DATABASE_URL=postgresql://username:password@host:port/database"
```

### 2. Set Other Required Variables
```bash
# Use the generated secret from generate-secrets.sh
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXTAUTH_SECRET=eKaP/XiMiM8XAK8edYfoDO/0K2y6SJlTTHGdJHzXNYM=,NODE_ENV=production,NEXTAUTH_URL=https://sports-devil-1052972248673.europe-west2.run.app"
```

### 3. Fix Sentry (Choose One)
```bash
# Option A: Remove Sentry temporarily (RECOMMENDED for quick fix)
gcloud run services update sports-devil --region=europe-west2 \
  --remove-env-vars="NEXT_PUBLIC_SENTRY_DSN"

# Option B: Set proper Sentry DSN (if you have one)
gcloud run services update sports-devil --region=europe-west2 \
  --set-env-vars="NEXT_PUBLIC_SENTRY_DSN=your_actual_sentry_dsn"
```

## ✅ After Setting Environment Variables

Your service will automatically redeploy. Test it:

```bash
# Test the fixes
./test-deployment-readiness.sh

# Test API endpoints manually
curl https://sports-devil-1052972248673.europe-west2.run.app/api/products?limit=5
```

## 🚀 Deploy Updated Code (Optional - after env vars work)

```bash
# Deploy the version with fixes
./deploy-to-gcp.sh
```

## 📋 What Each Script Does

- `./fix-cloud-run-env.sh` - Shows current env vars and fix commands
- `./test-deployment-readiness.sh` - Tests your deployment 
- `./generate-secrets.sh` - Generates secure secrets
- `./deploy-to-gcp.sh` - Deploys updated code

## 🎯 Expected Results

After setting environment variables:
- ✅ API endpoints return 200 OK (not 500 errors)
- ✅ No JavaScript console errors
- ✅ Service worker works properly
- ✅ Website functions normally

## 💡 Quick Start

1. **Set DATABASE_URL first** (most critical)
2. **Set other environment variables**
3. **Remove Sentry DSN temporarily**  
4. **Test with `./test-deployment-readiness.sh`**
5. **Deploy fixed code when ready**

## 🆘 Need Your Database URL?

If you don't have your DATABASE_URL handy, check:
- Google Cloud SQL instances
- External database provider (like Supabase, PlanetScale, etc.)
- Your original deployment configuration

Format: `postgresql://username:password@host:port/database_name`

---

**NEXT STEP**: Run the environment variable commands above, then test with `./test-deployment-readiness.sh`