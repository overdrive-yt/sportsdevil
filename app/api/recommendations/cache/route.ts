import { NextRequest, NextResponse } from 'next/server'
import { RecommendationEngine } from '../../../../lib/ai/recommendations'

export async function DELETE() {
  try {
    RecommendationEngine.clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'Recommendation cache cleared successfully',
      clearedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = RecommendationEngine.getCacheStats()
    
    return NextResponse.json({
      success: true,
      cache: {
        ...stats,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get cache stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}