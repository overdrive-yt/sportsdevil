/**
 * Script to test email configuration and order confirmation functionality
 */

const { EmailService } = require('../lib/email')

async function testEmailSetup() {
  console.log('🧪 Testing email setup...')
  
  try {
    // Test order confirmation email (will use mock mode if SMTP not configured)
    await EmailService.sendOrderConfirmation(
      'overdrive1612@gmail.com',
      {
        orderNumber: 'TEST-12345',
        customerName: 'Test Customer',
        items: [
          {
            name: 'STRIPE TEST ITEM - £1 Payment Test',
            quantity: 1,
            price: 1.00,
            total: 1.00,
            image: '/images/products/test-stripe-item.webp'
          }
        ],
        subtotal: 1.00,
        tax: 0.00,
        total: 1.00,
        shippingCost: 0.00,
        shippingAddress: {
          name: 'Test Customer',
          line1: '123 Test Street',
          line2: '',
          city: 'London',
          postal_code: 'SW1A 1AA',
          country: 'GB',
        },
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        trackingUrl: 'http://localhost:3001/orders/TEST-12345',
      }
    )
    
    console.log('✅ Email test completed successfully!')
    console.log('📧 If SMTP is configured, email was sent. If not, mock email was logged.')
    
  } catch (error) {
    console.error('❌ Email test failed:', error)
    throw error
  }
}

// Run the test
testEmailSetup()
  .then(() => {
    console.log('✅ Email setup test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Email setup test failed:', error)
    process.exit(1)
  })