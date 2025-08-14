import { NextRequest, NextResponse } from 'next/server'
import { ProductComparison } from '@/lib/product-features'
import { z } from 'zod'

const compareRequestSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productIds } = compareRequestSchema.parse(body)

    // Remove duplicates
    const uniqueProductIds = [...new Set(productIds)]
    
    if (uniqueProductIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 different products are required for comparison' },
        { status: 400 }
      )
    }

    if (uniqueProductIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 products can be compared at once' },
        { status: 400 }
      )
    }

    // Get product comparison
    const comparison = await ProductComparison.compareProducts(uniqueProductIds)
    
    // Format for frontend consumption
    const formattedComparison = ProductComparison.formatComparisonData(comparison)

    // Log comparison request for analytics
    console.log('Product comparison requested:', {
      productIds: uniqueProductIds,
      productCount: uniqueProductIds.length,
      category: comparison.products[0]?.category,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      comparison: formattedComparison,
      meta: {
        productCount: uniqueProductIds.length,
        comparisonFields: comparison.comparisonFields,
        category: comparison.products[0]?.category,
      },
    })

  } catch (error) {
    console.error('Product comparison API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to compare products' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIdsParam = searchParams.get('productIds')
    
    if (!productIdsParam) {
      return NextResponse.json(
        { error: 'productIds parameter is required' },
        { status: 400 }
      )
    }

    // Parse comma-separated product IDs
    const productIds = productIdsParam.split(',').filter(Boolean)
    
    const { productIds: validatedIds } = compareRequestSchema.parse({ productIds })

    // Remove duplicates
    const uniqueProductIds = [...new Set(validatedIds)]
    
    if (uniqueProductIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 different products are required for comparison' },
        { status: 400 }
      )
    }

    if (uniqueProductIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 products can be compared at once' },
        { status: 400 }
      )
    }

    // Get product comparison
    const comparison = await ProductComparison.compareProducts(uniqueProductIds)
    
    // Format for frontend consumption
    const formattedComparison = ProductComparison.formatComparisonData(comparison)

    // Log comparison request for analytics
    console.log('Product comparison requested (GET):', {
      productIds: uniqueProductIds,
      productCount: uniqueProductIds.length,
      category: comparison.products[0]?.category,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      comparison: formattedComparison,
      meta: {
        productCount: uniqueProductIds.length,
        comparisonFields: comparison.comparisonFields,
        category: comparison.products[0]?.category,
      },
    })

  } catch (error) {
    console.error('Product comparison GET API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to compare products' },
      { status: 500 }
    )
  }
}