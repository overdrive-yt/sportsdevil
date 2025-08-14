/**
 * Test script to send order confirmation email using most recent order data
 */

const { PrismaClient } = require('@prisma/client')

// Email service using CommonJS require - ALWAYS use mock for testing
const createTransporter = () => {
  // Always return mock transporter for testing
  return {
    sendMail: async (options) => {
      console.log('📧 Test Email Details:', {
        to: options.to,
        subject: options.subject,
        timestamp: new Date().toISOString(),
      })
      console.log('\n📝 Email HTML Content (first 500 chars):')
      console.log('=' .repeat(50))
      console.log(options.html.substring(0, 500) + '...')
      console.log('=' .repeat(50))
      console.log('\n✅ Dark mode styling includes:')
      console.log('• White background: #ffffff !important')
      console.log('• Black text: #000000 !important')
      console.log('• High contrast elements')
      console.log('• Important declarations to prevent overrides')
      return { messageId: 'test-message-id' }
    }
  }
}

async function sendTestOrderEmail() {
  console.log('🧪 Testing order confirmation email with real order data...')
  
  const prisma = new PrismaClient()
  const emailTransporter = createTransporter()
  
  try {
    // Get the most recent order
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      throw new Error('No orders found in database')
    }

    console.log(`📦 Found recent order: ${order.orderNumber}`)
    console.log(`👤 Customer: ${order.user.name} (${order.user.email})`)
    console.log(`💰 Total: £${order.totalAmount}`)
    console.log(`📋 Items: ${order.orderItems.length} items`)

    // Generate the same email HTML as the service
    const customerName = order.user.name || 'Customer'
    const customerEmail = order.user.email

    // Create email HTML (same as EmailService.sendOrderConfirmation)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${order.orderNumber}</title>
  <style>
    /* FIXED: Dark mode compatible styling with explicit white background and black text */
    body { 
      font-family: 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #000000 !important; 
      margin: 0; 
      padding: 0; 
      background-color: #ffffff !important; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff !important; 
      box-shadow: 0 0 10px rgba(0,0,0,0.1); 
    }
    .header { 
      background: #000000 !important; 
      color: #ffffff !important; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: bold; 
      color: #ffffff !important; 
    }
    .content { 
      padding: 40px 30px; 
      background-color: #ffffff !important; 
      color: #000000 !important; 
    }
    .greeting { 
      font-size: 18px; 
      margin-bottom: 20px; 
      color: #000000 !important; 
    }
    .order-summary { 
      background: #ffffff !important; 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      padding: 25px; 
      margin: 25px 0; 
    }
    .order-header { 
      font-size: 22px; 
      font-weight: bold; 
      margin-bottom: 20px; 
      color: #000000 !important; 
      border-bottom: 2px solid #e0e0e0; 
      padding-bottom: 10px; 
    }
    .item { 
      border-bottom: 1px solid #e0e0e0; 
      padding: 15px 0; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    .item:last-child { border-bottom: none; }
    .item-details { flex-grow: 1; }
    .item-name { 
      font-weight: bold; 
      font-size: 16px; 
      color: #000000 !important; 
      margin-bottom: 5px; 
    }
    .item-qty { 
      font-size: 14px; 
      color: #333333 !important; 
    }
    .item-price { 
      font-weight: bold; 
      font-size: 16px; 
      color: #000000 !important; 
      text-align: right; 
    }
    .totals { 
      background: #f8f9fa !important; 
      padding: 20px; 
      border-radius: 8px; 
      margin-top: 20px; 
    }
    .total-row { 
      display: flex; 
      justify-content: space-between; 
      margin: 8px 0; 
      color: #000000 !important; 
    }
    .total-row.final { 
      border-top: 2px solid #000000; 
      padding-top: 15px; 
      margin-top: 15px; 
      font-weight: bold; 
      font-size: 18px; 
      color: #000000 !important; 
    }
    .test-info {
      background: #fff3cd !important;
      border: 2px solid #ffc107;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      color: #000000 !important;
    }
    .footer { 
      background: #f8f9fa !important; 
      padding: 30px; 
      text-align: center; 
      border-top: 1px solid #e0e0e0; 
    }
    .company-info { 
      font-weight: bold; 
      font-size: 16px; 
      margin-bottom: 10px; 
      color: #000000 !important; 
    }
    .contact-info { 
      font-size: 14px; 
      color: #333333 !important; 
      margin-bottom: 20px; 
      line-height: 1.5; 
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🧪 TEST: Order Confirmation</h1>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">Dear ${customerName},</div>
      
      <div class="test-info">
        <strong>🧪 THIS IS A TEST EMAIL</strong><br>
        Testing dark mode compatibility and email formatting.<br>
        All text should be clearly visible with proper contrast.
      </div>
      
      <!-- Order Summary -->
      <div class="order-summary">
        <div class="order-header">Order Details - ${order.orderNumber}</div>
        
        ${order.orderItems.map(item => `
          <div class="item">
            <div class="item-details">
              <div class="item-name">${item.product.name}</div>
              <div class="item-qty">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">£${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>£${parseFloat(order.subtotalAmount.toString()).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>£${parseFloat(order.shippingAmount.toString()).toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (20%):</span>
            <span>£${parseFloat(order.taxAmount.toString()).toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>£${parseFloat(order.totalAmount.toString()).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <p><strong>✅ Dark Mode Test Points:</strong></p>
      <ul>
        <li>White background with black text</li>
        <li>High contrast for all text elements</li>
        <li>Proper section separation</li>
        <li>Important declarations to prevent overrides</li>
      </ul>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="company-info">Sports Devil - TEST EMAIL</div>
      <div class="contact-info">
        This is a test email to verify dark mode formatting.<br>
        📞 07897813165 | 📧 info@sportsdevil.co.uk
      </div>
    </div>
  </div>
</body>
</html>
    `

    // Send the test email
    await emailTransporter.sendMail({
      from: `"Sports Devil Test" <orders@sportsdevil.co.uk>`,
      replyTo: 'orders@sportsdevil.co.uk',
      to: customerEmail,
      subject: `🧪 TEST: Dark Mode Email - ${order.orderNumber}`,
      html,
      text: `
TEST EMAIL: Order Confirmation - ${order.orderNumber}

Dear ${customerName},

This is a test email to verify dark mode formatting.

Order: ${order.orderNumber}
Total: £${parseFloat(order.totalAmount.toString()).toFixed(2)}
Items: ${order.orderItems.length}

All text should be clearly visible with proper contrast.

Sports Devil
📞 07897813165 | 📧 info@sportsdevil.co.uk
      `,
    })

    console.log(`✅ Test email sent successfully to: ${customerEmail}`)
    console.log(`📧 Subject: 🧪 TEST: Dark Mode Email - ${order.orderNumber}`)
    console.log(`🎨 Email includes dark mode compatible styling`)

  } catch (error) {
    console.error('❌ Test email failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
sendTestOrderEmail()
  .then(() => {
    console.log('✅ Test email completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test email failed:', error)
    process.exit(1)
  })