#!/usr/bin/env node

/**
 * Production Webhook Test Script
 * Tests the production webhook endpoint with proper signature
 */

const https = require('https');
const crypto = require('crypto');

const WEBHOOK_URL = 'http://localhost:3001/api/stripe/webhook-production';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET_LIVE || 'whsec_fVimApiKqlrZufKf6qCGdRLblrqDizJs';

// Test payment_intent.succeeded event for production users
const testEvents = [
  {
    name: 'Customer Email (Should be ALLOWED)',
    event: {
      id: 'evt_production_test_1',
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_production_test_1',
          object: 'payment_intent',
          amount: 100,
          currency: 'gbp',
          status: 'succeeded',
          receipt_email: 'customer@example.com',
          metadata: {
            orderId: 'test_production_order_1'
          }
        }
      },
      livemode: true,
      pending_webhooks: 1,
      request: {
        id: 'req_production_test',
        idempotency_key: null
      },
      type: 'payment_intent.succeeded'
    }
  },
  {
    name: 'Test User Email (Should be BLOCKED)',
    event: {
      id: 'evt_production_test_2',
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_production_test_2',
          object: 'payment_intent',
          amount: 100,
          currency: 'gbp',
          status: 'succeeded',
          receipt_email: 'overdrive1612@gmail.com',
          metadata: {
            orderId: 'test_production_order_2'
          }
        }
      },
      livemode: true,
      pending_webhooks: 1,
      request: {
        id: 'req_production_test_2',
        idempotency_key: null
      },
      type: 'payment_intent.succeeded'
    }
  },
  {
    name: 'Admin Email (Should be BLOCKED)',
    event: {
      id: 'evt_production_test_3',
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'pi_production_test_3',
          object: 'payment_intent',
          amount: 100,
          currency: 'gbp',
          status: 'succeeded',
          receipt_email: 'admin@sportsdevil.co.uk',
          metadata: {
            orderId: 'test_production_order_3'
          }
        }
      },
      livemode: true,
      pending_webhooks: 1,
      request: {
        id: 'req_production_test_3',
        idempotency_key: null
      },
      type: 'payment_intent.succeeded'
    }
  }
];

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
async function testWebhookEvent(testCase) {
  try {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📧 Email: ${testCase.event.data.object.receipt_email}`);
    
    const payload = JSON.stringify(testCase.event);
    const signature = createStripeSignature(testCase.event, WEBHOOK_SECRET);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/stripe/webhook-production',
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

async function runAllTests() {
  console.log('🚀 Production Webhook Tester');
  console.log('📍 Testing webhook endpoint:', WEBHOOK_URL);
  console.log('🔐 Using webhook secret:', WEBHOOK_SECRET.substring(0, 20) + '...');
  console.log('');

  for (const testCase of testEvents) {
    await testWebhookEvent(testCase);
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

runAllTests();