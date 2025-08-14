import nodemailer from 'nodemailer'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Create email transporter
const createTransporter = () => {
  // Check if email is configured
  const isEmailConfigured = Boolean(
    process.env.SMTP_HOST && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your-app-specific-password-here' // Avoid placeholder
  )

  if (!isEmailConfigured) {
    // Return mock transporter for development
    return {
      sendMail: async (options: any) => {
        console.log('📧 Mock Email Sent:', {
          to: options.to,
          subject: options.subject,
          timestamp: new Date().toISOString(),
        })
        return { messageId: 'mock-message-id' }
      }
    }
  }

  const config: EmailConfig = {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  }

  return nodemailer.createTransport(config)
}

// Create the email transporter
const emailTransporter = createTransporter()

export class EmailService {
  static async sendOrderConfirmation(orderData: {
    orderNumber: string
    customerEmail: string
    customerName: string
    items: Array<{
      name: string
      quantity: number
      price: number
      image?: string
    }>
    totals: {
      subtotal: number
      vat: number
      shipping: number
      total: number
    }
    shippingAddress: {
      name: string
      address: string
      city: string
      postalCode: string
      country: string
    }
    estimatedDelivery?: string
  }) {
    const { orderNumber, customerEmail, customerName, items, totals, shippingAddress } = orderData

    const subject = `Order Confirmation - ${orderNumber} | Sports Devil`
    
    // Generate dynamic tracking URL
    const baseUrl = process.env.NEXTAUTH_URL_PRODUCTION && process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL_PRODUCTION 
      : process.env.NEXTAUTH_URL || 'http://localhost:3001'
    
    const trackingUrl = `${baseUrl}/dashboard`

    try {
      // Generate professional HTML email template
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${orderNumber}</title>
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
    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { 
      margin: 0; 
      font-size: 28px; 
      font-weight: bold; 
      color: #ffffff !important; 
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
      letter-spacing: 1px;
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
    .delivery-section { 
      background: #ffffff !important; 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      padding: 25px; 
      margin: 25px 0; 
    }
    .delivery-header { 
      font-size: 20px; 
      font-weight: bold; 
      margin-bottom: 15px; 
      color: #000000 !important; 
    }
    .address { 
      background: #f8f9fa !important; 
      padding: 15px; 
      border-radius: 6px; 
      font-size: 14px; 
      line-height: 1.5; 
      color: #333333 !important; 
    }
    .track-button { 
      display: inline-block; 
      background: #007bff !important; 
      color: #ffffff !important; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 6px; 
      font-weight: bold; 
      font-size: 16px; 
      margin: 25px 0; 
      text-align: center; 
      border: 2px solid #007bff !important;
    }
    .track-button:hover { 
      background: #0056b3 !important; 
      border: 2px solid #0056b3 !important;
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
    .enquiry-info { 
      background: #fff3cd !important; 
      border: 1px solid #ffeaa7; 
      padding: 15px; 
      border-radius: 6px; 
      margin: 20px 0; 
      color: #000000 !important; 
    }
    .enquiry-info a { 
      color: #000000 !important; 
      text-decoration: underline; 
    }
    .social-links { margin: 20px 0; }
    .social-links a { 
      color: #333333 !important; 
      text-decoration: none; 
      margin: 0 15px; 
      font-size: 14px; 
    }
    .social-links a:hover { color: #000000 !important; }
    @media (max-width: 600px) {
      .content { padding: 20px 15px; }
      .order-summary, .delivery-section { padding: 15px; }
      .item { flex-direction: column; align-items: flex-start; }
      .item-price { margin-top: 5px; }
    }
    
    /* Additional dark mode overrides for email clients */
    @media (prefers-color-scheme: dark) {
      body, .content, .order-summary, .delivery-section { 
        background-color: #ffffff !important; 
        color: #000000 !important; 
      }
      .greeting, .order-header, .delivery-header, .item-name, .item-price, .company-info { 
        color: #000000 !important; 
      }
      .item-qty, .contact-info { 
        color: #333333 !important; 
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="${baseUrl}/images/logo-rect-white.jpg" alt="Sports Devil" class="logo" />
      <h1>Order Confirmation</h1>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">Dear ${customerName},</div>
      
      <p>Thank you for your order! We're excited to get your sports equipment ready for dispatch.</p>
      
      <!-- Order Summary -->
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
      
      <!-- Delivery Information -->
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
      
      <!-- Track Order Button -->
      <div style="text-align: center;">
        <a href="${trackingUrl}" class="track-button">Track Your Order</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="company-info">Sports Devil</div>
      <div class="contact-info">
        309 Kingstanding Rd, Birmingham B44 9TH<br>
        📞 07897813165 | 📧 info@sportsdevil.co.uk
      </div>
      
      <div class="enquiry-info">
        <strong>📧 Order Changes or Enquiries:</strong><br>
        Please contact <a href="mailto:info@sportsdevil.co.uk" style="color: #000; text-decoration: none;">info@sportsdevil.co.uk</a>
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
      `

      // Generate plain text version
      const text = `
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

Estimated Delivery: ${orderData.estimatedDelivery || '2-3 business days'}

Track your order: ${trackingUrl}

📧 ORDER CHANGES OR ENQUIRIES: Please contact info@sportsdevil.co.uk

Sports Devil
309 Kingstanding Rd, Birmingham B44 9TH
Phone: 07897813165
Email: info@sportsdevil.co.uk
    `

      await emailTransporter.sendMail({
        from: `"Sports Devil Orders" <orders@sportsdevil.co.uk>`,
        replyTo: 'orders@sportsdevil.co.uk',
        to: customerEmail,
        subject,
        html,
        text,
      })

      console.log(`✅ Order confirmation email sent to ${customerEmail} for order ${orderNumber}`)
      return { success: true, messageId: 'sent' }
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  static async sendOrderShipped(orderData: {
    orderNumber: string
    customerEmail: string
    customerName: string
    trackingNumber: string
    carrier: string
    estimatedDelivery: string
    shippingAddress: {
      name: string
      address: string
      city: string
      postalCode: string
    }
  }) {
    const { orderNumber, customerEmail, customerName, trackingNumber, carrier, estimatedDelivery, shippingAddress } = orderData

    const subject = `Your Order ${orderNumber} Has Shipped! | Sports Devil`
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a8754; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .tracking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .shipping-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { background: #1a8754; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚚 Your Order is on its Way!</h1>
    <h2>Order ${orderNumber}</h2>
  </div>
  
  <div class="content">
    <p>Dear ${customerName},</p>
    
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div class="tracking-info">
      <h3>📦 Tracking Information</h3>
      
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p><strong>Carrier:</strong> ${carrier}</p>
      <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
      
      <center>
        <a href="https://track.royalmail.com/tracking/${trackingNumber}" class="button">Track Your Package</a>
      </center>
    </div>
    
    <div class="shipping-info">
      <h3>📍 Delivery Address</h3>
      <p>
        ${shippingAddress.name}<br>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.postalCode}
      </p>
    </div>
    
    <p>If you have any questions about your delivery, please don't hesitate to contact us.</p>
    
    <div class="footer">
      <p><strong>Sports Devil</strong><br>
      📞 07897813165 | 📧 info@sportsdevil.co.uk</p>
      
      <p><small>Thank you for choosing Sports Devil!</small></p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Dear ${customerName},

Your order ${orderNumber} has been shipped!

Tracking Information:
- Tracking Number: ${trackingNumber}
- Carrier: ${carrier}
- Estimated Delivery: ${estimatedDelivery}

Delivery Address:
${shippingAddress.name}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.postalCode}

Track your package: https://track.royalmail.com/tracking/${trackingNumber}

Sports Devil
📞 07897813165 | 📧 info@sportsdevil.co.uk
    `

    try {
      await emailTransporter.sendMail({
        from: `"Sports Devil Shipping" <orders@sportsdevil.co.uk>`,
        replyTo: 'info@sportsdevil.co.uk',
        to: customerEmail,
        subject,
        html,
        text,
      })

      console.log(`✅ Shipping notification sent to ${customerEmail} for order ${orderNumber}`)
      return { success: true, messageId: 'sent' }
    } catch (error) {
      console.error('❌ Failed to send shipping notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  static async sendPaymentFailed(orderData: {
    orderNumber: string
    customerEmail: string
    customerName: string
    paymentMethod: string
    failureReason?: string
  }) {
    const { orderNumber, customerEmail, customerName, paymentMethod, failureReason } = orderData

    const subject = `Payment Issue - Order ${orderNumber} | Sports Devil`
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Issue</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Payment Issue</h1>
    <h2>Order ${orderNumber}</h2>
  </div>
  
  <div class="content">
    <p>Dear ${customerName},</p>
    
    <p>We encountered an issue processing your payment for order ${orderNumber}.</p>
    
    <div class="alert">
      <h3>Payment Details</h3>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      ${failureReason ? `<p><strong>Issue:</strong> ${failureReason}</p>` : ''}
    </div>
    
    <p>Your order is currently on hold. To complete your purchase, please:</p>
    
    <ul>
      <li>Check your payment method details</li>
      <li>Ensure sufficient funds are available</li>
      <li>Try completing the payment again</li>
    </ul>
    
    <center>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Retry Payment</a>
    </center>
    
    <p>If you continue to experience issues, please contact us and we'll be happy to help resolve this.</p>
    
    <div class="footer">
      <p><strong>Sports Devil</strong><br>
      📞 07897813165 | 📧 info@sportsdevil.co.uk</p>
      
      <p><small>We're here to help with any payment questions!</small></p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Dear ${customerName},

We encountered an issue processing your payment for order ${orderNumber}.

Payment Method: ${paymentMethod}
${failureReason ? `Issue: ${failureReason}` : ''}

Your order is currently on hold. To complete your purchase, please:
- Check your payment method details
- Ensure sufficient funds are available
- Try completing the payment again

Retry payment: ${process.env.NEXTAUTH_URL}/dashboard

If you continue to experience issues, please contact us.

Sports Devil
📞 07897813165 | 📧 info@sportsdevil.co.uk
    `

    try {
      await emailTransporter.sendMail({
        from: `"Sports Devil Support" <orders@sportsdevil.co.uk>`,
        replyTo: 'info@sportsdevil.co.uk',
        to: customerEmail,
        subject,
        html,
        text,
      })

      console.log(`✅ Payment failure notification sent to ${customerEmail} for order ${orderNumber}`)
      return { success: true, messageId: 'sent' }
    } catch (error) {
      console.error('❌ Failed to send payment failure notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}