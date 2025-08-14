#!/usr/bin/env node

/**
 * Test Webhook Email Sending
 * Tests if the webhook sends emails for order confirmation
 */

const https = require('https');
const crypto = require('crypto');

const WEBHOOK_URL = 'http://localhost:3001/api/stripe/webhook-test';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET_DEV || 'whsec_6051d704e69977fd9211cd41259f4f118eed67f8bb1e747ebde46ab4ed5caecd';

// Create a realistic payment_intent.succeeded event
const testEvent = {
  id: 'evt_email_test_' + Date.now(),
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_3RvQURIl9c9ZTqpA0pV2GFEu', // Use the real payment intent ID from your order
      object: 'payment_intent',
      amount: 2800,
      currency: 'gbp',
      status: 'succeeded',
      receipt_email: 'overdrive1612@gmail.com',
      metadata: {
        // Note: this might be empty which is why our webhook fix was needed
      }
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_email_test',
    idempotency_key: null
  },
  type: 'payment_intent.succeeded'
};

// Create Stripe signature
function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

async function testEmailWebhook() {
  try {
    console.log('🧪 Testing Webhook Email Sending...');
    console.log('📧 Using payment intent ID from your order: pi_3RvQURIl9c9ZTqpA0pV2GFEu');
    console.log('📧 Email should be sent to: overdrive1612@gmail.com');
    
    const payload = JSON.stringify(testEvent);
    const signature = createStripeSignature(testEvent, WEBHOOK_SECRET);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/stripe/webhook-test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'stripe-signature': signature
      }
    };
    
    const req = require('http').request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📨 Response: ${data}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Webhook processed successfully!');
          console.log('📧 Check the console logs for email sending confirmation');
        } else {
          console.log('❌ Webhook processing failed');
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Error: ${e.message}`);
    });
    
    req.write(payload);
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailWebhook();