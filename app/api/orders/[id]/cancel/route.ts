import { NextRequest } from 'next/server'
import { OrderService } from '../../../../../lib/services/order.service'
import { createSuccessResponse } from '../../../../../lib/api/responses'
import { handleApiError } from '../../../../../lib/api/errors'
import { requireAuth, validateRequestBody } from '../../../../../lib/api/middleware'
import { z } from 'zod'

const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth(request)
    const { reason } = await validateRequestBody(request, cancelOrderSchema)
    const { id } = await context.params
    
    const order = await OrderService.cancelOrder(id, user.id, reason)
    
    return createSuccessResponse(order, 'Order cancelled successfully')
  } catch (error) {
    return handleApiError(error)
  }
}