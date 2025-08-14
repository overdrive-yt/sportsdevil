# Production Setup Guide - Security Hardened

This guide covers the complete production deployment setup for the W3 Sports Devil cricket equipment platform with security hardening implemented.

## 🚀 Quick Start Checklist

### Phase 1: Database Migration (CRITICAL)
- [ ] Set up PostgreSQL database
- [ ] Configure POSTGRES_URL environment variable
- [ ] Run database migration: `npm run db:migrate:postgres`
- [ ] Verify migration integrity

### Phase 2: Environment Configuration
- [ ] Update all environment variables for production
- [ ] Configure domain and SSL certificates
- [ ] Set up SMTP for email notifications
- [ ] Configure Stripe payment processing

### Phase 3: Security Validation
- [ ] Test all security headers (CSP, HSTS, etc.)
- [ ] Verify CSRF protection is working
- [ ] Test webhook security and idempotency
- [ ] Validate admin access controls

---

## 📊 Database Migration (SQLite → PostgreSQL)

### Current Database Status
```bash
# Test current database
npm run db:test-connections

# Expected output:
✅ SQLite connection: SUCCESS
   📊 Data: 0 users, 214 products, 43 categories
⚠️ PostgreSQL connection: NOT CONFIGURED
```

### 1. PostgreSQL Setup Options

#### Option A: Hosted Database (Recommended)
**Supabase (Free tier available)**
1. Visit https://supabase.com
2. Create new project
3. Copy PostgreSQL connection string
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Railway (Simple deployment)**
1. Visit https://railway.app
2. Deploy PostgreSQL service
3. Copy connection string from dashboard

**Render (Free tier)**
1. Visit https://render.com
2. Create PostgreSQL database
3. Use external connection string

#### Option B: Local PostgreSQL (Development)
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql
createdb sportsdevil_prod

# Connection string:
# postgresql://username@localhost:5432/sportsdevil_prod
```

### 2. Configure Environment Variables

Add to `.env.local` or production environment:
```bash
# PostgreSQL Production Database
POSTGRES_URL="postgresql://user:password@host:5432/database"

# Keep SQLite for local development (optional)
DATABASE_URL="file:./dev.db"
```

### 3. Run Migration

```bash
# Test database connections
npm run db:test-connections

# Create PostgreSQL schema
POSTGRES_URL="your-postgres-url" npx prisma db push

# Run full migration
npm run db:migrate:postgres
```

### 4. Migration Verification

The migration script will:
- ✅ Create backup of SQLite data
- ✅ Test both database connections
- ✅ Migrate users, categories, products
- ✅ Verify data integrity
- ✅ Provide detailed progress reporting

Expected output:
```bash
🎉 Migration completed successfully!
📝 Next steps:
  1. Update DATABASE_URL in production environment
  2. Run database migrations: npx prisma db push
  3. Test application with PostgreSQL
```

---

## 🔐 Security Configuration (Already Implemented)

### Security Headers ✅ COMPLETE
All security headers are configured in `next.config.mjs`:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- Cross-Origin Opener Policy (COOP)
- Cross-Origin Embedder Policy (COEP)
- X-Frame-Options
- X-Content-Type-Options

### CSRF Protection ✅ COMPLETE
- CSRF middleware implemented (`/lib/csrf.ts`)
- Origin validation for all POST requests
- CSRF token API endpoint available
- Integrated with NextAuth middleware

### Webhook Security ✅ COMPLETE
- Idempotency protection prevents duplicate processing
- Signature verification (Stripe compatible)
- Replay attack prevention
- Comprehensive audit logging

### API Security ✅ COMPLETE
- Enhanced middleware with security event logging
- Rate limiting with IP-based tracking
- Role-based access controls (RBAC)
- Admin access monitoring

---

## 🌐 Domain and SSL Setup

### Domain Configuration
```bash
# Production environment variables
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### SSL Certificate Options
1. **Automatic (Vercel/Netlify)**: SSL handled automatically
2. **Cloudflare**: DNS + SSL proxy
3. **Let's Encrypt**: Free SSL certificates
4. **Commercial SSL**: Purchase from certificate authority

---

## 📧 Email Configuration

### SMTP Setup (Gmail example)
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-business-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SPONSORSHIP_EMAIL="info@yourdomain.com"
```

### Gmail App Password Setup
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password (not regular password)

---

## 💳 Payment Processing (Stripe)

### Production Stripe Keys
```bash
# Replace test keys with live keys
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Webhook Configuration
1. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
2. Subscribe to events: `payment_intent.succeeded`, `checkout.session.completed`
3. Copy webhook secret to environment variables

---

## 🔍 Pre-Deployment Testing

### 1. Database Test
```bash
# Test PostgreSQL migration
npm run db:migrate:postgres

# Verify data integrity
npm run db:check
```

### 2. Build Test
```bash
# Test production build
npm run build
npm run start

# Verify on http://localhost:3000
```

### 3. Security Test
```bash
# Test security headers
curl -I https://yourdomain.com

# Expected headers:
# strict-transport-security
# x-frame-options: DENY
# x-content-type-options: nosniff
# content-security-policy
```

### 4. Functionality Test
- [ ] User registration/login works
- [ ] Product catalog loads correctly
- [ ] Shopping cart functions properly
- [ ] Checkout process completes
- [ ] Admin access works
- [ ] Email notifications send

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

### Option 2: Railway
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically from main branch

### Option 3: Render
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm run start`

---

## 🏥 Health Monitoring

### Built-in Security Monitoring
- Security event logging (`/app/api/admin/security-events`)
- Rate limiting with IP tracking
- Failed authentication monitoring
- Admin access audit trail

### Recommended External Monitoring
- **Uptime monitoring**: Pingdom, StatusCake
- **Error tracking**: Sentry (planned implementation)
- **Performance monitoring**: New Relic, DataDog
- **Security scanning**: Snyk (dependency scanning)

---

## 🔧 Troubleshooting

### Database Migration Issues
```bash
# Check database connections
npm run db:test-connections

# Verify PostgreSQL schema
POSTGRES_URL="your-url" npx prisma db pull
```

### Build Issues
```bash
# Clear cache and rebuild
npm run clean:all
npm install
npm run build
```

### Security Header Issues
```bash
# Test headers
curl -I -X GET "https://yourdomain.com"

# Check CSP violations in browser console
```

---

## 📞 Production Support

### Environment Files Needed
- `.env.production`: Production environment variables
- `DATABASE_URL`: PostgreSQL connection string
- All API keys updated for production

### Database Backup Strategy
```bash
# Create comprehensive backup before going live
npm run db:backup

# Regular backups (set up cron job)
pg_dump $POSTGRES_URL > backup-$(date +%Y%m%d).sql
```

---

**Security Status**: ✅ **PRODUCTION READY**  
**Database Migration**: 🔄 **READY TO CONFIGURE**  
**Deployment Ready**: 🚀 **PENDING DATABASE SETUP**