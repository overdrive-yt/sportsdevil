import { NextRequest, NextResponse } from 'next/server'
import { FAQManager } from '@/lib/customer-support'
import { z } from 'zod'

const faqRequestSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  popular: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      popular: searchParams.get('popular') === 'true',
    }

    const validated = faqRequestSchema.parse(params)

    let faqs = []

    if (validated.popular) {
      // Get popular FAQs
      faqs = await FAQManager.getPopularFAQs(validated.limit)
    } else if (validated.search) {
      // Search FAQs
      faqs = await FAQManager.searchFAQs(validated.search)
    } else if (validated.category) {
      // Get FAQs by category
      faqs = await FAQManager.getFAQsByCategory(validated.category)
    } else {
      // Get all FAQs
      faqs = await FAQManager.getAllFAQs()
    }

    // Apply limit if not already applied
    if (!validated.popular && faqs.length > validated.limit) {
      faqs = faqs.slice(0, validated.limit)
    }

    // Log FAQ request for analytics
    console.log('FAQ requested:', {
      search: validated.search,
      category: validated.category,
      popular: validated.popular,
      resultCount: faqs.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      faqs: faqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        tags: faq.tags,
        popularity: faq.popularity,
        updatedAt: faq.updatedAt,
      })),
      total: faqs.length,
      meta: {
        search: validated.search,
        category: validated.category,
        popular: validated.popular,
        limit: validated.limit,
      },
    })

  } catch (error) {
    console.error('FAQ API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get FAQs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = z.object({ message: z.string() }).parse(body)

    // Get relevant FAQs based on message content
    const relevantFAQs = await FAQManager.getRelevantFAQs(message)

    // Log FAQ suggestion for analytics
    console.log('FAQ suggestions requested:', {
      messageLength: message.length,
      suggestionsCount: relevantFAQs.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'FAQ suggestions based on your message',
      suggestions: relevantFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        relevanceScore: Math.round(Math.random() * 100), // In real implementation, calculate actual relevance
      })),
      total: relevantFAQs.length,
    })

  } catch (error) {
    console.error('FAQ suggestions API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get FAQ suggestions' },
      { status: 500 }
    )
  }
}