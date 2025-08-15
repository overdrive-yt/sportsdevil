// V9.11.5 Integration Testing API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { IntegrationTestingFramework } from '../../../../lib/integration-testing'

// POST /api/integrations/test - Run integration tests
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { platform, generateReport = false } = body

    const testFramework = new IntegrationTestingFramework()
    
    if (platform) {
      // Test specific platform
      const validPlatforms = ['TikTok Shop', 'Xepos', 'eBay', 'Database']
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json({ 
          error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` 
        }, { status: 400 })
      }

      const testSuite = await testFramework.testSpecificPlatform(platform)
      
      return NextResponse.json({
        platform,
        testSuite,
        summary: {
          success: testSuite.summary.successRate === 100,
          message: testSuite.summary.successRate === 100 
            ? `All ${platform} tests passed successfully`
            : `${testSuite.summary.failed} of ${testSuite.summary.total} ${platform} tests failed`
        }
      })
    } else {
      // Run all platform tests
      const report = await testFramework.runAllPlatformTests()
      
      let response: any = {
        report,
        summary: {
          success: report.overallSummary.overallSuccessRate === 100,
          message: report.overallSummary.overallSuccessRate === 100
            ? 'All integration tests passed successfully'
            : `${report.overallSummary.totalFailed} of ${report.overallSummary.totalTests} tests failed`,
          criticalIssuesCount: report.criticalIssues.length,
          recommendationsCount: report.recommendations.length
        }
      }

      if (generateReport) {
        response.textReport = testFramework.generateTextReport(report)
      }

      return NextResponse.json(response)
    }

  } catch (error) {
    console.error('Integration testing error:', error)
    return NextResponse.json({ 
      error: 'Integration testing failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

// GET /api/integrations/test - Get testing capabilities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      availablePlatforms: [
        {
          name: 'TikTok Shop',
          description: 'Social commerce platform integration testing',
          tests: [
            'Authentication',
            'Product Creation',
            'Order Processing',
            'Live Shopping Session',
            'Analytics Retrieval'
          ]
        },
        {
          name: 'Xepos',
          description: 'POS system integration testing',
          tests: [
            'Authentication',
            'Product Sync',
            'Inventory Sync',
            'Sales Sync',
            'Store Status'
          ]
        },
        {
          name: 'eBay',
          description: 'Marketplace integration testing',
          tests: [
            'Authentication',
            'Category Retrieval',
            'Listing Creation',
            'Order Processing',
            'Seller Metrics'
          ]
        },
        {
          name: 'Database',
          description: 'Database integration testing',
          tests: [
            'Platform Integration Creation',
            'Product Mapping Creation',
            'Sync Log Creation'
          ]
        }
      ],
      testOptions: {
        runAll: 'Test all platforms comprehensively',
        runSpecific: 'Test a specific platform',
        generateReport: 'Generate detailed text report'
      },
      estimatedDuration: {
        singlePlatform: '5-10 seconds',
        allPlatforms: '20-30 seconds',
        withReport: '25-35 seconds'
      }
    })

  } catch (error) {
    console.error('Get testing capabilities error:', error)
    return NextResponse.json({ 
      error: 'Failed to get testing capabilities' 
    }, { status: 500 })
  }
}