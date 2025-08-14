# 🎯 Stripe Webhook Setup - COMPLETE CONFIGURATION

## ✅ What's Been Completed

### 1. Development Environment ✅
- **URL**: `http://localhost:3001/api/stripe/webhook`
- **Secret**: `whsec_6051d704e69977fd9211cd41259f4f118eed67f8bb1e747ebde46ab4ed5caecd`
- **Status**: **WORKING** (Stripe CLI forwarding)

### 2. Test Environment ✅
- **URL**: `https://sportsdevil.co.uk/api/stripe/webhook-test`
- **Secret**: `whsec_4Mn4QRCxs939ZGWuj2Qqv4ZMSFO8UZj0`
- **Endpoint ID**: `we_1RvPztIl9c9ZTqpAx2PhJ2KM`
- **Email Filter**: **ONLY** `overdrive1612@gmail.com`
- **Status**: **CONFIGURED & READY**

### 3. Production Environment ⚠️
- **URL**: `https://sportsdevil.co.uk/api/stripe/webhook-production`
- **Secret**: **YOU MUST CREATE THIS MANUALLY**
- **Email Filter**: **ALL emails EXCEPT** `overdrive1612@gmail.com` AND `admin@sportsdevil.co.uk`
- **Status**: **NEEDS MANUAL SETUP**

## 🔧 What You Need To Do

### CRITICAL: Create Production Webhook

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - **Switch to LIVE MODE** (toggle top-left)

2. **Create Production Webhook**
   - Go to: Developers → Webhooks
   - Click "Add endpoint"
   - **URL**: `https://sportsdevil.co.uk/api/stripe/webhook-production`
   - **Description**: "Production webhook - excludes test users"
   
3. **Select These Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`  
   - `checkout.session.completed`
   - `charge.dispute.created`
   - `invoice.payment_succeeded`

4. **Get the Secret**
   - After creating, click on the webhook
   - Copy the "Signing secret" (starts with `whsec_`)
   - **Update your production environment**:
   ```bash
   STRIPE_WEBHOOK_SECRET_LIVE="whsec_YOUR_NEW_PRODUCTION_SECRET"
   ```

## 📧 Email Routing Rules (IMPLEMENTED)

| User Email | Endpoint | Processing |
|------------|----------|------------|
| `overdrive1612@gmail.com` | `/webhook-test` | ✅ Test environment only |
| `admin@sportsdevil.co.uk` | None | ❌ Blocked from all webhooks |
| All other emails | `/webhook-production` | ✅ Production environment |

## 🚀 Current Status

✅ **WORKING NOW**:
- Development webhooks (localhost)
- Test webhooks for overdrive1612@gmail.com
- Email filtering system
- Separate endpoint routing

⚠️ **NEEDS YOUR ACTION**:
- Production webhook creation in Stripe Dashboard (live mode)
- Production webhook secret configuration

## 🧪 Testing Commands

### Test Development (Working)
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
stripe trigger payment_intent.succeeded
```

### Test Production Endpoint (After Setup)
```bash
# After you create the live webhook
stripe trigger payment_intent.succeeded --live
```

## 🔐 Environment Variables Summary

```bash
# Development (Stripe CLI)
STRIPE_WEBHOOK_SECRET="whsec_6051d704e69977fd9211cd41259f4f118eed67f8bb1e747ebde46ab4ed5caecd"

# Test Environment (overdrive1612@gmail.com only)
STRIPE_WEBHOOK_SECRET_TEST="whsec_4Mn4QRCxs939ZGWuj2Qqv4ZMSFO8UZj0"

# Production Environment (YOU MUST SET THIS)
STRIPE_WEBHOOK_SECRET_LIVE="whsec_YOUR_PRODUCTION_SECRET_HERE"
```

## 🎯 Next Steps

1. **Create production webhook** using the manual steps above
2. **Test the production webhook** works with live Stripe events
3. **Deploy your application** with both webhook endpoints
4. **Verify email filtering** works correctly

The system is now properly separated with email-based routing as requested!