import { NextRequest } from 'next/server'
import { z } from 'zod'

/**
 * Payment Security Utilities for Sports Devil Cricket Equipment
 * Provides additional security layers for payment processing
 */

// Rate limiting for payment attempts
const paymentAttempts = new Map<string, { count: number; timestamp: number }>()

export class PaymentSecurity {
  /**
   * Rate limit payment attempts per IP address
   */
  static checkRateLimit(request: NextRequest, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    
    const current = paymentAttempts.get(ip)
    
    if (!current || now - current.timestamp > windowMs) {
      paymentAttempts.set(ip, { count: 1, timestamp: now })
      return true
    }
    
    if (current.count >= maxAttempts) {
      return false
    }
    
    current.count++
    return true
  }

  /**
   * Validate payment amount against suspicious patterns
   */
  static validatePaymentAmount(amount: number): { valid: boolean; reason?: string } {
    // Convert to pence for validation
    const amountInPence = Math.round(amount * 100)
    
    // Check for suspicious amounts
    if (amountInPence <= 0) {
      return { valid: false, reason: 'Invalid payment amount' }
    }
    
    // Maximum order value for cricket equipment (£10,000)
    if (amountInPence > 1000000) {
      return { valid: false, reason: 'Payment amount exceeds maximum limit' }
    }
    
    // Minimum order value (£1)
    if (amountInPence < 100) {
      return { valid: false, reason: 'Payment amount below minimum limit' }
    }
    
    // Check for common test amounts that might indicate fraud
    const suspiciousAmounts = [100, 101, 200, 500, 1000] // £1, £1.01, £2, £5, £10
    if (suspiciousAmounts.includes(amountInPence)) {
      console.warn(`Potentially suspicious test amount detected: £${amount}`)
    }
    
    return { valid: true }
  }

  /**
   * Validate UK address format
   */
  static validateUKAddress(address: {
    line1: string
    city: string
    postalCode: string
    country: string
  }): { valid: boolean; reason?: string } {
    // UK postcode regex
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
    
    if (address.country !== 'GB') {
      return { valid: false, reason: 'Only UK addresses are supported' }
    }
    
    if (!postcodeRegex.test(address.postalCode.replace(/\s/g, ''))) {
      return { valid: false, reason: 'Invalid UK postcode format' }
    }
    
    if (address.line1.length < 5) {
      return { valid: false, reason: 'Address line 1 too short' }
    }
    
    if (address.city.length < 2) {
      return { valid: false, reason: 'City name too short' }
    }
    
    return { valid: true }
  }

  /**
   * Detect potentially fraudulent patterns
   */
  static checkFraudPatterns(orderData: {
    email: string
    shippingAddress: any
    billingAddress: any
    amount: number
    items: Array<{ quantity: number; price: number }>
  }): { riskScore: number; flags: string[] } {
    const flags: string[] = []
    let riskScore = 0

    // Email validation
    if (orderData.email.includes('+') || orderData.email.includes('test')) {
      flags.push('Suspicious email pattern')
      riskScore += 10
    }

    // Address mismatch
    if (orderData.shippingAddress.country !== orderData.billingAddress?.country) {
      flags.push('Shipping and billing country mismatch')
      riskScore += 15
    }

    // Large quantity orders
    const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    if (totalQuantity > 20) {
      flags.push('Unusually large quantity order')
      riskScore += 20
    }

    // High-value items
    const avgItemPrice = orderData.amount / totalQuantity
    if (avgItemPrice > 500) {
      flags.push('High-value item order')
      riskScore += 10
    }

    // Round number amounts (potential test)
    if (orderData.amount % 10 === 0 && orderData.amount < 100) {
      flags.push('Round number amount')
      riskScore += 5
    }

    return { riskScore, flags }
  }

  /**
   * Sanitize order data for logging
   */
  static sanitizeOrderData(orderData: any): any {
    const sanitized = { ...orderData }
    
    // Remove sensitive information
    if (sanitized.paymentMethod) {
      sanitized.paymentMethod = '[REDACTED]'
    }
    
    if (sanitized.billingAddress) {
      sanitized.billingAddress = {
        ...sanitized.billingAddress,
        line1: sanitized.billingAddress.line1?.substring(0, 10) + '...',
      }
    }
    
    if (sanitized.shippingAddress) {
      sanitized.shippingAddress = {
        ...sanitized.shippingAddress,
        line1: sanitized.shippingAddress.line1?.substring(0, 10) + '...',
      }
    }
    
    // Keep only essential fields for logging
    return {
      orderNumber: sanitized.orderNumber,
      amount: sanitized.amount,
      itemCount: sanitized.items?.length || 0,
      country: sanitized.shippingAddress?.country,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Validate webhook source (additional layer beyond Stripe signature)
   */
  static validateWebhookSource(request: NextRequest): boolean {
    // Check if request is from Stripe's IP ranges (this is additional security)
    const userAgent = request.headers.get('user-agent')
    
    if (!userAgent?.includes('Stripe')) {
      console.warn('Webhook request without Stripe user agent')
      return false
    }
    
    // Additional checks could include:
    // - IP whitelist validation
    // - Request timing validation
    // - Header validation
    
    return true
  }

  /**
   * Generate secure order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `SD-${timestamp}-${random}`
  }

  /**
   * Log security event
   */
  static logSecurityEvent(event: {
    type: 'rate_limit' | 'fraud_detected' | 'invalid_payment' | 'webhook_error'
    details: any
    severity: 'low' | 'medium' | 'high'
    ip?: string
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event.type,
      severity: event.severity,
      details: this.sanitizeOrderData(event.details),
      ip: event.ip,
      service: 'sports-devil-payments',
    }
    
    console.log(`[SECURITY] ${event.severity.toUpperCase()}: ${event.type}`, logEntry)
    
    // In production, this would also:
    // - Send to security monitoring service
    // - Alert administrators for high severity events
    // - Store in security audit log
  }
}

/**
 * Validation schemas for payment security
 */
export const PaymentValidationSchemas = {
  paymentIntent: z.object({
    amount: z.number().min(100).max(1000000), // £1 to £10,000 in pence
    currency: z.literal('gbp'),
    metadata: z.object({
      userId: z.string().uuid(),
      orderType: z.literal('cricket_equipment'),
    }).partial(),
  }),

  ukAddress: z.object({
    line1: z.string().min(5).max(100),
    line2: z.string().max(100).optional(),
    city: z.string().min(2).max(50),
    postal_code: z.string().regex(/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i),
    country: z.literal('GB'),
  }),

  orderItems: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1).max(50),
    price: z.number().min(0.01).max(1000), // Max £1000 per item
  })).min(1).max(20), // Max 20 items per order
}

/**
 * Export middleware for payment security
 */
export function withPaymentSecurity(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Get IP address from headers
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Rate limiting
    if (!PaymentSecurity.checkRateLimit(request)) {
      PaymentSecurity.logSecurityEvent({
        type: 'rate_limit',
        details: { ip },
        severity: 'medium',
        ip,
      })
      
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return handler(request, ...args)
  }
}