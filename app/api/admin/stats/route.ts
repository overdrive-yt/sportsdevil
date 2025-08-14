import { NextRequest } from 'next/server'
import { OrderService } from '@/lib/services/order.service'
import { createSuccessResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { requireAdmin, checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 50, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    await requireAdmin(request)
    
    const [orderStats, recentOrders] = await Promise.all([
      OrderService.getOrderStats(),
      OrderService.getRecentOrders(10),
    ])
    
    const stats = {
      orders: orderStats,
      recentOrders,
    }
    
    return createSuccessResponse(stats, 'Admin statistics retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}