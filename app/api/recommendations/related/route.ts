import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/recommendations/related?productId=xxx&limit=5
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get the current product to understand its categories and price range
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        productCategories: {
          include: {
            category: true
          }
        }
      }
    })

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Simple recommendation algorithm:
    // 1. Products from the same category
    // 2. Similar price range (±50%)
    // 3. Exclude the current product
    // 4. Prioritize featured products
    // 5. Order by popularity (stub with random for now)

    const priceMin = Number(currentProduct.price) * 0.5
    const priceMax = Number(currentProduct.price) * 1.5
    
    // Get category IDs from the current product
    const currentCategoryIds = currentProduct.productCategories.map(pc => pc.categoryId)

    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { isActive: true },
          { stockQuantity: { gt: 0 } },
          {
            OR: [
              // Products in same categories
              {
                productCategories: {
                  some: {
                    categoryId: {
                      in: currentCategoryIds
                    }
                  }
                }
              },
              // Products in similar price range
              {
                price: {
                  gte: priceMin,
                  lte: priceMax
                }
              }
            ]
          }
        ]
      },
      include: {
        productCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          },
          take: 1, // Just primary category for display
          where: { isPrimary: true }
        },
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Transform the data for the frontend
    const recommendations = relatedProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString(),
      shortDescription: product.shortDescription,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      stockQuantity: product.stockQuantity,
      category: product.productCategories[0]?.category || null,
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt
      })),
      reviewCount: product._count.reviews,
      // Calculate recommendation score for sorting
      recommendationScore: calculateRecommendationScore(product, currentProduct, currentCategoryIds)
    }))

    // Sort by recommendation score
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json({
      success: true,
      data: recommendations,
      meta: {
        currentProductId: productId,
        algorithm: 'category_and_price_similarity',
        totalFound: recommendations.length
      }
    })

  } catch (error) {
    console.error('Error getting related products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

// Simple scoring algorithm for recommendations
function calculateRecommendationScore(product: any, currentProduct: any, currentCategoryIds: string[]): number {
  let score = 0

  // Same category bonus - check if product shares any categories with current product
  const productCategoryIds = product.productCategories?.map((pc: any) => pc.categoryId) || []
  const sharedCategories = productCategoryIds.filter((id: string) => currentCategoryIds.includes(id))
  if (sharedCategories.length > 0) {
    score += 50 * sharedCategories.length // Bonus for each shared category
  }

  // Featured product bonus
  if (product.isFeatured) {
    score += 30
  }

  // New product bonus
  if (product.isNew) {
    score += 20
  }

  // Price similarity bonus (higher score for closer prices)
  const currentPrice = Number(currentProduct.price)
  const productPrice = Number(product.price)
  const priceDiff = Math.abs(currentPrice - productPrice)
  const maxPrice = Math.max(currentPrice, productPrice)
  const priceScore = maxPrice > 0 ? (1 - (priceDiff / maxPrice)) * 40 : 0
  score += priceScore

  // Stock availability bonus
  if (product.stockQuantity > 10) {
    score += 10
  } else if (product.stockQuantity > 0) {
    score += 5
  }

  // Review count bonus (products with more reviews get slight boost)
  score += Math.min(product._count?.reviews || 0, 10)

  return score
}