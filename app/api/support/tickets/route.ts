import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { supportTicketManager, SupportTicketManager } from '../../../../lib/customer-support'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  category: z.enum(['general', 'order', 'product', 'technical', 'complaint', 'return']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(2).max(100).optional(),
  customerPhone: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in-progress', 'pending-customer', 'resolved', 'closed']).optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ticketData = createTicketSchema.parse(body)

    // Get session info if available
    const session = await getServerSession(authOptions)
    
    // Use session data if available, otherwise use provided data
    const customerEmail = ticketData.customerEmail || session?.user?.email
    const customerName = ticketData.customerName || session?.user?.name
    const customerId = session?.user?.id

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Customer email and name are required' },
        { status: 400 }
      )
    }

    // Create support ticket
    const ticket = await SupportTicketManager.createTicket({
      customerEmail,
      customerName,
      customerPhone: ticketData.customerPhone,
      customerId,
      subject: ticketData.subject,
      message: ticketData.message,
      category: ticketData.category,
      priority: ticketData.priority,
      attachments: ticketData.attachments,
    })

    // Log ticket creation
    console.log('Support ticket created:', {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      customerId,
      category: ticket.category,
      priority: ticket.priority,
      timestamp: new Date().toISOString(),
    })

    // Send confirmation email (in a real implementation)
    // await notificationService.sendTicketConfirmation({
    //   customerEmail,
    //   customerName,
    //   ticketNumber: ticket.ticketNumber,
    //   subject: ticket.subject
    // })

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    })

  } catch (error) {
    console.error('Create ticket API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid ticket data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const ticketId = searchParams.get('ticketId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // If requesting specific ticket
    if (ticketId) {
      const ticket = await SupportTicketManager.getTicket(ticketId)
      
      if (!ticket) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }

      // Check authorization - users can only see their own tickets unless admin
      if (session?.user?.role !== 'ADMIN' && ticket.customerId !== session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized to view this ticket' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        ticket,
      })
    }

    // Admin can see all tickets, users can only see their own
    let targetCustomerId = customerId
    if (session?.user?.role !== 'ADMIN') {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      targetCustomerId = session.user.id
    }

    // Get tickets based on filters
    let tickets: any[] = []
    if (targetCustomerId) {
      tickets = await SupportTicketManager.getCustomerTickets(targetCustomerId)
    } else {
      // Admin getting all tickets - in real implementation, query database
      tickets = []
    }

    // Apply filters
    if (status) {
      tickets = tickets.filter(t => t.status === status)
    }
    if (category) {
      tickets = tickets.filter(t => t.category === category)
    }

    // Apply pagination
    const total = tickets.length
    const paginatedTickets = tickets.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      tickets: paginatedTickets,
      pagination: {
        total,
        count: paginatedTickets.length,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error) {
    console.error('Get tickets API error:', error)
    return NextResponse.json(
      { error: 'Failed to get tickets' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admin can update tickets
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = updateTicketSchema.parse(body)

    // Update ticket
    const success = await SupportTicketManager.updateTicketStatus(
      ticketId,
      updates.status || 'open',
      updates.assignedTo
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update ticket' },
        { status: 500 }
      )
    }

    // Log ticket update
    console.log('Support ticket updated:', {
      ticketId,
      updates,
      updatedBy: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticketId,
      updates,
    })

  } catch (error) {
    console.error('Update ticket API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}