import { NextRequest } from 'next/server'
import { OrderService } from '../../../lib/services/order.service'
import { createCreatedResponse } from '../../../lib/api/responses'
import { handleApiError } from '../../../lib/api/errors'
import { requireAuth, validateRequestBody } from '../../../lib/api/middleware'
import { orderSchema } from '../../../lib/api/validation'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const data = await validateRequestBody(request, orderSchema)
    
    console.log('📦 Order API: Creating order for user:', user.email)
    console.log('📋 Order API: Request data:', {
      paymentIntentId: data.paymentIntentId,
      cartItemsCount: data.cartItems?.length || 0,
      shippingMethod: data.shippingMethod,
      couponCode: data.couponCode
    })
    
    // Use the new payment-flow order creation method
    const order = await OrderService.createOrderFromPayment(user.id, data)
    
    console.log('✅ Order API: Order created successfully:', order.orderNumber)
    return createCreatedResponse(order, 'Order created successfully')
  } catch (error) {
    console.error('❌ Order API: Error creating order:', error)
    return handleApiError(error)
  }
}