import { NextRequest, NextResponse } from 'next/server'
import { 
  RecommendationEngine,
  type RecommendationContext,
  type RecommendationType
} from '@/lib/ai/recommendations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') as RecommendationType
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const userId = searchParams.get('userId') || undefined
    const productId = searchParams.get('productId') || undefined
    const categoryId = searchParams.get('categoryId') || undefined
    
    // Parse arrays from query parameters
    const previousPurchases = searchParams.get('previousPurchases')?.split(',') || undefined
    const cartItems = searchParams.get('cartItems')?.split(',') || undefined
    const viewedProducts = searchParams.get('viewedProducts')?.split(',') || undefined
    const searchTerms = searchParams.get('searchTerms')?.split(',') || undefined

    // Parse price range
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const priceRange = priceMin && priceMax ? {
      min: parseFloat(priceMin),
      max: parseFloat(priceMax)
    } : undefined

    // Parse session data
    const timeSpent = searchParams.get('timeSpent')
    const pagesVisited = searchParams.get('pagesVisited')
    const interactionScore = searchParams.get('interactionScore')
    const sessionData = timeSpent || pagesVisited || interactionScore ? {
      timeSpent: parseInt(timeSpent || '0', 10),
      pagesVisited: parseInt(pagesVisited || '0', 10),
      interactionScore: parseFloat(interactionScore || '0')
    } : undefined

    if (!type) {
      return NextResponse.json(
        { error: 'Recommendation type is required' },
        { status: 400 }
      )
    }

    const context: RecommendationContext = {
      userId,
      productId,
      categoryId,
      priceRange,
      previousPurchases,
      cartItems,
      viewedProducts,
      searchTerms,
      sessionData
    }

    const recommendations = await RecommendationEngine.getRecommendations(
      type,
      context,
      limit
    )

    // Add metadata about the request
    const response = {
      ...recommendations,
      meta: {
        requestedType: type,
        requestedLimit: limit,
        actualCount: recommendations.products.length,
        context: {
          hasUserId: !!userId,
          hasProductId: !!productId,
          hasCategoryId: !!categoryId,
          hasPreviousPurchases: !!previousPurchases?.length,
          hasCartItems: !!cartItems?.length,
          hasViewedProducts: !!viewedProducts?.length,
          hasSearchTerms: !!searchTerms?.length,
          hasPriceRange: !!priceRange,
          hasSessionData: !!sessionData
        },
        generatedAt: new Date().toISOString(),
        ttl: recommendations.refreshRate * 60 * 1000 // Convert minutes to milliseconds
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      types,
      context,
      limits = {}
    }: {
      types: RecommendationType[]
      context: RecommendationContext
      limits?: Record<string, number>
    } = await request.json()

    if (!types || !Array.isArray(types) || types.length === 0) {
      return NextResponse.json(
        { error: 'At least one recommendation type is required' },
        { status: 400 }
      )
    }

    if (types.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 recommendation types allowed per request' },
        { status: 400 }
      )
    }

    // Generate multiple recommendation sets in parallel
    const recommendations = await Promise.all(
      types.map(async (type) => {
        const limit = limits[type] || 12
        const result = await RecommendationEngine.getRecommendations(
          type,
          context,
          limit
        )
        return {
          type,
          ...result
        }
      })
    )

    const response = {
      recommendations,
      meta: {
        requestedTypes: types,
        totalSets: recommendations.length,
        totalProducts: recommendations.reduce((sum, rec) => sum + rec.products.length, 0),
        context: {
          hasUserId: !!context.userId,
          hasProductId: !!context.productId,
          hasCategoryId: !!context.categoryId,
          hasPreviousPurchases: !!context.previousPurchases?.length,
          hasCartItems: !!context.cartItems?.length,
          hasViewedProducts: !!context.viewedProducts?.length,
          hasSearchTerms: !!context.searchTerms?.length,
          hasPriceRange: !!context.priceRange,
          hasSessionData: !!context.sessionData
        },
        generatedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Batch recommendations API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate batch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}