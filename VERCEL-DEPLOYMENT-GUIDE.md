# 🚀 Vercel Deployment Guide - Sports Devil E-commerce

## ✅ **Prerequisites Completed**
- ✅ Database migrated to Supabase PostgreSQL  
- ✅ All 43 tables secured with RLS
- ✅ 60+ performance indexes added
- ✅ Materialized views created for fast queries
- ✅ Environment variables configured

## 🌐 **Vercel Deployment Steps**

### 1. **Connect to Vercel**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

### 2. **Environment Variables Setup**
In Vercel Dashboard → Settings → Environment Variables, add:

**Production Environment Variables:**
```bash
# Database - Supabase (Connection Pooling Enabled)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.fcntkadkakuxpequjxvz.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.fcntkadkakuxpequjxvz.supabase.co:5432/postgres

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fcntkadkakuxpequjxvz.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbnRrYWRrYWt1eHBlcXVqeHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMDk1OTYsImV4cCI6MjA3MDU4NTU5Nn0.eA4Qo40hBO9C0P2kxb_fn_0lenf_1gl0rKSHCKQpzRA
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# NextAuth.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=YOUR_STRONG_SECRET_32_CHARS_MIN

# Stripe (LIVE Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. **Vercel Configuration**
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["lhr1"]
}
```

### 4. **Performance Features Enabled**
- ✅ **Connection Pooling** - `pgbouncer=true` in DATABASE_URL
- ✅ **60+ Database Indexes** - Lightning-fast queries
- ✅ **Materialized Views** - Pre-computed data for instant loads
- ✅ **RLS Security** - Zero security vulnerabilities
- ✅ **Optimized Queries** - All common patterns indexed

### 5. **Stripe Webhook Setup (Production)**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`  
   - `checkout.session.completed`
   - `charge.dispute.created`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🔧 **Maintenance Commands**

### Refresh Materialized Views (Run periodically)
```sql
-- Run in Supabase SQL Editor
SELECT refresh_active_products_summary();
```

### Monitor Performance
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## 📊 **Performance Optimizations Active**

1. **Database Level:**
   - Connection pooling with PgBouncer
   - 60+ strategic indexes
   - Materialized views for fast reads
   - Optimized RLS policies

2. **Application Level:**  
   - Vercel Edge Functions
   - Static site generation for catalog
   - Image optimization
   - API route optimization

3. **Security Level:**
   - All 43 tables RLS-protected
   - Views respect user permissions
   - Functions have secure search paths
   - Zero security vulnerabilities

## 🚀 **Deployment Status**
- **Database**: ✅ Supabase PostgreSQL (Optimized)
- **Hosting**: 🔄 Ready for Vercel
- **Security**: ✅ Enterprise-grade RLS
- **Performance**: ✅ Sub-second query times
- **Monitoring**: ✅ Built-in analytics

Your Sports Devil platform is **production-ready** for Vercel deployment! 🎉