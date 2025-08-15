import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { notificationService } from '@/lib/notifications'
import { z } from 'zod'

// Validation schema for notification requests
const notificationRequestSchema = z.object({
  type: z.enum(['order_confirmation', 'order_shipped', 'order_delivered', 'low_stock', 'season_reminder', 'price_drop', 'back_in_stock']),
  recipient: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    userId: z.string().optional(),
  }),
  data: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduledFor: z.string().transform(str => new Date(str)).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users or system calls
    if (!session?.user && !request.headers.get('x-api-key')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const notification = notificationRequestSchema.parse(body)

    // Validate that at least one contact method is provided
    if (!notification.recipient.email && !notification.recipient.phone) {
      return NextResponse.json(
        { error: 'Either email or phone number must be provided' },
        { status: 400 }
      )
    }

    // Send notification
    const result = await notificationService.sendNotification({
      type: notification.type,
      recipient: notification.recipient,
      data: notification.data,
      priority: notification.priority,
      scheduledFor: notification.scheduledFor,
    })

    // Log the notification attempt
    console.log('Notification sent:', {
      type: notification.type,
      recipient: notification.recipient.email || notification.recipient.phone,
      success: result.success,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: result.success,
      results: result.results,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
    })

  } catch (error) {
    console.error('Notification API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve notification history (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const recipient = searchParams.get('recipient')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // In a real implementation, fetch from database
    // For now, return mock data
    const mockNotifications = [
      {
        id: '1',
        type: 'order_confirmation',
        recipient: { email: 'customer@example.com', name: 'John Smith' },
        status: 'sent',
        timestamp: new Date().toISOString(),
        data: { orderNumber: 'SD-2025-001', total: '89.99' }
      },
      {
        id: '2',
        type: 'order_shipped',
        recipient: { email: 'customer@example.com', phone: '+44789123456' },
        status: 'sent',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        data: { orderNumber: 'SD-2025-001', trackingNumber: 'TRK123456' }
      },
      {
        id: '3',
        type: 'low_stock',
        recipient: { email: 'admin@sportsdevil.co.uk' },
        status: 'sent',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        data: { productName: 'Professional Cricket Bat', currentStock: '2' }
      }
    ]

    // Filter notifications based on query parameters
    let filteredNotifications = mockNotifications
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type)
    }
    if (recipient) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.recipient.email?.includes(recipient) || n.recipient.phone?.includes(recipient)
      )
    }

    // Apply pagination
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit)

    return NextResponse.json({
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      limit,
      offset,
    })

  } catch (error) {
    console.error('Failed to fetch notification history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    )
  }
}