# 🚀 Production Webhook Setup Instructions

## ⚠️ MANUAL SETUP REQUIRED

Since CLI can't create live webhooks, you must do this manually in Stripe Dashboard.

## 📋 Step-by-Step Instructions

### 1. **Login to Stripe Dashboard**
- Go to: https://dashboard.stripe.com
- **CRITICAL**: Switch to **LIVE MODE** (toggle in top-left corner)
- Make sure you see "Live" not "Test"

### 2. **Navigate to Webhooks**
- Click on **"Developers"** in left sidebar
- Click on **"Webhooks"**
- Click **"Add destination"** button

### 3. **Configure Production Webhook**
**Endpoint URL**: `https://sportsdevil.co.uk/api/stripe/webhook-production`

**Description**: `Production webhook - excludes test users`

**Select these events** (check each one):
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `checkout.session.completed`
- ✅ `charge.dispute.created`
- ✅ `invoice.payment_succeeded`

**API Version**: Leave as default (latest)

### 4. **Save and Get Secret**
- Click **"Add destination"**
- After creation, click on the webhook destination you just created
- In the webhook details, find **"Signing secret"**
- Click **"Reveal"** or **"Click to reveal"**
- Copy the secret (starts with `whsec_`)

### 5. **Update Environment Variables**

Add this to your production environment (NOT .env.local):

```bash
# Production Webhook Secret (LIVE MODE)
STRIPE_WEBHOOK_SECRET_LIVE="whsec_YOUR_COPIED_SECRET_HERE"

# Also switch to live Stripe keys
STRIPE_SECRET_KEY="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"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51K9eY9Il9c9ZTqpAgT1szOqOO7nWMpn1VF6twfcdMQbOu0fCCpdSQhaoy25cRXXXmmkRZE5auGsMnTfxhWKDjuZ800RZry0NXw"
```

## 📧 Email Filtering (Production)

**ALLOWED**: All emails
**BLOCKED**: 
- ❌ `overdrive1612@gmail.com` (test user)
- ❌ `admin@sportsdevil.co.uk` (admin user)

## 🧪 Testing Production Webhook

After setup, test with:

```bash
# Using live mode
stripe trigger payment_intent.succeeded --live
```

## 🔍 Troubleshooting

### If webhook fails:
1. Check URL is exactly: `https://sportsdevil.co.uk/api/stripe/webhook-production`
2. Verify you're in LIVE mode in Stripe Dashboard
3. Check webhook secret is correctly copied
4. Ensure your domain is accessible publicly

### Check webhook status:
```bash
stripe webhook_endpoints list --live
```

## ⚠️ IMPORTANT NOTES

- **Test users will be blocked** on production endpoint
- **Only create this webhook in LIVE mode**
- **Don't test with test users** - they should use test endpoint
- **Production webhook will only work with live Stripe keys**

## 📱 Quick Verification

After setup, you should see:
1. Webhook endpoint in Stripe Dashboard (Live mode)
2. Webhook secret starting with `whsec_`
3. Status: "Enabled"
4. URL: `https://sportsdevil.co.uk/api/stripe/webhook-production`

Ready for production deployment! 🚀