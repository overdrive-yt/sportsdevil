import { NextRequest } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { createSuccessResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { requireAuth, checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const user = await requireAuth(request)
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    
    const result = await UserService.getUserOrders(user.id, page, Math.min(limit, 50))
    
    return createSuccessResponse(result.orders, 'User orders retrieved successfully', 200, result.pagination)
  } catch (error) {
    return handleApiError(error)
  }
}