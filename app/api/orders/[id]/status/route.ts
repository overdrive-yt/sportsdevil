import { NextRequest } from 'next/server'
import { OrderService } from '../../../../../lib/services/order.service'
import { createSuccessResponse } from '../../../../../lib/api/responses'
import { handleApiError } from '../../../../../lib/api/errors'
import { requireAdmin, validateRequestBody } from '../../../../../lib/api/middleware'
import { orderStatusUpdateSchema } from '../../../../../lib/api/validation'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    await requireAdmin(request)
    
    const data = await validateRequestBody(request, orderStatusUpdateSchema)
    const { id } = await context.params
    const order = await OrderService.updateOrderStatus(id, data)
    
    return createSuccessResponse(order, 'Order status updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}