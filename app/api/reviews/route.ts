import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const reviewCreateSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  images: z.array(z.string()).optional(),
})

// GET /api/reviews?productId=xxx&page=1&limit=10&sort=newest
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const sort = searchParams.get('sort') || 'newest'
    const rating = searchParams.get('rating')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      productId,
      isApproved: true,
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Build orderBy clause
    let orderBy: any
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'highest':
        orderBy = { rating: 'desc' }
        break
      case 'lowest':
        orderBy = { rating: 'asc' }
        break
      case 'helpful':
        orderBy = { helpful: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where })
    ])

    // Calculate review statistics
    const stats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true,
      },
      _count: {
        rating: true,
      }
    })

    const reviewStats = {
      totalReviews: total,
      averageRating: 0,
      ratingBreakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }
    }

    let totalRating = 0
    stats.forEach(stat => {
      reviewStats.ratingBreakdown[stat.rating as keyof typeof reviewStats.ratingBreakdown] = stat._count.rating
      totalRating += stat.rating * stat._count.rating
    })

    if (total > 0) {
      reviewStats.averageRating = Math.round((totalRating / total) * 10) / 10
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: reviews.map(review => ({
        ...review,
        images: review.images ? JSON.parse(review.images) : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: reviewStats,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = reviewCreateSchema.parse(body)

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        userId: validatedData.userId,
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Check if user has purchased this product (for verified purchase badge)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: validatedData.productId,
        order: {
          userId: validatedData.userId,
          status: 'DELIVERED',
        }
      }
    })

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        images: validatedData.images ? JSON.stringify(validatedData.images) : null,
        verifiedPurchase: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...review,
        images: review.images ? JSON.parse(review.images) : [],
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}