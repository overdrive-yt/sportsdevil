import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { WishlistService } from '@/lib/services/wishlist.service'
import { z } from 'zod'

const addToWishlistSchema = z.object({
  productId: z.string(),
  notifyWhenAvailable: z.boolean().default(false),
  targetPrice: z.number().positive().optional(),
})

const removeFromWishlistSchema = z.object({
  productId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const productId = searchParams.get('productId')

    if (action === 'check' && productId) {
      // Check if specific product is in wishlist
      const isInWishlist = await WishlistService.isInWishlist(session.user.id, productId)
      return NextResponse.json({
        productId,
        isInWishlist,
      })
    }

    if (action === 'count') {
      // Get wishlist count
      const count = await WishlistService.getWishlistItemCount(session.user.id)
      return NextResponse.json({
        count,
      })
    }

    // Default: Get full wishlist
    const defaultWishlist = await WishlistService.getUserDefaultWishlist(session.user.id)
    
    return NextResponse.json({
      success: true,
      wishlist: defaultWishlist,
      count: defaultWishlist.itemCount,
      userId: session.user.id,
    })

  } catch (error) {
    console.error('Wishlist GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to get wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, notifyWhenAvailable, targetPrice } = addToWishlistSchema.parse(body)

    // Check if product is already in wishlist
    const isAlreadyInWishlist = await WishlistService.isInWishlist(session.user.id, productId)
    
    if (isAlreadyInWishlist) {
      return NextResponse.json(
        { error: 'Product is already in your wishlist' },
        { status: 409 }
      )
    }

    // Add to wishlist with optional notes based on preferences
    let notes = ''
    if (notifyWhenAvailable) notes += 'Notify when available. '
    if (targetPrice) notes += `Target price: £${targetPrice}. `

    const wishlistItem = await WishlistService.addToWishlist(
      session.user.id,
      productId,
      undefined, // Use default wishlist
      notes.trim() || undefined
    )

    // Log wishlist addition for analytics
    console.log('Product added to wishlist:', {
      userId: session.user.id,
      productId,
      notifyWhenAvailable,
      targetPrice,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem,
    })

  } catch (error) {
    console.error('Wishlist POST API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = removeFromWishlistSchema.parse(body)

    // Check if product is in wishlist
    const isInWishlist = await WishlistService.isInWishlist(session.user.id, productId)
    
    if (!isInWishlist) {
      return NextResponse.json(
        { error: 'Product is not in your wishlist' },
        { status: 404 }
      )
    }

    // Remove from wishlist
    await WishlistService.removeFromWishlist(session.user.id, productId)

    // Log wishlist removal for analytics
    console.log('Product removed from wishlist:', {
      userId: session.user.id,
      productId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      productId,
    })

  } catch (error) {
    console.error('Wishlist DELETE API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}

// PATCH endpoint for updating wishlist item preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateSchema = z.object({
      productId: z.string(),
      notifyWhenAvailable: z.boolean().optional(),
      targetPrice: z.number().positive().optional(),
    })
    
    const { productId, notifyWhenAvailable, targetPrice } = updateSchema.parse(body)

    // Check if product is in wishlist
    const isInWishlist = await WishlistService.isInWishlist(session.user.id, productId)
    
    if (!isInWishlist) {
      return NextResponse.json(
        { error: 'Product is not in your wishlist' },
        { status: 404 }
      )
    }

    // In a real implementation, update the wishlist item
    // For now, just simulate the update
    console.log('Wishlist item updated:', {
      userId: session.user.id,
      productId,
      notifyWhenAvailable,
      targetPrice,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Wishlist item updated',
      productId,
      updates: {
        notifyWhenAvailable,
        targetPrice,
      },
    })

  } catch (error) {
    console.error('Wishlist PATCH API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update wishlist item' },
      { status: 500 }
    )
  }
}