import nodemailer from 'nodemailer'
import { render } from 'jsx-email'
import { OrderConfirmationEmail } from './emails/order-confirmation'

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

export const emailTransporter = createTransporter()

// Email templates for Sports Devil Cricket Equipment
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_SHIPPED: 'order-shipped',
  ORDER_DELIVERED: 'order-delivered',
  ORDER_CANCELLED: 'order-cancelled',
  PAYMENT_FAILED: 'payment-failed',
  STOCK_ALERT: 'stock-alert',
  WELCOME: 'welcome',
} as const

// Email service functions
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
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .order-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; }
    .item:last-child { border-bottom: none; }
    .totals { background: #f0f0f0; padding: 15px; border-radius: 6px; margin-top: 20px; }
    .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .total-final { font-weight: bold; font-size: 1.1em; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
    .shipping-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
    .button { background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏏 Sports Devil</h1>
    <h2>Order Confirmation</h2>
  </div>
  
  <div class="content">
    <p>Dear ${customerName},</p>
    
    <p>Thank you for your order! We're excited to get your cricket equipment ready for dispatch.</p>
    
    <div class="order-summary">
      <h3>Order Details - ${orderNumber}</h3>
      
      ${items.map(item => `
        <div class="item">
          <div>
            <strong>${item.name}</strong><br>
            <small>Quantity: ${item.quantity}</small>
          </div>
          <div>£${(item.price * item.quantity).toFixed(2)}</div>
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
        <div class="total-row total-final">
          <span>Total:</span>
          <span>£${totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <div class="shipping-info">
      <h3>📦 Delivery Information</h3>
      <p><strong>Shipping to:</strong></p>
      <p>
        ${shippingAddress.name}<br>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}
      </p>
      
      ${orderData.estimatedDelivery ? `
        <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
      ` : `
        <p><strong>Estimated Delivery:</strong> 2-3 business days</p>
      `}
    </div>
    
    <p>We'll send you tracking information as soon as your order ships. You can also track your order anytime in your account dashboard.</p>
    
    <center>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Track Your Order</a>
    </center>
    
    <div class="footer">
      <p><strong>Sports Devil</strong><br>
      309 Kingstanding Rd, Birmingham B44 9TH<br>
      📞 07897813165 | 📧 info@sportsdevil.co.uk</p>
      
      <p><strong>📧 Order Changes or Enquiries:</strong><br>
      Please contact <a href="mailto:info@sportsdevil.co.uk" style="color: #000; text-decoration: none;">info@sportsdevil.co.uk</a></p>
      
      <p>Follow us: Facebook | Instagram | TikTok</p>
      
      <p><small>Thank you for choosing Sports Devil!</small></p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Order Confirmation - ${orderNumber}

Dear ${customerName},

Thank you for your order! Your cricket equipment order has been confirmed.

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

Track your order: ${process.env.NEXTAUTH_URL}/dashboard

📧 ORDER CHANGES OR ENQUIRIES: Please contact info@sportsdevil.co.uk

Sports Devil
309 Kingstanding Rd, Birmingham B44 9TH
Phone: 07897813165
Email: info@sportsdevil.co.uk
    `

    try {
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

    const subject = `Your Order Has Shipped! - ${orderNumber} | Sports Devil Cricket`
    
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
    .tracking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a8754; }
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
    
    <p>Great news! Your cricket equipment has been dispatched and is on its way to you.</p>
    
    <div class="tracking-info">
      <h3>📦 Tracking Information</h3>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p><strong>Carrier:</strong> ${carrier}</p>
      <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
    </div>
    
    <div class="shipping-info">
      <h3>📍 Delivery Address</h3>
      <p>
        ${shippingAddress.name}<br>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.postalCode}
      </p>
    </div>
    
    <p>You can track your package using the tracking number above or through your account dashboard.</p>
    
    <center>
      <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Track Your Package</a>
    </center>
    
    <div class="footer">
      <p><strong>Sports Devil Cricket</strong><br>
      📞 07897813165 | 📧 info@sportsdevil.co.uk</p>
      
      <p><small>Thank you for choosing Sports Devil Cricket!</small></p>
    </div>
  </div>
</body>
</html>
    `

    try {
      await emailTransporter.sendMail({
        from: `"Sports Devil Cricket" <${process.env.SMTP_USER || 'noreply@sportsdevil.co.uk'}>`,
        to: customerEmail,
        subject,
        html,
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
    failureReason: string
    retryUrl: string
  }) {
    const { orderNumber, customerEmail, customerName, failureReason, retryUrl } = orderData

    const subject = `Payment Issue - Order ${orderNumber} | Sports Devil Cricket`
    
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
    
    <p>We encountered an issue processing payment for your cricket equipment order.</p>
    
    <div class="alert">
      <strong>Issue:</strong> ${failureReason}
    </div>
    
    <p>Don't worry - your items are still reserved for you. You can retry your payment using the link below:</p>
    
    <center>
      <a href="${retryUrl}" class="button">Retry Payment</a>
    </center>
    
    <p>If you continue to experience issues, please contact us and we'll be happy to help resolve this.</p>
    
    <div class="footer">
      <p><strong>Sports Devil Cricket</strong><br>
      📞 07897813165 | 📧 info@sportsdevil.co.uk</p>
      
      <p><small>We're here to help with any payment questions!</small></p>
    </div>
  </div>
</body>
</html>
    `

    try {
      await emailTransporter.sendMail({
        from: `"Sports Devil Cricket" <${process.env.SMTP_USER || 'noreply@sportsdevil.co.uk'}>`,
        to: customerEmail,
        subject,
        html,
      })

      console.log(`✅ Payment failure notification sent to ${customerEmail} for order ${orderNumber}`)
      return { success: true, messageId: 'sent' }
    } catch (error) {
      console.error('❌ Failed to send payment failure notification:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}