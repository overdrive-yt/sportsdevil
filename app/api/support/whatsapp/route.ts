import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { whatsappManager } from '@/lib/customer-support'
import { z } from 'zod'

const sendMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 format
  message: z.string().min(1).max(1600),
  messageType: z.enum(['text', 'template']).default('text'),
})

const webhookVerificationSchema = z.object({
  'hub.mode': z.string(),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string(),
})

// Webhook verification for WhatsApp Business API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const verification = webhookVerificationSchema.parse(params)

    if (verification['hub.mode'] === 'subscribe') {
      // Verify the webhook token
      const isValid = await whatsappManager.verifyWebhook(verification['hub.verify_token'])
      
      if (isValid) {
        console.log('WhatsApp webhook verified successfully')
        return new Response(verification['hub.challenge'], {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      } else {
        console.log('WhatsApp webhook verification failed')
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid webhook request' },
      { status: 400 }
    )

  } catch (error) {
    console.error('WhatsApp webhook verification error:', error)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'webhook') {
      return await handleWebhook(request)
    } else if (action === 'send') {
      return await handleSendMessage(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use webhook or send' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json(
      { error: 'WhatsApp API error' },
      { status: 500 }
    )
  }
}

async function handleWebhook(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process incoming WhatsApp message
    await whatsappManager.processIncomingMessage(body)

    // Log webhook receipt
    console.log('WhatsApp webhook received:', {
      timestamp: new Date().toISOString(),
      bodyKeys: Object.keys(body),
    })

    // WhatsApp requires a 200 response for webhook
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('WhatsApp webhook processing error:', error)
    
    // Still return 200 to WhatsApp to avoid retries
    return NextResponse.json({ success: false, error: 'Processing failed' })
  }
}

async function handleSendMessage(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can send WhatsApp messages via API
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const messageData = sendMessageSchema.parse(body)

    // Send WhatsApp message
    const whatsappMessage = await whatsappManager.sendMessage(
      messageData.to,
      messageData.message,
      messageData.messageType
    )

    // Log message sending
    console.log('WhatsApp message sent via API:', {
      messageId: whatsappMessage.id,
      to: messageData.to,
      messageType: messageData.messageType,
      sentBy: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent',
      whatsappMessage: {
        id: whatsappMessage.id,
        to: whatsappMessage.to,
        message: whatsappMessage.message,
        status: whatsappMessage.status,
        timestamp: whatsappMessage.timestamp,
      },
    })

  } catch (error) {
    console.error('Send WhatsApp message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}

// Additional endpoints for specific WhatsApp message types
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const messageType = searchParams.get('type')
    const body = await request.json()

    let result

    switch (messageType) {
      case 'order-confirmation':
        const orderSchema = z.object({
          to: z.string(),
          orderNumber: z.string(),
          total: z.string(),
        })
        const orderData = orderSchema.parse(body)
        result = await whatsappManager.sendOrderConfirmation(
          orderData.to,
          orderData.orderNumber,
          orderData.total
        )
        break

      case 'shipping-update':
        const shippingSchema = z.object({
          to: z.string(),
          orderNumber: z.string(),
          trackingNumber: z.string(),
        })
        const shippingData = shippingSchema.parse(body)
        result = await whatsappManager.sendShippingUpdate(
          shippingData.to,
          shippingData.orderNumber,
          shippingData.trackingNumber
        )
        break

      case 'support-response':
        const supportSchema = z.object({
          to: z.string(),
          ticketNumber: z.string(),
          response: z.string(),
        })
        const supportData = supportSchema.parse(body)
        result = await whatsappManager.sendSupportResponse(
          supportData.to,
          supportData.ticketNumber,
          supportData.response
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid message type' },
          { status: 400 }
        )
    }

    console.log(`WhatsApp ${messageType} message sent:`, {
      messageId: result.id,
      messageType,
      sentBy: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `${messageType} message sent`,
      whatsappMessage: result,
    })

  } catch (error) {
    console.error('WhatsApp template message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send template message' },
      { status: 500 }
    )
  }
}