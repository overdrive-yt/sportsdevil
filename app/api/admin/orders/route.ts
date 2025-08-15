import { NextRequest } from 'next/server'
import { OrderService } from '../../../../lib/services/order.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { requireAdmin, checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    await requireAdmin(request)
    
    const searchParams = new URL(request.url).searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status') || undefined
    const userId = searchParams.get('userId') || undefined
    
    const result = await OrderService.getAllOrders(
      page,
      Math.min(limit, 100),
      status,
      userId
    )
    
    return createSuccessResponse(result.orders, 'Orders retrieved successfully', 200, result.pagination)
  } catch (error) {
    return handleApiError(error)
  }
}