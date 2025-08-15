import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { setupTestData, cleanupTestData } from '../../../../lib/test-data-setup'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Test data API called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ No authentication found')
      return NextResponse.json(
        { error: 'Authentication required. Please log in first.' },
        { status: 401 }
      )
    }

    console.log(`👤 Authenticated user: ${session.user.email}`)

    const { action } = await request.json()
    console.log(`🎯 Action requested: ${action}`)

    if (action === 'setup') {
      console.log('📦 Starting test data setup...')
      
      const result = await setupTestData(session.user.email)
      
      console.log('✅ Setup completed successfully!')
      
      return NextResponse.json({
        success: true,
        message: 'Test data setup completed successfully! Refresh your dashboard to see the changes.',
        data: {
          userEmail: session.user.email,
          totalOrders: result?.orders.length,
          totalSpent: result?.totalSpent,
          loyaltyPoints: result?.loyaltyPoints,
          productsCreated: result?.products.length,
          verificationReady: true
        },
        summary: result?.summary,
        instructions: {
          nextSteps: [
            'Refresh your dashboard page',
            'Check Overview tab for updated metrics',
            'Click Orders tab to see 3 test orders',
            'Click Loyalty tab to see points calculation',
            'Verify Profile tab shows correct registration date'
          ],
          expectedResults: {
            loyaltyPoints: result?.loyaltyPoints,
            totalSpent: `£${result?.totalSpent}`,
            orderCount: result?.orders.length,
            orderStatuses: ['DELIVERED', 'PROCESSING', 'SHIPPED']
          }
        }
      })
      
    } else if (action === 'cleanup') {
      console.log('🧹 Starting test data cleanup...')
      
      const result = await cleanupTestData(session.user.email)
      
      console.log('✅ Cleanup completed successfully!')
      
      return NextResponse.json({
        success: true,
        message: 'Test data cleanup completed successfully! Refresh your dashboard to see clean state.',
        data: {
          userEmail: session.user.email,
          deletedOrders: result?.deletedOrders,
          deletedOrderItems: result?.deletedOrderItems,
          deletedLoyaltyTransactions: result?.deletedLoyaltyTransactions,
          userReset: result?.userReset
        },
        instructions: {
          nextSteps: [
            'Refresh your dashboard page',
            'Verify all metrics show 0',
            'Confirm no orders are displayed',
            'Check loyalty points reset to 0'
          ]
        }
      })
      
    } else {
      console.log(`❌ Invalid action: ${action}`)
      return NextResponse.json(
        { 
          error: 'Invalid action. Use "setup" or "cleanup"',
          validActions: ['setup', 'cleanup'],
          example: {
            setup: { action: 'setup' },
            cleanup: { action: 'cleanup' }
          }
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error in test data API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        troubleshooting: [
          'Ensure you are logged in',
          'Check database connection',
          'Verify Prisma schema is up to date',
          'Check server logs for detailed error'
        ]
      },
      { status: 500 }
    )
  }
}