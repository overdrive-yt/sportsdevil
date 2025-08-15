import { NextRequest } from 'next/server'
import { CartService } from '../../lib/services/cart.service'
import { createSuccessResponse, createNoContentResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'
import { requireAuth, validateRequestBody } from '../../lib/api/middleware'
import { updateCartItemSchema } from '../../lib/api/validation'

interface RouteContext {
  params: Promise<{
    itemId: string
  }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const data = await validateRequestBody(request, updateCartItemSchema)
    const resolvedParams = await context.params
    
    const updatedItem = await CartService.updateCartItem(resolvedParams.itemId, data)
    
    return createSuccessResponse(updatedItem, 'Cart item updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth(request)
    const resolvedParams = await context.params
    
    await CartService.removeCartItem(resolvedParams.itemId, user.id)
    
    return createNoContentResponse('Cart item removed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}