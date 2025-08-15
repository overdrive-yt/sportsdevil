/**
 * Webhook Security and Idempotency
 * Ensures webhooks are processed only once and prevents replay attacks
 */

import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

interface WebhookProcessingRecord {
  id: string
  webhookId: string
  eventType: string
  payload: any
  signature: string
  processedAt: Date
  source: string
}

// In-memory cache for quick duplicate detection (production should use Redis)
const processedWebhooks = new Map<string, WebhookProcessingRecord>()

/**
 * Generate a unique identifier for webhook payload
 */
export function generateWebhookId(payload: any, headers: Record<string, string | null>): string {
  const timestamp = headers['x-timestamp'] || headers['timestamp'] || Date.now().toString()
  const signature = headers['stripe-signature'] || headers['signature'] || 'no-signature'
  const payloadString = JSON.stringify(payload)
  
  return createHash('sha256')
    .update(`${timestamp}:${signature}:${payloadString}`)
    .digest('hex')
}

/**
 * Verify webhook signature (Stripe example)
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    if (!signature || !signature.startsWith('t=')) {
      return false
    }

    const elements = signature.split(',')
    const timestampElement = elements.find(el => el.startsWith('t='))
    const signatureElements = elements.filter(el => el.startsWith('v1='))

    if (!timestampElement || signatureElements.length === 0) {
      return false
    }

    const timestamp = timestampElement.split('=')[1]
    const expectedSignatures = signatureElements.map(el => el.split('=')[1])

    // Check if timestamp is within acceptable range (5 minutes)
    const webhookTimestamp = parseInt(timestamp) * 1000
    const now = Date.now()
    const tolerance = 5 * 60 * 1000 // 5 minutes

    if (Math.abs(now - webhookTimestamp) > tolerance) {
      console.warn('Webhook timestamp outside tolerance window')
      return false
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHash('sha256')
      .update(signedPayload, 'utf8')
      .digest('hex')

    // Compare signatures
    return expectedSignatures.some(sig => sig === expectedSignature)
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Check if webhook has already been processed (idempotency check)
 */
export async function isWebhookProcessed(webhookId: string): Promise<boolean> {
  // Check in-memory cache first
  if (processedWebhooks.has(webhookId)) {
    return true
  }

  // Check database (if webhook processing records are stored)
  try {
    // Note: webhookProcessing model not yet implemented in schema
    // const record = await prisma.webhookProcessing?.findUnique({
    //   where: { webhookId }
    // })
    // 
    // if (record) {
    //   processedWebhooks.set(webhookId, record)
    //   return true
    // }
  } catch (error) {
    console.warn('Could not check webhook processing record in database:', error)
  }

  return false
}

/**
 * Mark webhook as processed
 */
export async function markWebhookProcessed(
  webhookId: string,
  eventType: string,
  payload: any,
  signature: string,
  source: string = 'stripe'
): Promise<void> {
  const record: WebhookProcessingRecord = {
    id: webhookId,
    webhookId,
    eventType,
    payload,
    signature,
    processedAt: new Date(),
    source,
  }

  // Store in memory cache
  processedWebhooks.set(webhookId, record)

  // Store in database (if table exists)
  try {
    // Note: webhookProcessing model not yet implemented in schema
    // await prisma.webhookProcessing?.create({
    //   data: {
    //     webhookId,
    //     eventType,
    //     payload,
    //     signature,
    //     source,
    //   }
    // })
  } catch (error) {
    console.warn('Could not store webhook processing record in database:', error)
  }

  // Cleanup old records from memory (keep last 1000)
  if (processedWebhooks.size > 1000) {
    const entries = Array.from(processedWebhooks.entries())
    entries
      .sort((a, b) => a[1].processedAt.getTime() - b[1].processedAt.getTime())
      .slice(0, entries.length - 1000)
      .forEach(([key]) => processedWebhooks.delete(key))
  }
}

/**
 * Webhook security middleware
 */
export async function webhookSecurity(
  request: NextRequest,
  secret: string,
  source: string = 'stripe'
): Promise<{
  isValid: boolean
  webhookId: string
  payload: any
  isDuplicate: boolean
  error?: string
}> {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || 
                     request.headers.get('signature') || ''
    
    // Verify signature
    if (source === 'stripe' && !verifyStripeSignature(body, signature, secret)) {
      return {
        isValid: false,
        webhookId: '',
        payload: null,
        isDuplicate: false,
        error: 'Invalid signature'
      }
    }

    // Parse payload
    const payload = JSON.parse(body)
    
    // Generate webhook ID
    const headers = {
      'stripe-signature': signature,
      'x-timestamp': request.headers.get('x-timestamp'),
      'timestamp': request.headers.get('timestamp'),
    }
    const webhookId = generateWebhookId(payload, headers)

    // Check for duplicates
    const isDuplicate = await isWebhookProcessed(webhookId)
    
    if (isDuplicate) {
      console.info('Duplicate webhook detected:', webhookId)
      return {
        isValid: true,
        webhookId,
        payload,
        isDuplicate: true,
      }
    }

    return {
      isValid: true,
      webhookId,
      payload,
      isDuplicate: false,
    }
  } catch (error) {
    console.error('Webhook security validation failed:', error)
    return {
      isValid: false,
      webhookId: '',
      payload: null,
      isDuplicate: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }
  }
}

/**
 * Process webhook with idempotency protection
 */
export async function processWebhookSafely<T>(
  request: NextRequest,
  secret: string,
  processor: (payload: any, webhookId: string) => Promise<T>,
  source: string = 'stripe'
): Promise<{
  success: boolean
  result?: T
  error?: string
  duplicate?: boolean
}> {
  try {
    const security = await webhookSecurity(request, secret, source)
    
    if (!security.isValid) {
      return {
        success: false,
        error: security.error || 'Security validation failed'
      }
    }

    if (security.isDuplicate) {
      console.info('Skipping duplicate webhook:', security.webhookId)
      return {
        success: true,
        duplicate: true
      }
    }

    // Process the webhook
    const result = await processor(security.payload, security.webhookId)

    // Mark as processed
    await markWebhookProcessed(
      security.webhookId,
      security.payload.type || 'unknown',
      security.payload,
      request.headers.get('stripe-signature') || '',
      source
    )

    return {
      success: true,
      result
    }
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    }
  }
}

/**
 * Get webhook processing statistics
 */
export function getWebhookStats(): {
  totalProcessed: number
  recentActivity: WebhookProcessingRecord[]
  eventTypes: Record<string, number>
} {
  const records = Array.from(processedWebhooks.values())
  const recent = records
    .sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime())
    .slice(0, 10)
  
  const eventTypes = records.reduce((acc, record) => {
    acc[record.eventType] = (acc[record.eventType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalProcessed: records.length,
    recentActivity: recent,
    eventTypes
  }
}