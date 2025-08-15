import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { prisma } from '../../lib/prisma'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { EmailService } from '../../../../lib/email'

// PRODUCTION WEBHOOK ENDPOINT - For all users EXCEPT overdrive1612@gmail.com and admin@sportsdevil.co.uk
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = (await headersList).get('stripe-signature')

  // Use production webhook secret
  const productionWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE
  if (!productionWebhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET_LIVE environment variable is not configured')
    return NextResponse.json({ 
      error: 'Production webhook secret not configured', 
      endpoint: 'production',
      note: 'This endpoint excludes overdrive1612@gmail.com and admin@sportsdevil.co.uk'
    }, { status: 500 })
  }

  if (!sig) {
    console.error('No Stripe signature found')
    return NextResponse.json({ error: 'No signature found' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, productionWebhookSecret)
  } catch (err: any) {
    console.error(`Production webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log(`🚀 PRODUCTION webhook received: ${event.type}`, {
    id: event.id,
    created: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode,
    endpoint: 'PRODUCTION'
  })

  // Email filtering for production endpoint
  const emailFilter = await checkEmailPermissions(event, 'production')
  if (!emailFilter.allowed) {
    console.log(`🚫 Production webhook blocked: ${emailFilter.reason}`)
    return NextResponse.json({ 
      message: 'Webhook processed',
      note: emailFilter.reason,
      endpoint: 'production'
    })
  }

  try {
    await processWebhookEvent(event, 'production')
    return NextResponse.json({ received: true, endpoint: 'production' })
  } catch (error: any) {
    console.error(`Error processing production webhook: ${error.message}`)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function checkEmailPermissions(event: Stripe.Event, endpoint: 'test' | 'production') {
  // Extract email from different event types
  let customerEmail = ''
  
  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      customerEmail = paymentIntent.receipt_email || ''
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      customerEmail = session.customer_details?.email || session.customer_email || ''
      break
    }
    default:
      // For other events, allow processing
      return { allowed: true, reason: 'No email filtering required for this event type' }
  }

  if (endpoint === 'test') {
    // Test endpoint: Only allow admin@sportsdevil.co.uk and overdrive1612@gmail.com
    if (customerEmail === 'overdrive1612@gmail.com' || customerEmail === 'admin@sportsdevil.co.uk') {
      return { allowed: true, reason: 'Authorized test user' }
    } else {
      return { 
        allowed: false, 
        reason: `Test endpoint only allows admin@sportsdevil.co.uk and overdrive1612@gmail.com, received: ${customerEmail}` 
      }
    }
  } else {
    // Production endpoint: Allow all emails EXCEPT overdrive1612@gmail.com AND admin@sportsdevil.co.uk
    if (customerEmail === 'overdrive1612@gmail.com') {
      return { 
        allowed: false, 
        reason: 'Test user should use test endpoint' 
      }
    } else if (customerEmail === 'admin@sportsdevil.co.uk') {
      return { 
        allowed: false, 
        reason: 'Admin user excluded from production processing' 
      }
    } else {
      return { allowed: true, reason: 'Authorized production user' }
    }
  }
}

async function processWebhookEvent(event: Stripe.Event, endpoint: string) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutSessionCompleted(session, endpoint)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentSucceeded(paymentIntent, endpoint)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentFailed(paymentIntent, endpoint)
      break
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute
      await handleChargeDisputeCreated(dispute, endpoint)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentSucceeded(invoice, endpoint)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type} on ${endpoint} endpoint`)
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, endpoint: string) {
  console.log(`✅ Processing checkout.session.completed on ${endpoint} endpoint`)
  
  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('No order ID in session metadata')
    return
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paymentIntentId: session.payment_intent as string,
        transactionId: session.id
      }
    })

    if (session.payment_intent) {
      await prisma.stripePayment.updateMany({
        where: { stripePaymentIntentId: session.payment_intent as string },
        data: {
          status: 'SUCCEEDED',
          stripeEventId: session.id,
          metadata: JSON.stringify({
            ...session.metadata,
            sessionId: session.id,
            customerDetails: session.customer_details,
            endpoint: endpoint
          })
        }
      })
    }

    console.log(`✅ Order ${orderId} marked as completed via ${endpoint} webhook ${session.id}`)
    
    if (session.customer_details?.email) {
      console.log(`📧 Stripe receipt should be sent to: ${session.customer_details.email} (${endpoint})`)
    }
  } catch (error: any) {
    console.error(`Error updating order ${orderId} on ${endpoint} endpoint:`, error.message)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, endpoint: string) {
  console.log(`✅ Processing payment_intent.succeeded on ${endpoint} endpoint`)
  
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.error('No order ID in payment intent metadata')
    return
  }

  try {
    const charges = await stripe.charges.list({
      payment_intent: paymentIntent.id,
      limit: 1
    })
    const charge = charges.data[0]
    
    await prisma.stripePayment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: charge?.id,
        receiptUrl: charge?.receipt_url,
        paymentMethod: charge?.payment_method_details?.type,
        stripeEventId: paymentIntent.id,
        metadata: JSON.stringify({
          ...paymentIntent.metadata,
          chargeId: charge?.id,
          receiptUrl: charge?.receipt_url,
          endpoint: endpoint
        })
      }
    })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (order) {
      const orderTotal = parseFloat(order.totalAmount.toString())
      const loyaltyPointsEarned = Math.floor(orderTotal * 100)

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          totalSpent: { increment: orderTotal },
          loyaltyPoints: { increment: loyaltyPointsEarned }
        }
      })

      await prisma.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'EARNED',
          points: loyaltyPointsEarned,
          description: `Points earned from order ${order.orderNumber} (${endpoint})`
        }
      })

      console.log(`✅ User ${order.userId} earned ${loyaltyPointsEarned} loyalty points (${endpoint})`)
    }

    console.log(`✅ Payment ${paymentIntent.id} processed successfully via ${endpoint} webhook`)
    
    if (charge?.receipt_url) {
      console.log(`📧 Stripe receipt available at: ${charge.receipt_url} (${endpoint})`)
    }
    
    if (paymentIntent.receipt_email) {
      console.log(`📧 Receipt email sent to: ${paymentIntent.receipt_email} (${endpoint})`)
    }
  } catch (error: any) {
    console.error(`Error processing payment intent ${paymentIntent.id} on ${endpoint} endpoint:`, error.message)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, endpoint: string) {
  console.log(`❌ Processing payment_intent.payment_failed on ${endpoint} endpoint`)
  
  const orderId = paymentIntent.metadata?.orderId
  
  try {
    await prisma.stripePayment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        stripeEventId: paymentIntent.id,
        metadata: JSON.stringify({
          ...paymentIntent.metadata,
          lastPaymentError: paymentIntent.last_payment_error,
          endpoint: endpoint
        })
      }
    })

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      })
    }

    console.log(`❌ Payment ${paymentIntent.id} marked as failed (${endpoint})`)
  } catch (error: any) {
    console.error(`Error processing failed payment ${paymentIntent.id} on ${endpoint} endpoint:`, error.message)
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute, endpoint: string) {
  console.log(`⚠️ Processing charge.dispute.created on ${endpoint} endpoint`)
  
  try {
    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id
    const payment = await prisma.stripePayment.findFirst({
      where: { stripeChargeId: chargeId }
    })

    if (payment) {
      const existingMetadata = payment.metadata ? JSON.parse(payment.metadata) : {}
      await prisma.stripePayment.update({
        where: { id: payment.id },
        data: {
          metadata: JSON.stringify({
            ...existingMetadata,
            dispute: {
              id: dispute.id,
              amount: dispute.amount,
              reason: dispute.reason,
              status: dispute.status,
              createdAt: new Date(dispute.created * 1000),
              endpoint: endpoint
            }
          })
        }
      })

      console.log(`⚠️ Dispute ${dispute.id} recorded for payment ${payment.id} (${endpoint})`)
    }
  } catch (error: any) {
    console.error(`Error processing dispute ${dispute.id} on ${endpoint} endpoint:`, error.message)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, endpoint: string) {
  console.log(`✅ Processing invoice.payment_succeeded on ${endpoint} endpoint`)
  console.log(`✅ Invoice ${invoice.id} payment succeeded (${endpoint})`)
}