import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { prisma } from '../../lib/prisma'
import { EmailService } from '../../../../lib/email'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const sig = (await headersList).get('stripe-signature')

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET environment variable is not configured')
    console.error('📝 To fix this:')
    console.error('1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks')
    console.error('2. Create/select webhook endpoint: https://your-domain.com/api/stripe/webhook')
    console.error('3. Copy the webhook signing secret (starts with whsec_)')
    console.error('4. Set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here in environment')
    return NextResponse.json({ 
      error: 'Webhook secret not configured', 
      setup_required: true,
      docs_url: 'https://stripe.com/docs/webhooks/signatures'
    }, { status: 500 })
  }

  if (!sig) {
    console.error('No Stripe signature found')
    return NextResponse.json({ error: 'No signature found' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log(`🔔 Stripe webhook received: ${event.type}`, {
    id: event.id,
    created: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        await handleChargeDisputeCreated(dispute)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Processing checkout.session.completed')
  
  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('No order ID in session metadata')
    return
  }

  try {
    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paymentIntentId: session.payment_intent as string,
        transactionId: session.id
      }
    })

    // Update payment record
    if (session.payment_intent) {
      await prisma.stripePayment.updateMany({
        where: { stripePaymentIntentId: session.payment_intent as string },
        data: {
          status: 'SUCCEEDED',
          stripeEventId: session.id,
          metadata: JSON.stringify({
            ...session.metadata,
            sessionId: session.id,
            customerDetails: session.customer_details
          })
        }
      })
    }

    console.log(`✅ Order ${orderId} marked as completed via webhook ${session.id}`)
    
    // Log receipt email status
    if (session.customer_details?.email) {
      console.log(`📧 Stripe receipt should be sent to: ${session.customer_details.email}`)
    } else {
      console.warn('⚠️ No customer email in session - receipt may not be sent')
    }
  } catch (error: any) {
    console.error(`Error updating order ${orderId}:`, error.message)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Processing payment_intent.succeeded')
  
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.error('No order ID in payment intent metadata')
    return
  }

  try {
    // Get charge information from Stripe API
    const charges = await stripe.charges.list({
      payment_intent: paymentIntent.id,
      limit: 1
    })
    const charge = charges.data[0]
    
    // Update payment record with detailed information
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
          receiptUrl: charge?.receipt_url
        })
      }
    })

    // Update user's total spent and loyalty points
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (order) {
      const orderTotal = parseFloat(order.totalAmount.toString())
      const loyaltyPointsEarned = Math.floor(orderTotal * 100) // 100 points per £1

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          totalSpent: { increment: orderTotal },
          loyaltyPoints: { increment: loyaltyPointsEarned }
        }
      })

      // Create loyalty transaction record
      await prisma.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'EARNED',
          points: loyaltyPointsEarned,
          description: `Points earned from order ${order.orderNumber}`
        }
      })

      console.log(`✅ User ${order.userId} earned ${loyaltyPointsEarned} loyalty points`)
    }

    console.log(`✅ Payment ${paymentIntent.id} processed successfully via webhook`)
    
    // Log receipt information
    if (charge?.receipt_url) {
      console.log(`📧 Stripe receipt available at: ${charge.receipt_url}`)
    }
    
    if (paymentIntent.receipt_email) {
      console.log(`📧 Stripe receipt email sent to: ${paymentIntent.receipt_email}`)
    } else {
      console.warn('⚠️ No Stripe receipt email configured for this payment')
    }
    
    // ADDED: Send Sports Devil order confirmation email
    if (order && charge?.receipt_url) {
      try {
        console.log(`📧 Sending Sports Devil order confirmation email to: ${order.user.email}`)
        
        // Get order items for the email
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: order.id },
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        })
        
        // Send the order confirmation email
        await EmailService.sendOrderConfirmation({
          orderNumber: order.orderNumber,
          customerEmail: order.user.email,
          customerName: order.user.name || 'Customer',
          items: orderItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
            image: item.product.images[0]?.url
          })),
          totals: {
            subtotal: parseFloat(order.subtotalAmount.toString()),
            vat: parseFloat(order.taxAmount.toString()),
            shipping: parseFloat(order.shippingAmount.toString()),
            total: parseFloat(order.totalAmount.toString()),
          },
          shippingAddress: {
            name: order.shippingName || 'Unknown',
            address: order.shippingAddress || '',
            city: order.shippingCity || '',
            postalCode: order.shippingPostal || '',
            country: order.shippingCountry || 'UK',
          },
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        })
        
        console.log(`✅ Sports Devil order confirmation email sent to: ${order.user.email}`)
      } catch (emailError) {
        console.error('❌ Failed to send Sports Devil order confirmation email:', emailError)
        // Don't fail the webhook - order processing should succeed even if email fails
      }
    }
  } catch (error: any) {
    console.error(`Error processing payment intent ${paymentIntent.id}:`, error.message)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Processing payment_intent.payment_failed')
  
  const orderId = paymentIntent.metadata?.orderId
  
  try {
    // Update payment record
    await prisma.stripePayment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        stripeEventId: paymentIntent.id,
        metadata: JSON.stringify({
          ...paymentIntent.metadata,
          lastPaymentError: paymentIntent.last_payment_error
        })
      }
    })

    // Update order status if order exists
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED'
        }
      })
    }

    console.log(`❌ Payment ${paymentIntent.id} marked as failed`)
  } catch (error: any) {
    console.error(`Error processing failed payment ${paymentIntent.id}:`, error.message)
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  console.log('⚠️ Processing charge.dispute.created')
  
  try {
    // Find the payment record
    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id
    const payment = await prisma.stripePayment.findFirst({
      where: { stripeChargeId: chargeId }
    })

    if (payment) {
      // Update metadata to include dispute information
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
              createdAt: new Date(dispute.created * 1000)
            }
          })
        }
      })

      console.log(`⚠️ Dispute ${dispute.id} recorded for payment ${payment.id}`)
    }
  } catch (error: any) {
    console.error(`Error processing dispute ${dispute.id}:`, error.message)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Processing invoice.payment_succeeded')
  // Handle subscription or recurring payment logic here if needed
  console.log(`✅ Invoice ${invoice.id} payment succeeded`)
}