import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { reviewManager } from '../../../../lib/social-media'
import { z } from 'zod'

const submitReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(2000),
  images: z.array(z.string().url()).optional(),
})

const reviewQuerySchema = z.object({
  productId: z.string(),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['date', 'rating', 'helpful']).default('date'),
})

const helpfulVoteSchema = z.object({
  reviewId: z.string(),
  helpful: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to submit reviews' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const reviewData = submitReviewSchema.parse(body)

    // Check if user has already reviewed this product
    // In a real implementation, check database for existing review
    // const existingReview = await prisma.productReview.findFirst({
    //   where: {
    //     productId: reviewData.productId,
    //     userId: session.user.id
    //   }
    // })
    // if (existingReview) {
    //   return NextResponse.json(
    //     { error: 'You have already reviewed this product' },
    //     { status: 409 }
    //   )
    // }

    // Check if user has purchased this product (for verified reviews)
    // In a real implementation, check order history
    const hasOrderHistory = false // await checkOrderHistory(session.user.id, reviewData.productId)

    // Submit review
    const review = await reviewManager.submitReview({
      productId: reviewData.productId,
      userId: session.user.id,
      userName: session.user.name || 'Anonymous',
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      images: reviewData.images,
      verified: hasOrderHistory,
    })

    // Log review submission
    console.log('Product review submitted:', {
      reviewId: review.id,
      productId: reviewData.productId,
      userId: session.user.id,
      rating: reviewData.rating,
      verified: hasOrderHistory,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: hasOrderHistory 
        ? 'Review submitted and approved (verified purchase)'
        : 'Review submitted for approval',
      review: {
        id: review.id,
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        verified: review.verified,
        isApproved: review.isApproved,
        createdAt: review.createdAt,
      },
    })

  } catch (error) {
    console.error('Submit review API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      productId: searchParams.get('productId'),
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'date',
    }

    if (!params.productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const validated = reviewQuerySchema.parse(params)

    // Get product reviews
    const { reviews, total, averageRating } = await reviewManager.getProductReviews(
      validated.productId,
      {
        limit: validated.limit,
        offset: validated.offset,
        sortBy: validated.sortBy,
      }
    )

    // Format reviews for API response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      content: review.content,
      images: review.images,
      verified: review.verified,
      helpful: review.helpful,
      notHelpful: review.notHelpful,
      createdAt: review.createdAt,
    }))

    // Calculate rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    // Log reviews request
    console.log('Product reviews requested:', {
      productId: validated.productId,
      limit: validated.limit,
      offset: validated.offset,
      sortBy: validated.sortBy,
      resultCount: formattedReviews.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        total,
        count: formattedReviews.length,
        limit: validated.limit,
        offset: validated.offset,
        hasMore: validated.offset + validated.limit < total,
      },
      statistics: {
        averageRating,
        totalReviews: total,
        ratingDistribution,
      },
      meta: {
        productId: validated.productId,
        sortBy: validated.sortBy,
      },
    })

  } catch (error) {
    console.error('Get reviews API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'helpful') {
      return await handleHelpfulVote(request, session)
    } else if (action === 'approve') {
      return await handleApproveReview(request, session)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use helpful or approve' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Review PATCH API error:', error)
    return NextResponse.json(
      { error: 'Review API error' },
      { status: 500 }
    )
  }
}

async function handleHelpfulVote(request: NextRequest, session: any) {
  try {
    const body = await request.json()
    const voteData = helpfulVoteSchema.parse(body)

    // Mark review as helpful/not helpful
    const success = await reviewManager.markReviewHelpful(
      voteData.reviewId,
      voteData.helpful
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to record helpful vote' },
        { status: 500 }
      )
    }

    // Log helpful vote
    console.log('Review helpful vote:', {
      reviewId: voteData.reviewId,
      helpful: voteData.helpful,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Review marked as ${voteData.helpful ? 'helpful' : 'not helpful'}`,
      reviewId: voteData.reviewId,
      helpful: voteData.helpful,
    })

  } catch (error) {
    console.error('Helpful vote error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to record helpful vote' },
      { status: 500 }
    )
  }
}

async function handleApproveReview(request: NextRequest, session: any) {
  try {
    // Only admin can approve reviews
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { reviewId } = z.object({ reviewId: z.string() }).parse(body)

    // Approve review
    const success = await reviewManager.approveReview(reviewId, session.user.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to approve review' },
        { status: 500 }
      )
    }

    // Log review approval
    console.log('Review approved:', {
      reviewId,
      approvedBy: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Review approved successfully',
      reviewId,
      approvedBy: session.user.id,
    })

  } catch (error) {
    console.error('Approve review error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid approval data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to approve review' },
      { status: 500 }
    )
  }
}