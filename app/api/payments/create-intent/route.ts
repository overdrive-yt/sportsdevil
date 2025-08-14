import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not configured')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Stripe Secret Key missing')
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log('💳 Payment Intent Request:', { 
      amount: body.amount, 
      currency: body.currency,
      cartItemsCount: body.cartItems?.length,
      customerEmail: body.customerEmail,
      shippingMethod: body.shippingMethod,
      couponCode: body.couponCode || 'none'
    })
    
    console.log('🔍 Full request body:', JSON.stringify(body, null, 2))

    const { amount, currency = 'gbp', cartItems, shippingMethod, couponCode, customerEmail } = body

    // Validate amount
    if (!amount || amount < 50) { // Minimum 50p
      console.error('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount - minimum 50p required' },
        { status: 400 }
      )
    }

    // Create a PaymentIntent with the order amount and currency
    console.log('🚀 Creating Stripe PaymentIntent...')
    const paymentIntentData: any = {
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        cartItems: JSON.stringify(cartItems),
        shippingMethod,
        couponCode: couponCode || '',
      },
    }

    // Add customer email if provided for Stripe receipts
    if (customerEmail && customerEmail.includes('@')) {
      paymentIntentData.receipt_email = customerEmail
      console.log('📧 Stripe will send receipt to:', customerEmail)
    } else if (customerEmail) {
      console.warn('⚠️ Invalid customer email format:', customerEmail)
    } else {
      console.warn('⚠️ No customer email provided - receipts will not be sent')
    }

    console.log('🚀 Creating PaymentIntent with data:', JSON.stringify(paymentIntentData, null, 2))
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

    console.log('✅ PaymentIntent created successfully:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecretExists: !!paymentIntent.client_secret,
      receiptEmail: paymentIntent.receipt_email
    })
    
    // Validate client secret exists before returning
    if (!paymentIntent.client_secret) {
      console.error('❌ PaymentIntent created but missing client_secret')
      throw new Error('PaymentIntent creation incomplete - missing client_secret')
    }
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    })

  } catch (error: any) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('x-request-id') || 'unknown'
    }
    
    console.error('❌ Stripe Error Details:', errorDetails)
    
    // Return user-friendly error message based on error type
    let userMessage = 'Payment processing temporarily unavailable'
    let statusCode = 500
    
    if (error.type === 'StripeInvalidRequestError') {
      userMessage = 'Invalid payment request - please check your order details'
      statusCode = 400
    } else if (error.type === 'StripeAuthenticationError') {
      userMessage = 'Payment service configuration error'
      statusCode = 500
    } else if (error.type === 'StripeAPIError') {
      userMessage = 'Payment service temporarily unavailable'
      statusCode = 503
    } else if (error.type === 'StripeConnectionError') {
      userMessage = 'Payment service connection failed - please try again'
      statusCode = 503
    } else if (error.type === 'StripeRateLimitError') {
      userMessage = 'Too many payment requests - please wait a moment'
      statusCode = 429
    }
    
    console.log('🎭 Returning user-friendly error:', userMessage, 'Status:', statusCode)
    
    return NextResponse.json(
      { 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}