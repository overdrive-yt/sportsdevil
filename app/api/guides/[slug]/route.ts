import { NextRequest, NextResponse } from 'next/server'
import { CricketGuideManager } from '@/lib/product-features'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json(
        { error: 'Guide slug is required' },
        { status: 400 }
      )
    }

    // Get the guide
    const guide = await CricketGuideManager.getGuide(slug)

    if (!guide) {
      return NextResponse.json(
        { error: 'Guide not found' },
        { status: 404 }
      )
    }

    // Log guide view for analytics
    console.log('Guide viewed:', {
      slug,
      guideId: guide.id,
      category: guide.category,
      timestamp: new Date().toISOString(),
    })

    // Get related guides (same category, excluding current guide)
    const relatedGuides = (await CricketGuideManager.getGuidesByCategory(guide.category))
      .filter(g => g.id !== guide.id)
      .slice(0, 3)
      .map(g => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        category: g.category,
        excerpt: g.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
        publishedAt: g.publishedAt,
        author: g.author,
      }))

    return NextResponse.json({
      success: true,
      guide: {
        ...guide,
        // Add reading time estimation (approximate)
        readingTime: Math.ceil(guide.content.replace(/<[^>]*>/g, '').split(' ').length / 200),
      },
      relatedGuides,
      meta: {
        slug,
        category: guide.category,
        relatedProductCount: guide.relatedProducts.length,
      },
    })

  } catch (error) {
    console.error('Guide detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to get guide' },
      { status: 500 }
    )
  }
}