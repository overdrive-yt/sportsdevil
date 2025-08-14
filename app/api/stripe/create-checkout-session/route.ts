import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    const { 
      orderId, 
      items = [], 
      customerEmail, 
      customerName,
      shippingAddress,
      billingAddress 
    } = body

    if (!orderId || !items.length) {
      return NextResponse.json(
        { error: 'Order ID and items are required' },
        { status: 400 }
      )
    }

    // Get order details from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create or get Stripe customer
    let stripeCustomerId: string | undefined
    if (session?.user?.id) {
      const stripeCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId: session.user.id }
      })

      if (stripeCustomer) {
        stripeCustomerId = stripeCustomer.stripeCustomerId
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: customerEmail || order.user.email,
          name: customerName || order.user.name || undefined,
          metadata: {
            userId: session.user.id,
            orderId: order.id
          }
        })

        // Save to database
        await prisma.stripeCustomer.create({
          data: {
            userId: session.user.id,
            stripeCustomerId: customer.id,
            email: customer.email!,
            name: customer.name
          }
        })

        stripeCustomerId = customer.id
      }
    }

    // Convert order items to Stripe line items
    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.images && item.product.images.length > 0 ? [item.product.images[0].url] : [],
          metadata: {
            productId: item.product.id
          }
        },
        unit_amount: Math.round(parseFloat(item.price.toString()) * 100), // Convert to pence
      },
      quantity: item.quantity,
    }))

    // Add shipping if applicable
    if (order.shippingAmount && parseFloat(order.shippingAmount.toString()) > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Shipping',
            description: 'Standard UK delivery',
            images: [],
            metadata: {
              productId: 'shipping'
            }
          },
          unit_amount: Math.round(parseFloat(order.shippingAmount.toString()) * 100)
        },
        quantity: 1
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancelled?order_id=${orderId}`,
      metadata: {
        orderId: order.id,
        userId: session?.user?.id || 'guest'
      },
      customer_email: !stripeCustomerId ? customerEmail || order.user.email : undefined,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE'] // UK and Ireland
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          userId: session?.user?.id || 'guest'
        }
      }
    })

    // Create pending payment record
    await prisma.stripePayment.create({
      data: {
        stripePaymentIntentId: checkoutSession.payment_intent as string,
        stripeCustomerId,
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'gbp',
        status: 'REQUIRES_PAYMENT_METHOD',
        customerEmail: customerEmail || order.user.email,
        customerName: customerName || order.user.name,
        billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        metadata: JSON.stringify({
          checkoutSessionId: checkoutSession.id,
          orderId: order.id
        })
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}