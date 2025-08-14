#!/usr/bin/env node

/**
 * Test Order Confirmation Email with Real Database Data
 * Uses the most recent order from the database
 */

require('dotenv').config({ path: '.env.local' })

// Use dynamic imports to handle TypeScript files
async function loadModules() {
  // We'll implement email service directly since we can't easily import TS modules
  const nodemailer = require('nodemailer')
  const { PrismaClient } = require('@prisma/client')
  
  return { nodemailer, PrismaClient }
}

async function testRealOrderEmail() {
  console.log('🧪 Testing Order Confirmation Email with Real Data...')
  
  try {
    const { nodemailer, PrismaClient } = await loadModules()
    const prisma = new PrismaClient()
    
    // Get the most recent order from database
    console.log('📊 Fetching most recent order from database...')
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: {
              select: {
                name: true, price: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } }
              }
            }
          }
        }
      }
    })
    
    if (!order) {
      console.warn('⚠️ No orders found in database. Please create an order first.')
      console.log('💡 You can create a test order by completing a purchase on the website.')
      return
    }
    
    console.log(`✅ Found order: ${order.orderNumber}`)
    console.log(`   Customer: ${order.user.name || 'Unknown'}`)
    console.log(`   Email: ${order.user.email}`)
    console.log(`   Items: ${order.orderItems.length}`)
    console.log(`   Total: £${order.totalAmount}`)
    
    // Transform order data for email
    const emailData = {
      orderNumber: order.orderNumber,
      customerEmail: 'overdrive1612@gmail.com', // Override for testing
      customerName: order.user.name || order.shippingName || 'Valued Customer',
      items: order.orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        image: item.product.images[0]?.url || undefined
      })),
      totals: {
        subtotal: parseFloat(order.subtotalAmount.toString()),
        vat: parseFloat(order.taxAmount.toString()),
        shipping: parseFloat(order.shippingAmount.toString()),
        total: parseFloat(order.totalAmount.toString())
      },
      shippingAddress: {
        name: order.shippingName,
        address: order.shippingAddress,
        city: order.shippingCity,
        postalCode: order.shippingPostal,
        country: order.shippingCountry
      },
      estimatedDelivery: '2-3 business days'
    }
    
    // Create email transporter
    const createTransporter = () => {
      const isEmailConfigured = Boolean(
        process.env.SMTP_HOST && 
        process.env.SMTP_USER && 
        process.env.SMTP_PASS &&
        process.env.SMTP_PASS !== 'your-app-specific-password-here'
      )

      if (!isEmailConfigured) {
        console.log('📧 Mock Email Mode - SMTP not configured')
        return {
          sendMail: async (options) => {
            console.log('📧 Mock Email Sent:', {
              to: options.to,
              subject: options.subject,
              timestamp: new Date().toISOString(),
            })
            return { messageId: 'mock-message-id' }
          }
        }
      }

      const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }

      return nodemailer.createTransport(config)
    }
    
    // Generate email content (using the professional template from email.ts)
    const generateEmailContent = (orderData) => {
      const { orderNumber, customerName, items, totals, shippingAddress } = orderData
      
      const baseUrl = process.env.NEXTAUTH_URL_PRODUCTION && process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL_PRODUCTION 
        : process.env.NEXTAUTH_URL || 'http://localhost:3001'
      
      const trackingUrl = `${baseUrl}/dashboard`
      
      return {
        subject: `Order Confirmation - ${orderNumber} | Sports Devil`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background: #000; color: white; padding: 30px 20px; text-align: center; }
    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #333; }
    .order-summary { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin: 25px 0; }
    .order-header { font-size: 22px; font-weight: bold; margin-bottom: 20px; color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
    .item { border-bottom: 1px solid #f5f5f5; padding: 15px 0; display: flex; justify-content: space-between; align-items: center; }
    .item:last-child { border-bottom: none; }
    .item-details { flex-grow: 1; }
    .item-name { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 5px; }
    .item-qty { font-size: 14px; color: #666; }
    .item-price { font-weight: bold; font-size: 16px; color: #333; text-align: right; }
    .totals { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-row.final { border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; font-weight: bold; font-size: 18px; }
    .delivery-section { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin: 25px 0; }
    .delivery-header { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
    .address { background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #555; }
    .track-button { display: inline-block; background: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 25px 0; text-align: center; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
    .company-info { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; }
    .contact-info { font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.5; }
    .social-links { margin: 20px 0; }
    .social-links a { color: #666; text-decoration: none; margin: 0 15px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="${baseUrl}/images/logo-rect-white.jpg" alt="Sports Devil" class="logo" />
      <h1>Order Confirmation</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Dear ${customerName},</div>
      
      <p>Thank you for your order! We're excited to get your sports equipment ready for dispatch.</p>
      
      <div class="order-summary">
        <div class="order-header">Order Details - ${orderNumber}</div>
        
        ${items.map(item => `
          <div class="item">
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-qty">Quantity: ${item.quantity}</div>
            </div>
            <div class="item-price">£${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>£${totals.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>£${totals.shipping.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (20%):</span>
            <span>£${totals.vat.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>£${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div class="delivery-section">
        <div class="delivery-header">📦 Delivery Information</div>
        
        <p><strong>Shipping to:</strong></p>
        <div class="address">
          ${shippingAddress.name}<br>
          ${shippingAddress.address}<br>
          ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
          ${shippingAddress.country}
        </div>
        
        <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery || '2-3 business days'}</p>
        
        <p>We'll send you tracking information as soon as your order ships. You can also track your order anytime in your account dashboard.</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${trackingUrl}" class="track-button">Track Your Order</a>
      </div>
    </div>
    
    <div class="footer">
      <div class="company-info">Sports Devil</div>
      <div class="contact-info">
        309 Kingstanding Rd, Birmingham B44 9TH<br>
        📞 07897813165 | 📧 info@sportsdevil.co.uk
      </div>
      
      <div class="social-links">
        <strong>Follow us:</strong><br>
        <a href="https://www.facebook.com/sportsdevil.co.uk/" target="_blank">Facebook</a>
        <a href="https://www.instagram.com/sportsdevil1/" target="_blank">Instagram</a>
        <a href="https://www.tiktok.com/@sportsdevil3/video/7527043096287186198" target="_blank">TikTok</a>
      </div>
      
      <p style="font-size: 12px; color: #666; margin-top: 20px;">
        Thank you for choosing Sports Devil!
      </p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
Dear ${customerName},

Thank you for your order! Your sports equipment order has been confirmed.

Order Summary:
${items.map(item => `- ${item.name} (Qty: ${item.quantity}) - £${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: £${totals.subtotal.toFixed(2)}
Shipping: £${totals.shipping.toFixed(2)}
VAT (20%): £${totals.vat.toFixed(2)}
Total: £${totals.total.toFixed(2)}

Shipping Address:
${shippingAddress.name}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.postalCode}
${shippingAddress.country}

Track your order: ${trackingUrl}

Sports Devil
309 Kingstanding Rd, Birmingham B44 9TH
Phone: 07897813165
Email: info@sportsdevil.co.uk
        `
      }
    }
    
    console.log('📧 Sending order confirmation email with real data...')
    const emailTransporter = createTransporter()
    const emailContent = generateEmailContent(emailData)
    
    const result = await emailTransporter.sendMail({
      from: `"Sports Devil Orders" <orders@sportsdevil.co.uk>`,
      replyTo: 'orders@sportsdevil.co.uk',
      to: emailData.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })
    
    console.log('✅ Email sent successfully!')
    console.log('📧 Email details:', {
      to: emailData.customerEmail,
      subject: emailContent.subject,
      orderTotal: `£${emailData.totals.total.toFixed(2)}`,
      itemCount: emailData.items.length
    })
    
    console.log('\n📋 Order Summary:')
    emailData.items.forEach(item => {
      console.log(`   - ${item.name} (x${item.quantity}) - £${(item.price * item.quantity).toFixed(2)}`)
    })
    console.log(`   Total: £${emailData.totals.total.toFixed(2)}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('🔍 Error details:', error)
  }
}

testRealOrderEmail()