import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notification.service'
import { z } from 'zod'

// Order tracking route - GET /api/orders/[id]/track
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const resolvedParams = await context.params
    const orderNumber = resolvedParams.id // This will be the order number
    const email = searchParams.get('email')

    // Allow tracking with email verification for guest users
    // or authenticated users viewing their own orders
    const userEmail = session?.user?.email || email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required or email must be provided' },
        { status: 401 }
      )
    }

    const tracking = await NotificationService.getOrderTracking(orderNumber, userEmail)

    if (!tracking.success) {
      return NextResponse.json(
        { error: tracking.error || 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tracking: tracking.tracking,
    })

  } catch (error: any) {
    console.error('Order tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update order tracking - PATCH /api/orders/[id]/track (Admin only)
const updateTrackingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData = updateTrackingSchema.parse(body)
    const resolvedParams = await context.params
    const orderNumber = resolvedParams.id

    // Find order by order number
    const { prisma } = await import('@/lib/prisma')
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      select: { id: true, status: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status and tracking information
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: updateData.status,
        notes: updateData.notes,
        ...(updateData.status === 'SHIPPED' && {
          shippedAt: new Date(),
        }),
        ...(updateData.status === 'DELIVERED' && {
          deliveredAt: new Date(),
        }),
        updatedAt: new Date(),
      },
    })

    // Send notification if status changed
    if (order.status !== updateData.status) {
      const additionalData = {
        trackingNumber: updateData.trackingNumber,
        carrier: updateData.carrier,
        estimatedDelivery: updateData.estimatedDelivery,
      }

      await NotificationService.processOrderStatusChange(
        order.id,
        updateData.status,
        additionalData
      )
    }

    // Get updated tracking information
    const tracking = await NotificationService.getOrderTracking(orderNumber)

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${updateData.status}`,
      tracking: tracking.success ? tracking.tracking : null,
    })

  } catch (error: any) {
    console.error('Order tracking update error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}