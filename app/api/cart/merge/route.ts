import { NextRequest } from 'next/server'
import { CartService } from '../../../../lib/services/cart.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { requireAuth, validateRequestBody } from '../../../../lib/api/middleware'
import { z } from 'zod'

const mergeCartSchema = z.object({
  guestCartItems: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    selectedColor: z.string().optional(),
    selectedSize: z.string().optional(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { guestCartItems } = await validateRequestBody(request, mergeCartSchema)
    
    const result = await CartService.mergeGuestCartWithUserCart(user.id, guestCartItems)
    
    return createSuccessResponse(result, `Merged ${result.mergedCount} items from guest cart`)
  } catch (error) {
    return handleApiError(error)
  }
}