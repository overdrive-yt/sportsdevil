# Stripe Webhook Setup Guide

## Current Status ✅

### 1. Development Environment (WORKING)
- **URL**: `http://localhost:3001/api/stripe/webhook`
- **Secret**: `whsec_6051d704e69977fd9211cd41259f4f118eed67f8bb1e747ebde46ab4ed5caecd`
- **Method**: Stripe CLI forwarding
- **Command**: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- **Status**: ✅ **ACTIVE & TESTED**

### 2. Test Environment (CONFIGURED)
- **URL**: `https://sportsdevil.co.uk/api/stripe/webhook-test`
- **Secret**: `whsec_4Mn4QRCxs939ZGWuj2Qqv4ZMSFO8UZj0`
- **Endpoint ID**: `we_1RvPztIl9c9ZTqpAx2PhJ2KM`
- **Mode**: Test mode (using test keys)
- **Email Filter**: ✅ **ONLY overdrive1612@gmail.com**
- **Status**: ✅ **CONFIGURED FOR DEPLOYMENT**

### 3. Production Environment (NEEDS SETUP)
- **URL**: `https://sportsdevil.co.uk/api/stripe/webhook-production`
- **Secret**: ⚠️ **MUST BE CREATED MANUALLY**
- **Mode**: Live mode (using live keys)
- **Email Filter**: ✅ **ALL emails EXCEPT overdrive1612@gmail.com AND admin@sportsdevil.co.uk**
- **Status**: ⚠️ **REQUIRES MANUAL SETUP**

## Setup Instructions

### For Development (Already Working)
```bash
# Start Stripe CLI listener
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Environment variable
STRIPE_WEBHOOK_SECRET="whsec_6051d704e69977fd9211cd41259f4f118eed67f8bb1e747ebde46ab4ed5caecd"
```

### For Test Deployment (overdrive1612@gmail.com only)
When deploying to test environment:
```bash
# Use test webhook secret for /api/stripe/webhook-test endpoint
STRIPE_WEBHOOK_SECRET_TEST="whsec_4Mn4QRCxs939ZGWuj2Qqv4ZMSFO8UZj0"
```

### For Production Deployment (MANUAL STEPS REQUIRED)

⚠️ **YOU MUST COMPLETE THESE STEPS MANUALLY** ⚠️

1. **Login to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com
   - Switch to **Live mode** (toggle in top left)

2. **Create Production Webhook**
   - Navigate to: Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://sportsdevil.co.uk/api/stripe/webhook-production`
   - Description: "Production webhook - excludes test and admin users"
   - Events to select:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
     - `charge.dispute.created`
     - `invoice.payment_succeeded`

3. **Get Webhook Secret**
   - After creating, click on the webhook
   - Copy the "Signing secret" (starts with `whsec_`)
   - Update environment variable:
   ```bash
   STRIPE_WEBHOOK_SECRET_LIVE="whsec_YOUR_PRODUCTION_SECRET_HERE"
   ```

4. **Switch to Live Keys**
   ```bash
   STRIPE_SECRET_KEY="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"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51K9eY9Il9c9ZTqpAgT1szOqOO7nWMpn1VF6twfcdMQbOu0fCCpdSQhaoy25cRXXXmmkRZE5auGsMnTfxhWKDjuZ800RZry0NXw"
   ```

## Testing

### Test Development Webhook
```bash
# Start CLI listener first
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

### Test Production Webhook (After Setup)
```bash
# Using live keys
stripe trigger payment_intent.succeeded --live
```

## Email Filtering Rules

### Test Endpoint (`/api/stripe/webhook-test`)
- ✅ **ALLOWED**: `overdrive1612@gmail.com`
- ❌ **BLOCKED**: All other emails

### Production Endpoint (`/api/stripe/webhook-production`)
- ✅ **ALLOWED**: All emails
- ❌ **BLOCKED**: `overdrive1612@gmail.com` (test user)
- ❌ **BLOCKED**: `admin@sportsdevil.co.uk` (admin user)

## Events Handled

| Event | Description | Action |
|-------|-------------|---------|
| `payment_intent.succeeded` | Payment completed | Send email receipt, update order |
| `payment_intent.payment_failed` | Payment failed | Mark order as failed |
| `checkout.session.completed` | Checkout completed | Confirm order |
| `charge.dispute.created` | Chargeback initiated | Log dispute |
| `invoice.payment_succeeded` | Recurring payment | Update subscription |

## Troubleshooting

### Common Issues
1. **400 Error**: Wrong webhook secret or signature verification failed
2. **404 Error**: Webhook URL not accessible
3. **500 Error**: Application error processing webhook

### Debug Commands
```bash
# Check webhook endpoints
stripe webhook_endpoints list

# View webhook events
stripe events list --limit 10

# Test webhook locally
STRIPE_WEBHOOK_SECRET="your_secret" node scripts/test-webhook.js
```

## Security Notes
- Webhook secrets are environment-specific
- Never commit live webhook secrets to version control
- Test webhooks use test secrets, production uses live secrets
- Always verify webhook signatures in production