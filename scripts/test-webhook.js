#!/usr/bin/env node

/**
 * Stripe Webhook Test Script
 * Tests webhook endpoint and email receipt functionality
 */

const https = require('https');
const crypto = require('crypto');

const WEBHOOK_URL = 'http://localhost:3001/api/stripe/webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_51K9eY9Il9c9ZTqpAeNzCzGrEYO1FHk7kOpXxt0gPbIOlN0xnJG3UORg01hQAhqUurbVTz7dxpy82QMrGQvstUvdg00Noj0BCb9';

// Test payment_intent.succeeded event
const testEvent = {
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2020-08-27',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'pi_test_payment_intent',
      object: 'payment_intent',
      amount: 100,
      currency: 'gbp',
      status: 'succeeded',
      receipt_email: 'overdrive1612@gmail.com',
      metadata: {
        orderId: 'test_order_123'
      }
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test',
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

// Test webhook
async function testWebhook() {
  try {
    console.log('🧪 Testing Stripe webhook...');
    console.log('📧 Testing email receipt for: overdrive1612@gmail.com');
    
    const payload = JSON.stringify(testEvent);
    const signature = createStripeSignature(testEvent, WEBHOOK_SECRET);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/stripe/webhook',
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
          console.log('✅ Webhook test successful!');
          console.log('📧 Check server logs for email processing details');
        } else {
          console.log('❌ Webhook test failed');
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

console.log('🚀 Stripe Webhook Tester');
console.log('📍 Testing webhook endpoint:', WEBHOOK_URL);
console.log('🔐 Using webhook secret:', WEBHOOK_SECRET.substring(0, 20) + '...');
console.log('');

testWebhook();