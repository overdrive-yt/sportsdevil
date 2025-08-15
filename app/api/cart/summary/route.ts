import { NextRequest } from 'next/server'
import { CartService } from '../../../../lib/services/cart.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { requireAuth, checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 200, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const user = await requireAuth(request)
    const summary = await CartService.getCartSummary(user.id)
    
    return createSuccessResponse(summary, 'Cart summary retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}