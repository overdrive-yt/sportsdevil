import { NextRequest, NextResponse } from 'next/server'
import { instagramManager } from '@/lib/social-media'
import { z } from 'zod'

const instagramRequestSchema = z.object({
  limit: z.number().min(1).max(25).default(12),
  refresh: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      limit: parseInt(searchParams.get('limit') || '12'),
      refresh: searchParams.get('refresh') === 'true',
    }

    const validated = instagramRequestSchema.parse(params)

    // Refresh token if requested and configured
    if (validated.refresh) {
      const refreshed = await instagramManager.refreshAccessToken()
      if (refreshed) {
        console.log('Instagram access token refreshed successfully')
      }
    }

    // Get Instagram feed
    const posts = await instagramManager.getInstagramFeed(validated.limit)

    // Format posts for API response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      caption: post.caption,
      mediaUrl: post.media_url,
      mediaType: post.media_type,
      permalink: post.permalink,
      timestamp: post.timestamp,
      username: post.username,
      likeCount: post.like_count,
      commentsCount: post.comments_count,
      // Extract hashtags from caption
      hashtags: post.caption 
        ? Array.from(post.caption.matchAll(/#(\w+)/g)).map(match => match[1])
        : [],
    }))

    // Log Instagram feed request
    console.log('Instagram feed requested:', {
      limit: validated.limit,
      postCount: formattedPosts.length,
      refresh: validated.refresh,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      posts: formattedPosts,
      total: formattedPosts.length,
      meta: {
        limit: validated.limit,
        refreshed: validated.refresh,
        lastUpdated: new Date().toISOString(),
        account: '@sportsdevil1',
      },
    })

  } catch (error) {
    console.error('Instagram API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get Instagram feed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'insights') {
      return await handleGetInsights(request)
    } else if (action === 'refresh-token') {
      return await handleRefreshToken(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use insights or refresh-token' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Instagram POST API error:', error)
    return NextResponse.json(
      { error: 'Instagram API error' },
      { status: 500 }
    )
  }
}

async function handleGetInsights(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = z.object({ postId: z.string() }).parse(body)

    // Get post insights
    const insights = await instagramManager.getPostInsights(postId)

    if (!insights) {
      return NextResponse.json(
        { error: 'Unable to get post insights' },
        { status: 404 }
      )
    }

    // Log insights request
    console.log('Instagram insights requested:', {
      postId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      postId,
      insights,
    })

  } catch (error) {
    console.error('Instagram insights error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get post insights' },
      { status: 500 }
    )
  }
}

async function handleRefreshToken(request: NextRequest) {
  try {
    // Refresh Instagram access token
    const refreshed = await instagramManager.refreshAccessToken()

    if (refreshed) {
      console.log('Instagram token refresh successful')
      
      return NextResponse.json({
        success: true,
        message: 'Instagram access token refreshed successfully',
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to refresh Instagram access token' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Instagram token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}