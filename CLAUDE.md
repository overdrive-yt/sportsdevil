# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sports Devil is a Next.js 15 e-commerce platform for cricket equipment and sports gear, using TypeScript, Prisma with PostgreSQL, Stripe for payments, and NextAuth for authentication. The application is deployed on Vercel.

## Essential Commands

### Development
```bash
# Start development server with Turbo (port 3001)
npm run dev

# Development server with optimizations and increased memory
npm run dev:optimized

# Clean Next.js cache and start fresh
npm run dev:clean

# Complete fresh start (clean all + reinstall)
npm run dev:fresh
```

### Build & Deploy
```bash
# Build for production (includes Prisma generation)
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Run tests
npm run test
npm run test:watch
npm run test:coverage
```

### Database Management
```bash
# Prisma commands
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma studio      # Open Prisma Studio

# Database scripts
npm run db:check       # Check database connection
npm run db:reset       # Comprehensive safe reset
npm run db:backup      # Create database backup
npm run db:essential   # Seed essential data only
npm run db:products    # Create sample products
npm run db:admin       # Create admin user
```

### Stripe & Webhooks
```bash
# Test Stripe webhook locally
npm run test:webhook

# Create test product in Stripe
npm run stripe:test-product
```

## Architecture & Structure

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth with credentials + social providers
- **Payments**: Stripe (checkout sessions, webhooks)
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand for client state, React Query for server state
- **Deployment**: Vercel (London region - lhr1)

### Directory Structure
- `/app` - Next.js 15 App Router pages and API routes
  - `/api` - API endpoints organized by feature
  - `/admin` - Admin dashboard pages
  - `/(auth)` - Authentication pages
- `/components` - React components
  - `/ui` - Shadcn/ui base components
  - `/admin` - Admin-specific components
- `/lib` - Core utilities and services
  - `/services` - Business logic services (cart, product, order, etc.)
  - `/integrations` - Third-party integrations
- `/prisma` - Database schema and migrations
- `/public/images/products` - Product images organized by category
- `/hooks` - Custom React hooks
- `/stores` - Zustand stores for client state
- `/contexts` - React contexts for global state

### Key Services & Patterns

1. **Authentication Flow**
   - NextAuth handles authentication with session caching
   - Support for credentials and social logins
   - Session data cached for 15 minutes for performance
   - Auth utilities in `/lib/auth.ts` and `/lib/client-auth.ts`

2. **Database Access**
   - All database access through Prisma client (`/lib/prisma.ts`)
   - Service layer pattern in `/lib/services/`
   - Connection pooling and query optimization enabled

3. **Cart System**
   - Server-side cart persistence for logged-in users
   - Client-side cart state with Zustand
   - Cart sync between client and server via `/components/cart-sync-provider.tsx`
   - API endpoints: `/api/cart/*`

4. **Product Management**
   - Multi-category support with parent-child relationships
   - Product attributes and variations system
   - Image optimization with Next.js Image component
   - Search with fuzzy matching and filters

5. **Payment Processing**
   - Stripe checkout sessions for payments
   - Webhook handling for order fulfillment
   - Test and production webhook endpoints
   - Payment security in `/lib/security/payment-security.ts`

6. **Admin Dashboard**
   - Role-based access control (RBAC)
   - Analytics and reporting
   - Product and order management
   - Integration management

### Performance Optimizations

1. **Build Optimizations**
   - Turbopack enabled for faster development
   - Package import optimizations for Radix UI and other libraries
   - Chunk splitting for optimal bundle sizes
   - Image optimization with WebP/AVIF formats

2. **Caching Strategy**
   - Session caching (15 minutes)
   - User data caching (10 minutes)
   - Analytics cache in `/lib/cache/analytics-cache.ts`
   - Static asset caching with immutable headers

3. **Development Settings**
   - HTTPS disabled for local development
   - Webpack filesystem cache enabled
   - Module resolution optimized
   - Telemetry disabled

### Environment Variables

Key environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SENTRY_*` - Sentry configuration (optional)

### Security Considerations

- CSRF protection enabled
- Payment security validation
- Role-based access control for admin
- Input validation and sanitization
- Secure session management
- Environment-specific security headers

### Testing Approach

- Jest for unit tests
- Security tests in `/tests/security.test.ts`
- Stripe webhook testing scripts
- Database connection testing
- Integration test utilities in `/lib/integration-testing.ts`

### Deployment Notes

**Current Deployment: Google Cloud Run**
- Service Name: `sports-devil`
- Region: `europe-west2` (London)
- Project: `sportsdevil`
- Domain: `sportsdevil.co.uk`
- Build: Dockerfile-based deployment
- Memory: 2Gi, CPU: 2 cores
- Auto-scaling: 0-10 instances

## Optimized Deployment Process

### Quick Deployment (Recommended)
```bash
# One-command deployment using the optimized script
./deploy-to-gcp.sh
```

### Manual Deployment Steps
```bash
# 1. Commit and push changes
git add .
git commit -m "Your changes"
git push origin main

# 2. Deploy to Google Cloud Run
gcloud run deploy sports-devil \
  --source . \
  --region europe-west2 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="[ENV_VARS_FROM_SCRIPT]"

# 3. Test deployment
curl -s https://sportsdevil.co.uk/api/health
```

### Post-Deployment Tasks
```bash
# Populate product images (if needed)
curl -X POST https://sportsdevil.co.uk/api/populate-images

# Test key functionality
curl -s https://sportsdevil.co.uk/api/products | head
```

### Deployment Best Practices
1. **Always test locally first**: `npm run build`
2. **Use the deployment script**: `./deploy-to-gcp.sh`
3. **Monitor deployment**: Check Cloud Run console for logs
4. **Verify functionality**: Test critical API endpoints
5. **Cache warming**: Service worker will auto-warm critical resources

### Environment Configuration
- All environment variables stored in `deploy-to-gcp.sh`
- Production secrets managed via Google Cloud Run environment variables
- Automatic versioning with git commit hash
- Health checks enabled for reliability

### Troubleshooting
- **Build failures**: Check local `npm run build` first
- **Authentication**: Ensure `gcloud auth login` is configured
- **Memory issues**: Current allocation is 2Gi (can be increased)
- **Cold starts**: Min instances set to 0 for cost optimization