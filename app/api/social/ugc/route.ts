import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ugcManager } from '@/lib/social-media'
import { z } from 'zod'

const submitUGCSchema = z.object({
  type: z.enum(['review', 'photo', 'video', 'story']),
  content: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional(),
  productId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  hashtags: z.array(z.string().max(50)).optional(),
})

const ugcQuerySchema = z.object({
  type: z.enum(['review', 'photo', 'video', 'story']).optional(),
  productId: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  approved: z.boolean().default(true),
})

const moderateUGCSchema = z.object({
  contentId: z.string(),
  action: z.enum(['approve', 'reject', 'publish', 'unpublish']),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to submit content' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const ugcData = submitUGCSchema.parse(body)

    // Submit user-generated content
    const content = await ugcManager.submitContent({
      userId: session.user.id,
      userName: session.user.name || 'Anonymous',
      userEmail: session.user.email || '',
      type: ugcData.type,
      content: ugcData.content,
      mediaUrl: ugcData.mediaUrl,
      productId: ugcData.productId,
      rating: ugcData.rating,
      hashtags: ugcData.hashtags,
    })

    // Log UGC submission
    console.log('User-generated content submitted:', {
      contentId: content.id,
      type: ugcData.type,
      userId: session.user.id,
      productId: ugcData.productId,
      hasMedia: !!ugcData.mediaUrl,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Content submitted for review',
      content: {
        id: content.id,
        type: content.type,
        content: content.content,
        mediaUrl: content.mediaUrl,
        productId: content.productId,
        rating: content.rating,
        hashtags: content.hashtags,
        isApproved: content.isApproved,
        createdAt: content.createdAt,
      },
    })

  } catch (error) {
    console.error('Submit UGC API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid content data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit content' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      type: searchParams.get('type') as any,
      productId: searchParams.get('productId') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      approved: searchParams.get('approved') !== 'false',
    }

    const validated = ugcQuerySchema.parse(params)

    // Get published user-generated content
    const content = await ugcManager.getPublishedContent({
      type: validated.type,
      productId: validated.productId,
      limit: validated.limit,
    })

    // Format content for API response
    const formattedContent = content.map(item => ({
      id: item.id,
      type: item.type,
      content: item.content,
      mediaUrl: item.mediaUrl,
      productId: item.productId,
      rating: item.rating,
      userName: item.userName,
      hashtags: item.hashtags,
      mentions: item.mentions,
      publishedAt: item.publishedAt,
    }))

    // Log UGC request
    console.log('User-generated content requested:', {
      type: validated.type,
      productId: validated.productId,
      limit: validated.limit,
      resultCount: formattedContent.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      content: formattedContent,
      total: formattedContent.length,
      meta: {
        type: validated.type,
        productId: validated.productId,
        limit: validated.limit,
        approved: validated.approved,
      },
    })

  } catch (error) {
    console.error('Get UGC API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get user-generated content' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can moderate UGC
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const moderationData = moderateUGCSchema.parse(body)

    let success = false
    let message = ''

    switch (moderationData.action) {
      case 'approve':
        success = await ugcManager.approveContent(
          moderationData.contentId,
          session.user.id
        )
        message = 'Content approved successfully'
        break

      case 'publish':
        success = await ugcManager.publishContent(moderationData.contentId)
        message = 'Content published successfully'
        break

      case 'reject':
        // In a real implementation, mark as rejected and optionally delete
        success = true
        message = 'Content rejected'
        break

      case 'unpublish':
        // In a real implementation, unpublish content
        success = true
        message = 'Content unpublished'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid moderation action' },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: `Failed to ${moderationData.action} content` },
        { status: 500 }
      )
    }

    // Log moderation action
    console.log('UGC moderation action:', {
      contentId: moderationData.contentId,
      action: moderationData.action,
      moderatedBy: session.user.id,
      reason: moderationData.reason,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message,
      contentId: moderationData.contentId,
      action: moderationData.action,
      moderatedBy: session.user.id,
    })

  } catch (error) {
    console.error('UGC moderation API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid moderation data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to moderate content' },
      { status: 500 }
    )
  }
}