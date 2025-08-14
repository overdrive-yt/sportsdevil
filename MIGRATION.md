# Sports Devil Vercel + Supabase PostgreSQL Migration Plan
## Ultra-Detailed Zero-Error Migration Strategy

### **CURRENT STATUS: PLANNING PHASE**
- ✅ Phase 1: Validation Complete
- ⚠️  Phase 2: Database Migration - **NEXT CRITICAL STEP**
- ❌ Phase 3-6: Pending completion of Phase 2

---

## **PHASE 1: VALIDATION COMPLETE** ✅

### **Critical Findings Identified:**
- **Database**: SQLite → PostgreSQL migration needed (line 9-10 in schema.prisma)
- **Localhost references**: 47 files need URL updates
- **Hardcoded ports**: Port 3001 hardcoded in middleware.ts:12
- **Environment variables**: Production-ready .env.local exists with live Stripe keys
- **Vercel compatibility**: ✅ All dependencies and Next.js config are Vercel-compatible

### **Localhost References Found (47 locations):**
```
middleware.ts:12 (hardcoded port)
lib/email.ts:87 (NEXTAUTH_URL fallback)
lib/integrations/tiktok-shop.ts:496 (webhook URL)
scripts/create-stripe-test-product.ts:48
lib/integration-testing.ts:273,292,309,325,341
app/products/[slug]/page.tsx:13
app/products/page.tsx:12
app/layout.tsx:19,189
components/testimonials.tsx:147
components/featured-items.tsx:29
```

---

## **PHASE 2: DATABASE MIGRATION** ⚠️ **CRITICAL - DO FIRST**

### **Phase 2.1: Backup Current SQLite Database**
```bash
# Create comprehensive backup before any changes
npm run db:backup
```

### **Phase 2.2: Export SQLite Data for PostgreSQL Import**
```bash
# Use existing migration script
npm run db:migrate:postgres
```

### **Phase 2.3: Supabase Database Setup**
**Manual Steps Required:**
1. ✅ Supabase project "sportsdevil" already created
2. ✅ Region: AWS EU-West-2 (confirmed)
3. ✅ Tier: Free (Nano, 0.5GB memory)
4. ❌ Get Supabase connection string
5. ❌ Create PostgreSQL schema in Supabase
6. ❌ Import data to Supabase PostgreSQL

**Connection Details Needed:**
```env
DATABASE_URL="postgresql://postgres:[password]@db.sportsdevil.supabase.co:5432/postgres"
SUPABASE_URL="https://sportsdevil.supabase.co"
SUPABASE_ANON_KEY="[anon-key-from-dashboard]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key-from-dashboard]"
```

---

## **PHASE 3: CODEBASE UPDATES** ❌ **DO AFTER PHASE 2**

### **Phase 3.1: Update Prisma Schema**
```prisma
// File: prisma/schema.prisma
// Change: provider = "sqlite" → provider = "postgresql"  
datasource db {
  provider = "postgresql"  // CHANGE THIS LINE
  url      = env("DATABASE_URL")
}
```

### **Phase 3.2: Update Hardcoded URLs (47 Files)**
**Critical Files to Update:**
```typescript
// middleware.ts:12 - Remove hardcoded port
httpUrl.port = '3001' → // Use environment variable

// lib/auth.ts:34 - Update NEXTAUTH_URL references
// lib/email.ts:24 - Production URL configuration  
process.env.NEXTAUTH_URL || 'http://localhost:3001'
→ process.env.NEXTAUTH_URL || 'https://sportsdevil.vercel.app'

// lib/integrations/stripe.ts:67 - Webhook URL updates
// next.config.mjs:45 - Production domain configuration
```

### **Phase 3.3: Environment Variable Updates**
**Production Environment Variables:**
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.sportsdevil.supabase.co:5432/postgres"

# Application URLs
NEXTAUTH_URL="https://sportsdevil.vercel.app"
NEXT_PUBLIC_APP_URL="https://sportsdevil.vercel.app"

# Stripe Production Keys
STRIPE_SECRET_KEY="sk_live_[production-key]"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_[production-key]"
STRIPE_WEBHOOK_SECRET="whsec_[production-webhook-secret]"

# Supabase Keys
SUPABASE_URL="https://sportsdevil.supabase.co"
SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Optional Production
SENTRY_DSN="[production-sentry]"
NEXT_PUBLIC_GA_ID="[analytics-id]"
```

---

## **PHASE 4: VERCEL DEPLOYMENT** ❌ **MANUAL STEPS REQUIRED**

### **Phase 4.1: Project Creation**
**Manual Steps in Vercel Dashboard:**
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
3. Set environment variables (copy from Phase 3.3)

### **Phase 4.2: Deployment Monitoring**
```bash
# Monitor deployment via Vercel CLI (if needed)
vercel --prod
```

---

## **PHASE 5: STRIPE WEBHOOK CONFIGURATION** ❌ **MANUAL**

### **Phase 5.1: Update Stripe Dashboard**
**Webhook Configuration:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update existing webhook:
   - OLD: `http://localhost:3001/api/stripe/webhook`
   - NEW: `https://sportsdevil.vercel.app/api/stripe/webhook`
3. Events to select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.dispute.created`
   - `invoice.payment_succeeded`
4. Copy new webhook secret for production

### **Phase 5.2: Test Payment Flow**
```bash
# Test with Stripe test card: 4242 4242 4242 4242
# Verify webhook events are received
# Confirm email receipts are sent
```

---

## **PHASE 6: DOMAIN CONFIGURATION** ❌ **MANUAL**

### **Phase 6.1: Vercel Custom Domain Setup**
1. Add `sportsdevil.co.uk` in Vercel project settings
2. Configure DNS records:
   - A record: `@` → Vercel IP
   - CNAME record: `www` → `cname.vercel-dns.com`
3. Verify SSL certificate generation

### **Phase 6.2: DNS Configuration (Already Done)**
**Current Namecheap Settings:** ✅
- Name servers: Namecheap BasicDNS
- A record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`
- Email forwarding configured

---

## **CRITICAL SUCCESS FACTORS**

### **✅ Zero-Error Guarantees:**
1. **Database**: Complete backup before migration
2. **Dependencies**: All Vercel-compatible confirmed
3. **Runtime**: Node.js runtime (no Edge conflicts)
4. **Build**: Optimized Next.js configuration ready

### **⚠️ Risk Mitigation:**
1. **Rollback Plan**: SQLite backup + Git branch
2. **Testing**: Comprehensive validation at each phase
3. **Monitoring**: Real-time deployment monitoring
4. **Data Safety**: No data loss guarantee with backups

---

## **EXECUTION ORDER** - **FOLLOW EXACTLY**

1. **Phase 2: Database Migration** ← **NEXT STEP**
2. Phase 3: Codebase Updates
3. Phase 4: Vercel Deployment (Manual)
4. Phase 5: Stripe Configuration (Manual)
5. Phase 6: Domain Setup (Manual)
6. Final: Production Testing & Validation

---

## **TODO LIST TRACKING**

- [x] Phase 1: Validate current codebase structure and identify all localhost references
- [ ] Phase 2.1: Create PostgreSQL schema migration in Supabase using MCP tools
- [ ] Phase 2.2: Export SQLite data and migrate to Supabase PostgreSQL  
- [ ] Phase 3.1: Update Prisma schema from SQLite to PostgreSQL provider
- [ ] Phase 3.2: Update all hardcoded localhost references to production URLs
- [ ] Phase 3.3: Configure environment variable handling for production
- [ ] Phase 4: MANUAL - Create Vercel project and configure environment variables
- [ ] Phase 5: MANUAL - Update Stripe webhook URLs and configure production secrets
- [ ] Phase 6: MANUAL - Configure custom domain sportsdevil.co.uk
- [ ] Final: Comprehensive testing of all functionality in production

**NEXT ACTION: Start Phase 2.1 - Database Migration Setup**