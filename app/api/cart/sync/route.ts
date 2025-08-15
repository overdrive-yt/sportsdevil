import { NextRequest, NextResponse } from 'next/server'
import { CartService } from '../../../../lib/services/cart.service'
import { createSuccessResponse, createCreatedResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { requireAuth, validateRequestBody, checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'

const syncCartSchema = z.object({
  localCartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).max(50), // ENHANCED: Add maximum quantity validation
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
  })).refine(items => {
    // ADDED: Validate no duplicate products in the request
    const productKeys = items.map(item => 
      `${item.productId}-${item.selectedColor || 'none'}-${item.selectedSize || 'none'}`
    )
    const uniqueKeys = new Set(productKeys)
    return uniqueKeys.size === productKeys.length
  }, {
    message: "Duplicate products detected in cart items"
  }),
  syncDirection: z.enum(['local_to_db', 'db_to_local', 'merge']).default('merge'),
})

// Helper function to optionally get authenticated user (doesn't throw if unauthenticated)
async function getOptionalAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return null
    }
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    }
  } catch (error) {
    console.log('📤 Cart sync: No authenticated session found')
    return null
  }
}

// Synchronize cart between local storage (Zustand) and database
export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 10, 60000)) { // 10 requests per minute
      return handleApiError(new Error('Too many sync requests'))
    }

    const user = await getOptionalAuth(request)
    
    // If no authenticated user, return empty cart sync response
    if (!user) {
      console.log('📤 Cart sync POST: No authenticated user, returning empty sync')
      return createSuccessResponse({
        success: true,
        items: [],
        finalCart: [], // Add finalCart property expected by client
        message: 'No user session - local cart preserved'
      }, 'Cart sync skipped - not authenticated')
    }

    const data = await validateRequestBody(request, syncCartSchema)
    
    let result

    switch (data.syncDirection) {
      case 'local_to_db':
        // Sync local cart to database (replace database cart)
        result = await CartService.bulkSyncToDatabase(user.id, data.localCartItems)
        // Ensure finalCart property exists
        if (result && !('finalCart' in result)) {
          (result as any).finalCart = result.items || []
        }
        break
        
      case 'db_to_local':
        // Get database cart for client to update local storage
        const dbItems = await CartService.getCartForZustand(user.id)
        result = {
          success: true,
          items: dbItems,
          finalCart: dbItems, // Add finalCart property expected by client
          syncDirection: 'db_to_local'
        }
        break
        
      case 'merge':
      default:
        // Intelligent merge of local and database carts
        result = await CartService.syncLocalCartWithDatabase(user.id, data.localCartItems)
        // Ensure finalCart property exists
        if (result && !result.finalCart) {
          result.finalCart = (result as any).items || []
        }
        break
    }
    
    // Create response with finalCart at root level for client compatibility
    const responseData = {
      success: true,
      data: result,
      message: 'Cart synchronized successfully',
      // Add finalCart at root level for client compatibility
      finalCart: (result as any)?.finalCart || (result as any)?.items || []
    }
    
    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

// Get current database cart state for synchronization
export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 30, 60000)) { // 30 requests per minute
      return handleApiError(new Error('Too many requests'))
    }

    const user = await getOptionalAuth(request)
    
    // If no authenticated user, return empty cart
    if (!user) {
      console.log('📤 Cart sync GET: No authenticated user, returning empty cart')
      return createSuccessResponse({
        items: [],
        finalCart: [], // Add finalCart property expected by client
        timestamp: new Date().toISOString(),
        userId: null,
        message: 'No user session - empty cart returned'
      }, 'Cart sync skipped - not authenticated')
    }

    const cartItems = await CartService.getCartForZustand(user.id)
    
    return createSuccessResponse({
      items: cartItems,
      finalCart: cartItems, // Add finalCart property expected by client
      timestamp: new Date().toISOString(),
      userId: user.id,
    }, 'Database cart retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}