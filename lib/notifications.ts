/**
 * Comprehensive notification system for Sports Devil Cricket Equipment
 * Handles email, SMS, and push notifications for orders, inventory, and marketing
 */

import { z } from 'zod'

export interface NotificationConfig {
  email?: {
    enabled: boolean
    provider: 'resend' | 'sendgrid' | 'nodemailer'
    apiKey?: string
    fromEmail: string
    fromName: string
  }
  sms?: {
    enabled: boolean 
    provider: 'twilio' | 'messagebird'
    apiKey?: string
    accountSid?: string
    fromNumber: string
  }
  push?: {
    enabled: boolean
    provider: 'firebase' | 'onesignal'
    apiKey?: string
  }
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface SMSTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

export interface NotificationEvent {
  type: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'low_stock' | 'season_reminder' | 'price_drop' | 'back_in_stock'
  recipient: {
    email?: string
    phone?: string
    name?: string
    userId?: string
  }
  data: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor?: Date
}

// Validation schemas
const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  from: z.string().email().optional(),
})

const smsSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  body: z.string().min(1).max(1600), // SMS length limit
  from: z.string().optional(),
})

/**
 * Email notification service for Sports Devil
 */
export class EmailService {
  private config: NotificationConfig['email']

  constructor(config: NotificationConfig['email']) {
    this.config = config
  }

  async sendEmail(params: {
    to: string
    subject: string
    html: string
    text?: string
    attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
  }) {
    if (!this.config?.enabled) {
      console.log('Email service disabled, skipping send')
      return { success: false, reason: 'Email service disabled' }
    }

    try {
      emailSchema.parse({
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      })

      switch (this.config.provider) {
        case 'resend':
          return await this.sendWithResend(params)
        case 'sendgrid':
          return await this.sendWithSendGrid(params)
        case 'nodemailer':
          return await this.sendWithNodemailer(params)
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  private async sendWithResend(params: any) {
    // Resend implementation
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config?.apiKey}`,
      },
      body: JSON.stringify({
        from: `${this.config?.fromName} <${this.config?.fromEmail}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments,
      }),
    })

    const result = await response.json()
    return { success: response.ok, data: result }
  }

  private async sendWithSendGrid(params: any) {
    // SendGrid implementation placeholder
    console.log('SendGrid email send:', params)
    return { success: true, provider: 'sendgrid' }
  }

  private async sendWithNodemailer(params: any) {
    // Nodemailer implementation placeholder
    console.log('Nodemailer email send:', params)
    return { success: true, provider: 'nodemailer' }
  }
}

/**
 * SMS notification service for Sports Devil
 */
export class SMSService {
  private config: NotificationConfig['sms']

  constructor(config: NotificationConfig['sms']) {
    this.config = config
  }

  async sendSMS(params: { to: string; body: string }) {
    if (!this.config?.enabled) {
      console.log('SMS service disabled, skipping send')
      return { success: false, reason: 'SMS service disabled' }
    }

    try {
      smsSchema.parse({
        to: params.to,
        body: params.body,
      })

      switch (this.config.provider) {
        case 'twilio':
          return await this.sendWithTwilio(params)
        case 'messagebird':
          return await this.sendWithMessageBird(params)
        default:
          throw new Error(`Unsupported SMS provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  private async sendWithTwilio(params: any) {
    // Twilio implementation
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config?.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config?.accountSid}:${this.config?.apiKey}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        From: this.config?.fromNumber || '',
        To: params.to || '',
        Body: params.body || '',
      }),
    })

    const result = await response.json()
    return { success: response.ok, data: result }
  }

  private async sendWithMessageBird(params: any) {
    // MessageBird implementation placeholder
    console.log('MessageBird SMS send:', params)
    return { success: true, provider: 'messagebird' }
  }
}

/**
 * Template manager for Sports Devil notifications
 */
export class TemplateManager {
  private emailTemplates: Map<string, EmailTemplate> = new Map()
  private smsTemplates: Map<string, SMSTemplate> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates() {
    // Email templates for Sports Devil
    this.emailTemplates.set('order_confirmation', {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      subject: 'Order Confirmed - Sports Devil Cricket Equipment',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <img src="https://sportsdevil.co.uk/images/sports-devil-logo.png" alt="Sports Devil" style="height: 60px; margin-bottom: 20px;">
              
              <h1 style="color: #2c5530;">Order Confirmation</h1>
              
              <p>Dear {{customerName}},</p>
              
              <p>Thank you for your order! We've received your order and are preparing your cricket equipment.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Total:</strong> £{{orderTotal}}</p>
              </div>
              
              <h3>Items Ordered:</h3>
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px;">
                {{orderItems}}
              </div>
              
              <h3>Delivery Information:</h3>
              <p>{{deliveryAddress}}</p>
              <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
              
              <p>You can track your order status by visiting our website or calling us at 07897813165.</p>
              
              <p>Thank you for choosing Sports Devil for your cricket equipment needs!</p>
              
              <p>Best regards,<br>Sports Devil Team<br>309 Kingstanding Rd, Birmingham B44 9TH</p>
            </div>
          </body>
        </html>
      `,
      textContent: `Order Confirmation - Sports Devil Cricket Equipment\n\nDear {{customerName}},\n\nThank you for your order! Order Number: {{orderNumber}}\nOrder Date: {{orderDate}}\nTotal: £{{orderTotal}}\n\nItems: {{orderItemsText}}\n\nDelivery: {{deliveryAddress}}\nEstimated Delivery: {{estimatedDelivery}}\n\nTrack your order at sportsdevil.co.uk or call 07897813165.\n\nBest regards,\nSports Devil Team`,
      variables: ['customerName', 'orderNumber', 'orderDate', 'orderTotal', 'orderItems', 'orderItemsText', 'deliveryAddress', 'estimatedDelivery']
    })

    this.emailTemplates.set('order_shipped', {
      id: 'order_shipped',
      name: 'Order Shipped',
      subject: 'Your Cricket Equipment is On The Way! - Sports Devil',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <img src="https://sportsdevil.co.uk/images/sports-devil-logo.png" alt="Sports Devil" style="height: 60px; margin-bottom: 20px;">
              
              <h1 style="color: #2c5530;">Your Order Has Shipped! 📦</h1>
              
              <p>Great news {{customerName}}! Your cricket equipment is on its way.</p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5530;">
                <h3 style="margin-top: 0; color: #2c5530;">Shipping Details</h3>
                <p><strong>Order Number:</strong> {{orderNumber}}</p>
                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
                <p><strong>Carrier:</strong> {{carrier}}</p>
                <p><strong>Expected Delivery:</strong> {{expectedDelivery}}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{trackingUrl}}" style="background: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Track Your Order</a>
              </div>
              
              <p>Your cricket equipment will be delivered to:</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                {{deliveryAddress}}
              </div>
              
              <p>Get ready to hit the pitch with your new gear from Sports Devil!</p>
              
              <p>Questions? Contact us at 07897813165 or visit our store at 309 Kingstanding Rd, Birmingham.</p>
              
              <p>Happy Cricket!<br>Sports Devil Team</p>
            </div>
          </body>
        </html>
      `,
      textContent: `Your Cricket Equipment is On The Way! - Sports Devil\n\nGreat news {{customerName}}! Your order {{orderNumber}} has shipped.\n\nTracking: {{trackingNumber}} ({{carrier}})\nExpected Delivery: {{expectedDelivery}}\n\nTrack at: {{trackingUrl}}\n\nDelivering to: {{deliveryAddress}}\n\nQuestions? Call 07897813165\n\nHappy Cricket!\nSports Devil Team`,
      variables: ['customerName', 'orderNumber', 'trackingNumber', 'carrier', 'expectedDelivery', 'trackingUrl', 'deliveryAddress']
    })

    this.emailTemplates.set('low_stock_alert', {
      id: 'low_stock_alert',
      name: 'Low Stock Alert',
      subject: 'Low Stock Alert - {{productName}} - Sports Devil',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #d9534f;">⚠️ Low Stock Alert</h1>
              
              <div style="background: #fcf8e3; border: 1px solid #faebcc; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #8a6d3b;">Product Running Low</h3>
                <p><strong>Product:</strong> {{productName}}</p>
                <p><strong>SKU:</strong> {{productSku}}</p>
                <p><strong>Current Stock:</strong> {{currentStock}} units</p>
                <p><strong>Reorder Level:</strong> {{reorderLevel}} units</p>
              </div>
              
              <p>This item is running low and may need restocking soon to avoid stockouts during peak cricket season.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{adminUrl}}" style="background: #5cb85c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Manage Inventory</a>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `Low Stock Alert - Sports Devil\n\nProduct: {{productName}}\nSKU: {{productSku}}\nCurrent Stock: {{currentStock}} units\nReorder Level: {{reorderLevel}} units\n\nThis item needs restocking soon.\n\nManage inventory at: {{adminUrl}}`,
      variables: ['productName', 'productSku', 'currentStock', 'reorderLevel', 'adminUrl']
    })

    this.emailTemplates.set('season_reminder', {
      id: 'season_reminder',
      name: 'Cricket Season Reminder',
      subject: 'Cricket Season is Starting! Get Ready with Sports Devil',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <img src="https://sportsdevil.co.uk/images/sports-devil-logo.png" alt="Sports Devil" style="height: 60px; margin-bottom: 20px;">
              
              <h1 style="color: #2c5530;">🏏 Cricket Season is Here!</h1>
              
              <p>Hello {{customerName}},</p>
              
              <p>The cricket season is starting and it's time to gear up! Make sure you're ready with the best equipment from Sports Devil.</p>
              
              <div style="background: linear-gradient(135deg, #2c5530, #4a7c59); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
                <h2 style="margin: 0 0 15px 0;">Season Special Offers</h2>
                <p style="font-size: 18px; margin: 0;">Up to 20% off cricket bats and protective gear</p>
              </div>
              
              <h3>Essential Items for This Season:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 6px;">🏏 Professional Cricket Bats</li>
                <li style="padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 6px;">🛡️ Protective Gear (Pads, Gloves, Helmets)</li>
                <li style="padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 6px;">👕 Cricket Clothing & Accessories</li>
                <li style="padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 6px;">⚾ Practice Balls & Training Equipment</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://sportsdevil.co.uk/products" style="background: #2c5530; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">Shop Now</a>
              </div>
              
              <p>Visit our Birmingham store at 309 Kingstanding Rd or call 07897813165 for expert advice on choosing the right equipment.</p>
              
              <p>Have a fantastic cricket season!</p>
              
              <p>Best regards,<br>Sports Devil Team</p>
            </div>
          </body>
        </html>
      `,
      textContent: `Cricket Season is Here! - Sports Devil\n\nHello {{customerName}},\n\nThe cricket season is starting! Get ready with Sports Devil equipment.\n\nSeason Special: Up to 20% off cricket bats and protective gear\n\nEssential items:\n- Professional Cricket Bats\n- Protective Gear\n- Cricket Clothing\n- Practice Equipment\n\nShop at: sportsdevil.co.uk/products\n\nVisit our Birmingham store at 309 Kingstanding Rd or call 07897813165.\n\nHave a fantastic season!\nSports Devil Team`,
      variables: ['customerName']
    })

    // SMS templates for Sports Devil
    this.smsTemplates.set('order_confirmation', {
      id: 'order_confirmation',
      name: 'Order Confirmation SMS',
      content: 'Sports Devil: Order {{orderNumber}} confirmed! £{{total}} for {{itemCount}} items. Delivery: {{deliveryDate}}. Track: sportsdevil.co.uk Call: 07897813165',
      variables: ['orderNumber', 'total', 'itemCount', 'deliveryDate']
    })

    this.smsTemplates.set('order_shipped', {
      id: 'order_shipped',
      name: 'Order Shipped SMS',
      content: 'Sports Devil: Your cricket equipment has shipped! Order {{orderNumber}} - Tracking: {{trackingNumber}}. Expected delivery: {{deliveryDate}}. Track: {{trackingUrl}}',
      variables: ['orderNumber', 'trackingNumber', 'deliveryDate', 'trackingUrl']
    })

    this.smsTemplates.set('back_in_stock', {
      id: 'back_in_stock',
      name: 'Back in Stock SMS',
      content: 'Sports Devil: Good news! {{productName}} is back in stock. £{{price}} - Limited quantity available. Shop now: sportsdevil.co.uk/products/{{productSlug}}',
      variables: ['productName', 'price', 'productSlug']
    })
  }

  getEmailTemplate(id: string): EmailTemplate | undefined {
    return this.emailTemplates.get(id)
  }

  getSMSTemplate(id: string): SMSTemplate | undefined {
    return this.smsTemplates.get(id)
  }

  renderEmailTemplate(templateId: string, variables: Record<string, string>): { subject: string; html: string; text: string } | null {
    const template = this.getEmailTemplate(templateId)
    if (!template) return null

    let subject = template.subject
    let html = template.htmlContent
    let text = template.textContent

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
      html = html.replace(new RegExp(placeholder, 'g'), value)
      text = text.replace(new RegExp(placeholder, 'g'), value)
    })

    return { subject, html, text }
  }

  renderSMSTemplate(templateId: string, variables: Record<string, string>): string | null {
    const template = this.getSMSTemplate(templateId)
    if (!template) return null

    let content = template.content

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      content = content.replace(new RegExp(placeholder, 'g'), value)
    })

    return content
  }
}

/**
 * Main notification service for Sports Devil
 */
export class NotificationService {
  private emailService: EmailService
  private smsService: SMSService
  private templateManager: TemplateManager
  private config: NotificationConfig

  constructor(config: NotificationConfig) {
    this.config = config
    this.emailService = new EmailService(config.email)
    this.smsService = new SMSService(config.sms)
    this.templateManager = new TemplateManager()
  }

  async sendNotification(event: NotificationEvent): Promise<{ success: boolean; results: any[] }> {
    const results = []

    try {
      // Send email notification
      if (event.recipient.email && this.config.email?.enabled) {
        const emailResult = await this.sendEmailNotification(event)
        results.push({ type: 'email', ...emailResult })
      }

      // Send SMS notification
      if (event.recipient.phone && this.config.sms?.enabled) {
        const smsResult = await this.sendSMSNotification(event)
        results.push({ type: 'sms', ...smsResult })
      }

      const allSuccess = results.every(r => r.success)
      return { success: allSuccess, results }

    } catch (error) {
      console.error('Failed to send notification:', error)
      return { success: false, results: [{ error: error instanceof Error ? error.message : String(error) }] }
    }
  }

  private async sendEmailNotification(event: NotificationEvent) {
    const rendered = this.templateManager.renderEmailTemplate(event.type, {
      customerName: event.recipient.name || 'Customer',
      ...event.data
    })

    if (!rendered) {
      return { success: false, error: `No email template found for ${event.type}` }
    }

    return await this.emailService.sendEmail({
      to: event.recipient.email!,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    })
  }

  private async sendSMSNotification(event: NotificationEvent) {
    const content = this.templateManager.renderSMSTemplate(event.type, event.data)
    
    if (!content) {
      return { success: false, error: `No SMS template found for ${event.type}` }
    }

    return await this.smsService.sendSMS({
      to: event.recipient.phone!,
      body: content,
    })
  }

  // Cricket equipment specific notification methods
  async sendOrderConfirmation(orderData: {
    customerEmail: string
    customerPhone?: string
    customerName: string
    orderNumber: string
    orderDate: string
    orderTotal: string
    orderItems: string
    orderItemsText: string
    deliveryAddress: string
    estimatedDelivery: string
  }) {
    return await this.sendNotification({
      type: 'order_confirmation',
      recipient: {
        email: orderData.customerEmail,
        phone: orderData.customerPhone,
        name: orderData.customerName,
      },
      data: orderData,
      priority: 'high',
    })
  }

  async sendShippingNotification(shippingData: {
    customerEmail: string
    customerPhone?: string
    customerName: string
    orderNumber: string
    trackingNumber: string
    carrier: string
    expectedDelivery: string
    trackingUrl: string
    deliveryAddress: string
  }) {
    return await this.sendNotification({
      type: 'order_shipped',
      recipient: {
        email: shippingData.customerEmail,
        phone: shippingData.customerPhone,
        name: shippingData.customerName,
      },
      data: shippingData,
      priority: 'high',
    })
  }

  async sendLowStockAlert(stockData: {
    adminEmail: string
    productName: string
    productSku: string
    currentStock: string
    reorderLevel: string
    adminUrl: string
  }) {
    return await this.sendNotification({
      type: 'low_stock',
      recipient: {
        email: stockData.adminEmail,
      },
      data: stockData,
      priority: 'medium',
    })
  }

  async sendSeasonReminder(customerData: {
    customerEmail: string
    customerName: string
  }) {
    return await this.sendNotification({
      type: 'season_reminder',
      recipient: {
        email: customerData.customerEmail,
        name: customerData.customerName,
      },
      data: customerData,
      priority: 'low',
    })
  }

  async sendBackInStockNotification(stockData: {
    customerEmail: string
    customerPhone?: string
    productName: string
    price: string
    productSlug: string
  }) {
    return await this.sendNotification({
      type: 'back_in_stock',
      recipient: {
        email: stockData.customerEmail,
        phone: stockData.customerPhone,
      },
      data: stockData,
      priority: 'medium',
    })
  }
}

// Default configuration for Sports Devil
export const defaultNotificationConfig: NotificationConfig = {
  email: {
    enabled: true,
    provider: 'resend',
    fromEmail: 'orders@sportsdevil.co.uk',
    fromName: 'Sports Devil Cricket',
  },
  sms: {
    enabled: true,
    provider: 'twilio',
    fromNumber: '+447897813165',
  },
  push: {
    enabled: false,
    provider: 'firebase',
  },
}

// Export singleton instance
export const notificationService = new NotificationService(defaultNotificationConfig)

export default {
  NotificationService,
  EmailService,
  SMSService,
  TemplateManager,
  notificationService,
  defaultNotificationConfig,
}