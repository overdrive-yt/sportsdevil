import { NextRequest } from 'next/server'
import { CartService } from '../lib/services/cart.service'
import { createSuccessResponse, createCreatedResponse, createNoContentResponse } from '../lib/api/responses'
import { handleApiError } from '../lib/api/errors'
import { requireAuth, validateRequestBody, checkRateLimit, getRateLimitIdentifier } from '../lib/api/middleware'
import { addToCartSchema } from '../lib/api/validation'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const user = await requireAuth(request)
    const cartItems = await CartService.getCartItems(user.id)
    
    return createSuccessResponse(cartItems, 'Cart items retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const data = await validateRequestBody(request, addToCartSchema)
    
    const cartItem = await CartService.addToCart(user.id, data)
    
    return createCreatedResponse(cartItem, 'Item added to cart successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const result = await CartService.clearCart(user.id)
    
    return createNoContentResponse(`Cleared ${result.deletedCount} items from cart`)
  } catch (error) {
    return handleApiError(error)
  }
}