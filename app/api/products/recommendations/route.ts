import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { ProductRecommendationEngine } from '@/lib/product-features'
import { z } from 'zod'

const recommendationRequestSchema = z.object({
  userId: z.string().optional(),
  productId: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['collaborative', 'content-based', 'category', 'trending', 'mixed']).default('mixed'),
  limit: z.number().min(1).max(20).default(6),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      userId: searchParams.get('userId') || undefined,
      productId: searchParams.get('productId') || undefined,
      category: searchParams.get('category') || undefined,
      type: (searchParams.get('type') as any) || 'mixed',
      limit: parseInt(searchParams.get('limit') || '6'),
    }

    const validated = recommendationRequestSchema.parse(params)

    // Get session to determine user context
    const session = await getServerSession(authOptions)
    const userId = validated.userId || session?.user?.id

    // Get recommendations
    const recommendations = await ProductRecommendationEngine.getRecommendations({
      ...validated,
      userId,
    })

    // Log recommendation request for analytics
    console.log('Recommendation request:', {
      userId,
      productId: validated.productId,
      category: validated.category,
      type: validated.type,
      resultCount: recommendations.reduce((sum, rec) => sum + rec.products.length, 0),
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      recommendations,
      meta: {
        userId,
        requestParams: validated,
        totalProducts: recommendations.reduce((sum, rec) => sum + rec.products.length, 0),
      },
    })

  } catch (error) {
    console.error('Recommendations API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both authenticated users and anonymous users with session tracking
    const body = await request.json()
    const validated = recommendationRequestSchema.parse(body)

    const userId = validated.userId || session?.user?.id

    const recommendations = await ProductRecommendationEngine.getRecommendations({
      ...validated,
      userId,
    })

    // Track recommendation interaction for improvement
    console.log('Recommendation interaction:', {
      userId,
      type: validated.type,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      recommendations,
      meta: {
        userId,
        requestParams: validated,
        totalProducts: recommendations.reduce((sum, rec) => sum + rec.products.length, 0),
      },
    })

  } catch (error) {
    console.error('Recommendations POST API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}