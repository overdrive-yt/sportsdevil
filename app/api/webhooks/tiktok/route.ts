// V9.11.5 Phase 2: TikTok Shop Webhook Handler
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { TikTokShopIntegration } from '../../../../lib/integrations/tiktok-shop'
import { IntegrationAuthManager } from '../../../../lib/integration-auth'

const prisma = new PrismaClient()

interface TikTokWebhookPayload {
  event: string
  data: any
  timestamp: number
  shop_id: string
}

// POST /api/webhooks/tiktok - Handle TikTok Shop webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload: TikTokWebhookPayload = JSON.parse(body)
    
    // Get signature from headers
    const signature = request.headers.get('x-tts-signature')
    const timestamp = request.headers.get('x-tts-timestamp')
    
    if (!signature || !timestamp) {
      return NextResponse.json({ 
        error: 'Missing webhook signature or timestamp' 
      }, { status: 400 })
    }

    // Find platform integration by shop ID
    const integration = await prisma.platformIntegration.findFirst({
      where: {
        platform: 'TIKTOK_SHOP',
        config: {
          contains: payload.shop_id
        }
      }
    })

    if (!integration) {
      return NextResponse.json({ 
        error: 'Platform integration not found' 
      }, { status: 404 })
    }

    // Verify webhook signature
    const credentials = IntegrationAuthManager.decryptCredentials(integration.credentials)
    const isValid = verifyWebhookSignature(body, signature, credentials.webhookSecret)
    
    if (!isValid) {
      console.error('Invalid TikTok webhook signature')
      return NextResponse.json({ 
        error: 'Invalid signature' 
      }, { status: 401 })
    }

    // Process webhook based on event type
    await processWebhookEvent(payload, integration.id)

    // Log successful webhook processing
    await prisma.syncLog.create({
      data: {
        platformId: integration.id,
        operation: 'ORDER_SYNC',
        direction: 'FROM_PLATFORM',
        status: 'SUCCESS',
        recordsProcessed: 1,
        recordsFailed: 0,
        metadata: JSON.stringify({
          event: payload.event,
          timestamp: payload.timestamp
        })
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('TikTok webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function processWebhookEvent(payload: TikTokWebhookPayload, platformId: string) {
  switch (payload.event) {
    case 'order.created':
      await handleOrderCreated(payload.data, platformId)
      break
      
    case 'order.updated':
      await handleOrderUpdated(payload.data, platformId)
      break
      
    case 'order.cancelled':
      await handleOrderCancelled(payload.data, platformId)
      break
      
    case 'product.updated':
      await handleProductUpdated(payload.data, platformId)
      break
      
    case 'inventory.updated':
      await handleInventoryUpdated(payload.data, platformId)
      break
      
    default:
      console.log(`Unhandled TikTok webhook event: ${payload.event}`)
  }
}

async function handleOrderCreated(orderData: any, platformId: string) {
  // Check if order already exists
  const existingMapping = await prisma.orderMapping.findFirst({
    where: {
      externalId: orderData.id,
      platformId
    }
  })

  if (existingMapping) {
    console.log(`Order ${orderData.id} already exists`)
    return
  }

  // Create local user if doesn't exist
  const user = await prisma.user.upsert({
    where: { email: orderData.customer.email },
    update: {},
    create: {
      email: orderData.customer.email,
      name: orderData.customer.name,
      phone: orderData.customer.phone
    }
  })

  // Calculate order amounts
  const subtotal = orderData.items.reduce((sum: number, item: any) => 
    sum + (Number(item.price) * item.quantity), 0)
  
  // Create local order
  const order = await prisma.order.create({
    data: {
      orderNumber: `TT-${orderData.order_number}`,
      status: mapTikTokOrderStatus(orderData.status),
      totalAmount: orderData.total_amount,
      subtotalAmount: subtotal,
      taxAmount: orderData.tax_amount || 0,
      shippingAmount: orderData.shipping_amount || 0,
      discountAmount: orderData.discount_amount || 0,
      userId: user.id,
      shippingName: orderData.shipping_address.name,
      shippingEmail: orderData.customer.email,
      shippingPhone: orderData.shipping_address.phone,
      shippingAddress: orderData.shipping_address.address,
      shippingCity: orderData.shipping_address.city,
      shippingPostal: orderData.shipping_address.postal_code,
      shippingCountry: orderData.shipping_address.country,
      billingName: orderData.shipping_address.name,
      billingEmail: orderData.customer.email,
      billingPhone: orderData.shipping_address.phone,
      billingAddress: orderData.shipping_address.address,
      billingCity: orderData.shipping_address.city,
      billingPostal: orderData.shipping_address.postal_code,
      billingCountry: orderData.shipping_address.country,
      paymentMethod: 'TikTok Shop',
      paymentStatus: 'COMPLETED'
    }
  })

  // Create order items
  for (const item of orderData.items) {
    // Find local product by external mapping
    const productMapping = await prisma.productMapping.findFirst({
      where: {
        externalId: item.product_id,
        platformId
      }
    })

    if (productMapping) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: productMapping.productId,
          quantity: item.quantity,
          price: item.price
        }
      })
    }
  }

  // Create order mapping
  await prisma.orderMapping.create({
    data: {
      orderId: order.id,
      platformId,
      externalId: orderData.id,
      externalNumber: orderData.order_number,
      status: 'SYNCED',
      lastSync: new Date(),
      metadata: JSON.stringify(orderData)
    }
  })

  console.log(`Created local order ${order.orderNumber} from TikTok order ${orderData.id}`)
}

async function handleOrderUpdated(orderData: any, platformId: string) {
  // Find existing order mapping
  const orderMapping = await prisma.orderMapping.findFirst({
    where: {
      externalId: orderData.id,
      platformId
    },
    include: { order: true }
  })

  if (!orderMapping) {
    console.log(`Order mapping not found for TikTok order ${orderData.id}`)
    return
  }

  // Update local order status
  await prisma.order.update({
    where: { id: orderMapping.orderId },
    data: {
      status: mapTikTokOrderStatus(orderData.status)
    }
  })

  // Update order mapping
  await prisma.orderMapping.update({
    where: { id: orderMapping.id },
    data: {
      status: 'SYNCED',
      lastSync: new Date(),
      metadata: JSON.stringify(orderData)
    }
  })

  console.log(`Updated local order ${orderMapping.order.orderNumber} from TikTok webhook`)
}

async function handleOrderCancelled(orderData: any, platformId: string) {
  // Find existing order mapping
  const orderMapping = await prisma.orderMapping.findFirst({
    where: {
      externalId: orderData.id,
      platformId
    }
  })

  if (!orderMapping) {
    console.log(`Order mapping not found for cancelled TikTok order ${orderData.id}`)
    return
  }

  // Update local order to cancelled
  await prisma.order.update({
    where: { id: orderMapping.orderId },
    data: {
      status: 'CANCELLED'
    }
  })

  console.log(`Cancelled local order from TikTok webhook: ${orderData.id}`)
}

async function handleProductUpdated(productData: any, platformId: string) {
  // Find existing product mapping
  const productMapping = await prisma.productMapping.findFirst({
    where: {
      externalId: productData.id,
      platformId
    }
  })

  if (!productMapping) {
    console.log(`Product mapping not found for TikTok product ${productData.id}`)
    return
  }

  // Update local product if needed
  await prisma.product.update({
    where: { id: productMapping.productId },
    data: {
      // Only update specific fields that should sync from TikTok
      isActive: productData.status === 'ACTIVE'
    }
  })

  // Update product mapping
  await prisma.productMapping.update({
    where: { id: productMapping.id },
    data: {
      lastSync: new Date(),
      platformData: JSON.stringify(productData)
    }
  })

  console.log(`Updated local product from TikTok webhook: ${productData.id}`)
}

async function handleInventoryUpdated(inventoryData: any, platformId: string) {
  // Find existing product mapping
  const productMapping = await prisma.productMapping.findFirst({
    where: {
      externalId: inventoryData.product_id,
      platformId
    }
  })

  if (!productMapping) {
    console.log(`Product mapping not found for TikTok inventory update ${inventoryData.product_id}`)
    return
  }

  // Update local inventory if this is the source of truth
  // Only update if the change came from TikTok and we want to sync back
  const shouldSyncInventory = true // This could be a configuration setting

  if (shouldSyncInventory) {
    await prisma.product.update({
      where: { id: productMapping.productId },
      data: {
        stockQuantity: inventoryData.inventory
      }
    })

    console.log(`Updated local inventory from TikTok: ${inventoryData.product_id} = ${inventoryData.inventory}`)
  }
}

function mapTikTokOrderStatus(tiktokStatus: string): any {
  const statusMap: Record<string, any> = {
    'PENDING': 'PENDING',
    'CONFIRMED': 'CONFIRMED', 
    'PROCESSING': 'PROCESSING',
    'SHIPPED': 'SHIPPED',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
    'REFUNDED': 'REFUNDED'
  }
  return statusMap[tiktokStatus] || 'PENDING'
}

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}