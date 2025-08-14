import { NextRequest } from 'next/server'
import { UserService } from '@/lib/services/user.service'
import { createSuccessResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { requireAuth, checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const user = await requireAuth(request)
    const { id } = await context.params
    const order = await UserService.getUserOrder(user.id, id)
    
    return createSuccessResponse(order, 'Order details retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}