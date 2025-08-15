import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { metricsTracker } from '@/lib/social-media'
import { z } from 'zod'

const updateMetricsSchema = z.object({
  platform: z.string(),
  followers: z.number().min(0).optional(),
  engagement: z.number().min(0).optional(),
  posts: z.number().min(0).optional(),
  reach: z.number().min(0).optional(),
  impressions: z.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both public access and admin access for social metrics
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const detailed = searchParams.get('detailed') === 'true'

    // Get social media metrics
    const allMetrics = await metricsTracker.getAllMetrics()

    // Filter by platform if specified
    const metrics = platform 
      ? allMetrics.filter(m => m.platform.toLowerCase() === platform.toLowerCase())
      : allMetrics

    // Format metrics for response
    const formattedMetrics = metrics.map(metric => {
      const baseMetric = {
        platform: metric.platform,
        followers: metric.followers,
        engagement: metric.engagement,
        posts: metric.posts,
        lastUpdated: metric.lastUpdated,
      }

      // Include detailed metrics only for admin users
      if (detailed && session?.user?.role === 'ADMIN') {
        return {
          ...baseMetric,
          reach: metric.reach,
          impressions: metric.impressions,
        }
      }

      return baseMetric
    })

    // Calculate overall engagement rate
    const totalFollowers = formattedMetrics.reduce((sum, m) => sum + m.followers, 0)
    const avgEngagement = formattedMetrics.length > 0
      ? formattedMetrics.reduce((sum, m) => sum + m.engagement, 0) / formattedMetrics.length
      : 0

    // Log metrics request
    console.log('Social metrics requested:', {
      platform,
      detailed,
      metricsCount: formattedMetrics.length,
      requestedBy: session?.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      metrics: formattedMetrics,
      summary: {
        totalPlatforms: formattedMetrics.length,
        totalFollowers,
        averageEngagement: Math.round(avgEngagement * 100) / 100,
        lastUpdated: new Date().toISOString(),
      },
      meta: {
        platform,
        detailed,
        isAdmin: session?.user?.role === 'ADMIN',
      },
    })

  } catch (error) {
    console.error('Get social metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to get social metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can update social metrics
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const metricsData = updateMetricsSchema.parse(body)

    // Update social media metrics
    const updatedMetrics = await metricsTracker.updateMetrics(
      metricsData.platform,
      {
        followers: metricsData.followers,
        engagement: metricsData.engagement,
        posts: metricsData.posts,
        reach: metricsData.reach,
        impressions: metricsData.impressions,
      }
    )

    // Log metrics update
    console.log('Social metrics updated:', {
      platform: metricsData.platform,
      updatedBy: session.user.id,
      followers: metricsData.followers,
      engagement: metricsData.engagement,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Social metrics updated successfully',
      metrics: updatedMetrics,
      updatedBy: session.user.id,
    })

  } catch (error) {
    console.error('Update social metrics API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid metrics data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update social metrics' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can bulk update metrics
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { platforms } = z.object({
      platforms: z.array(updateMetricsSchema)
    }).parse(body)

    const results = []

    // Update metrics for multiple platforms
    for (const platformData of platforms) {
      try {
        const updatedMetrics = await metricsTracker.updateMetrics(
          platformData.platform,
          {
            followers: platformData.followers,
            engagement: platformData.engagement,
            posts: platformData.posts,
            reach: platformData.reach,
            impressions: platformData.impressions,
          }
        )
        
        results.push({
          platform: platformData.platform,
          success: true,
          metrics: updatedMetrics,
        })
      } catch (error) {
        results.push({
          platform: platformData.platform,
          success: false,
          error: (error as Error)?.message || String(error),
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    // Log bulk metrics update
    console.log('Bulk social metrics update:', {
      platformCount: platforms.length,
      successCount,
      errorCount,
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: errorCount === 0,
      message: `Updated ${successCount} platforms${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
      results,
      summary: {
        total: platforms.length,
        successful: successCount,
        failed: errorCount,
      },
    })

  } catch (error) {
    console.error('Bulk update social metrics API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid bulk metrics data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to bulk update social metrics' },
      { status: 500 }
    )
  }
}