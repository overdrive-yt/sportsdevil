import { NextRequest, NextResponse } from 'next/server'
import { CricketGuideManager } from '../../../lib/product-features'
import { z } from 'zod'

const guideRequestSchema = z.object({
  category: z.enum(['buying-guide', 'how-to', 'maintenance', 'rules']).optional(),
  productId: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      category: searchParams.get('category') as any,
      productId: searchParams.get('productId') || undefined,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const validated = guideRequestSchema.parse(params)

    let guides = []

    if (validated.search) {
      // Search guides
      guides = await CricketGuideManager.searchGuides(validated.search)
    } else if (validated.productId) {
      // Get guides related to a specific product
      guides = await CricketGuideManager.getRelatedGuides(validated.productId)
    } else if (validated.category) {
      // Get guides by category
      guides = await CricketGuideManager.getGuidesByCategory(validated.category)
    } else {
      // Get all guides
      guides = await CricketGuideManager.getAllGuides()
    }

    // Apply pagination
    const total = guides.length
    const paginatedGuides = guides.slice(validated.offset, validated.offset + validated.limit)

    // Format guides for API response (exclude full content)
    const formattedGuides = paginatedGuides.map(guide => ({
      id: guide.id,
      title: guide.title,
      slug: guide.slug,
      category: guide.category,
      excerpt: guide.content.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
      tags: guide.tags,
      author: guide.author,
      publishedAt: guide.publishedAt,
      updatedAt: guide.updatedAt,
      relatedProductCount: guide.relatedProducts.length,
    }))

    // Log guide request for analytics
    console.log('Guides requested:', {
      category: validated.category,
      productId: validated.productId,
      search: validated.search,
      resultCount: paginatedGuides.length,
      total,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      guides: formattedGuides,
      pagination: {
        total,
        count: paginatedGuides.length,
        limit: validated.limit,
        offset: validated.offset,
        hasMore: validated.offset + validated.limit < total,
      },
      meta: {
        searchQuery: validated.search,
        category: validated.category,
        productId: validated.productId,
      },
    })

  } catch (error) {
    console.error('Guides API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get guides' },
      { status: 500 }
    )
  }
}