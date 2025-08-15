import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    // Parameters for filtering
    const limit = parseInt(searchParams.get('limit') || '50')
    const startingAfter = searchParams.get('starting_after')
    const endingBefore = searchParams.get('ending_before') 
    const syncToDb = searchParams.get('sync') === 'true'
    
    // Admin check for full access
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔍 Fetching Stripe payment history...')
    
    // Get payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: Math.min(limit, 100),
      ...(startingAfter && { starting_after: startingAfter }),
      ...(endingBefore && { ending_before: endingBefore })
    })

    // Get charges for additional details
    const charges = await stripe.charges.list({
      limit: Math.min(limit, 100),
      ...(startingAfter && { starting_after: startingAfter }),
      ...(endingBefore && { ending_before: endingBefore })
    })

    // Get customers for customer details
    const customers = await stripe.customers.list({
      limit: 100
    })

    // Create a map for quick customer lookup
    const customerMap = new Map(customers.data.map(c => [c.id, c]))

    const processedPayments = []
    let syncedCount = 0

    for (const intent of paymentIntents.data) {
      // Find related charge
      const charge = charges.data.find(c => c.payment_intent === intent.id)
      
      // Get customer details
      const customer = intent.customer ? customerMap.get(intent.customer as string) : null
      
      const paymentData = {
        stripePaymentIntentId: intent.id,
        stripeCustomerId: customer?.id || null,
        amount: intent.amount / 100, // Convert from cents to pounds
        currency: intent.currency,
        status: mapStripeStatus(intent.status),
        paymentMethod: charge?.payment_method_details?.type || null,
        customerEmail: customer?.email || (intent.receipt_email || ''),
        customerName: customer?.name || null,
        billingAddress: charge?.billing_details?.address ? JSON.stringify(charge.billing_details.address) : null,
        shippingAddress: charge?.shipping?.address ? JSON.stringify(charge.shipping.address) : null,
        metadata: JSON.stringify({
          ...intent.metadata,
          chargeId: charge?.id,
          receiptUrl: charge?.receipt_url,
          paymentMethodBrand: charge?.payment_method_details?.card?.brand,
          paymentMethodLast4: charge?.payment_method_details?.card?.last4
        }),
        description: intent.description,
        receiptUrl: charge?.receipt_url,
        stripeEventId: intent.id,
        stripeChargeId: charge?.id,
        createdAt: new Date(intent.created * 1000),
        updatedAt: new Date()
      }

      processedPayments.push({
        ...paymentData,
        stripeRaw: {
          paymentIntent: intent,
          charge: charge,
          customer: customer
        }
      })

      // Sync to database if requested
      if (syncToDb) {
        try {
          await prisma.stripePayment.upsert({
            where: { stripePaymentIntentId: intent.id },
            update: {
              amount: paymentData.amount,
              status: paymentData.status,
              paymentMethod: paymentData.paymentMethod,
              receiptUrl: paymentData.receiptUrl,
              stripeChargeId: paymentData.stripeChargeId,
              metadata: paymentData.metadata,
              updatedAt: new Date()
            },
            create: paymentData
          })
          syncedCount++
        } catch (error) {
          console.error(`Failed to sync payment ${intent.id}:`, error)
        }
      }
    }

    // Get additional analytics from Stripe
    const analytics = await getStripeAnalytics()

    return NextResponse.json({
      success: true,
      data: {
        payments: processedPayments,
        pagination: {
          hasMore: paymentIntents.has_more,
          total: paymentIntents.data.length,
          limit: limit
        },
        analytics: analytics,
        ...(syncToDb && {
          sync: {
            syncedCount,
            totalProcessed: processedPayments.length
          }
        })
      }
    })

  } catch (error: any) {
    console.error('Stripe payment history error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment history',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function getStripeAnalytics() {
  try {
    // Get balance
    const balance = await stripe.balance.retrieve()
    
    // Get recent balance transactions for revenue calculation
    const balanceTransactions = await stripe.balanceTransactions.list({
      limit: 100
    })

    // Calculate revenue metrics
    const totalRevenue = balanceTransactions.data
      .filter(tx => tx.type === 'payment')
      .reduce((sum, tx) => sum + tx.net, 0) / 100 // Convert to pounds

    const thisMonthRevenue = balanceTransactions.data
      .filter(tx => {
        const txDate = new Date(tx.created * 1000)
        const now = new Date()
        return tx.type === 'payment' && 
               txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, tx) => sum + tx.net, 0) / 100

    return {
      balance: {
        available: balance.available.map(b => ({
          amount: b.amount / 100,
          currency: b.currency
        })),
        pending: balance.pending.map(b => ({
          amount: b.amount / 100,
          currency: b.currency
        }))
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue
      },
      transactionCount: balanceTransactions.data.length
    }
  } catch (error) {
    console.error('Error fetching Stripe analytics:', error)
    return null
  }
}

function mapStripeStatus(stripeStatus: string): any {
  const statusMap: Record<string, any> = {
    'requires_payment_method': 'REQUIRES_PAYMENT_METHOD',
    'requires_confirmation': 'REQUIRES_CONFIRMATION', 
    'requires_action': 'REQUIRES_ACTION',
    'processing': 'PROCESSING',
    'requires_capture': 'REQUIRES_CAPTURE',
    'canceled': 'CANCELLED',
    'succeeded': 'SUCCEEDED',
    'failed': 'FAILED'
  }
  
  return statusMap[stripeStatus] || 'PROCESSING'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, paymentIntentId } = body

    if (action === 'refund' && paymentIntentId) {
      // Create refund
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      })

      // Record refund in database
      const payment = await prisma.stripePayment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId }
      })

      if (payment) {
        await prisma.stripeRefund.create({
          data: {
            stripeRefundId: refund.id,
            stripePaymentId: payment.id,
            amount: refund.amount / 100,
            currency: refund.currency,
            status: refund.status || 'pending',
            reason: refund.reason,
            metadata: JSON.stringify(refund.metadata)
          }
        })
      }

      return NextResponse.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Stripe action error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process action',
        details: error.message 
      },
      { status: 500 }
    )
  }
}