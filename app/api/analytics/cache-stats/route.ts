import { NextResponse } from 'next/server'
import { analyticsCache } from '../../../../lib/cache/analytics-cache'

export async function GET() {
  try {
    const stats = analyticsCache.getStats()
    
    return NextResponse.json({
      success: true,
      cache: {
        ...stats,
        performance: {
          hitRate: 'Available after first cache hits',
          memoryUsage: `${stats.totalItems} items in memory`
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Cache stats API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cache statistics',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const sizeBefore = analyticsCache.size()
    analyticsCache.clear()
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully`,
      itemsRemoved: sizeBefore,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Cache clear API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}