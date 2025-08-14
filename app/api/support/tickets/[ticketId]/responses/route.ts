import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SupportTicketManager } from '@/lib/customer-support'
import { z } from 'zod'

const responseSchema = z.object({
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
  isInternal: z.boolean().default(false),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { ticketId } = await context.params
    const body = await request.json()
    const responseData = responseSchema.parse(body)

    // Get ticket to verify access
    const ticket = await SupportTicketManager.getTicket(ticketId)
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check authorization - customers can only respond to their own tickets
    const isAdmin = session.user.role === 'ADMIN'
    const isCustomer = ticket.customerId === session.user.id
    
    if (!isAdmin && !isCustomer) {
      return NextResponse.json(
        { error: 'Unauthorized to respond to this ticket' },
        { status: 403 }
      )
    }

    // Only admins can create internal responses
    if (responseData.isInternal && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create internal responses' },
        { status: 403 }
      )
    }

    // Add response to ticket
    const response = await SupportTicketManager.addResponse(ticketId, {
      authorId: session.user.id,
      authorName: session.user.name || 'Unknown',
      authorType: isAdmin ? 'agent' : 'customer',
      message: responseData.message,
      attachments: responseData.attachments,
      isInternal: responseData.isInternal,
    })

    // Update ticket status if customer responded
    if (!isAdmin && ticket.status === 'pending-customer') {
      await SupportTicketManager.updateTicketStatus(ticketId, 'in-progress')
    }

    // Log response creation
    console.log('Support ticket response added:', {
      ticketId,
      responseId: response.id,
      authorId: session.user.id,
      authorType: response.authorType,
      isInternal: responseData.isInternal,
      timestamp: new Date().toISOString(),
    })

    // Send notification to relevant parties (in a real implementation)
    // if (!responseData.isInternal) {
    //   if (isAdmin) {
    //     // Notify customer of agent response
    //     await notificationService.sendTicketResponse({
    //       customerEmail: ticket.customerEmail,
    //       customerName: ticket.customerName,
    //       ticketNumber: ticket.ticketNumber,
    //       response: responseData.message
    //     })
    //   } else {
    //     // Notify agents of customer response
    //     await notificationService.sendInternalAlert({
    //       ticketId,
    //       ticketNumber: ticket.ticketNumber,
    //       message: 'Customer responded to ticket'
    //     })
    //   }
    // }

    return NextResponse.json({
      success: true,
      message: 'Response added successfully',
      response: {
        id: response.id,
        authorName: response.authorName,
        authorType: response.authorType,
        message: response.message,
        isInternal: response.isInternal,
        createdAt: response.createdAt,
      },
    })

  } catch (error) {
    console.error('Add ticket response API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid response data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add response' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { ticketId } = await context.params

    // Get ticket with responses
    const ticket = await SupportTicketManager.getTicket(ticketId)
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const isAdmin = session.user.role === 'ADMIN'
    const isCustomer = ticket.customerId === session.user.id
    
    if (!isAdmin && !isCustomer) {
      return NextResponse.json(
        { error: 'Unauthorized to view this ticket' },
        { status: 403 }
      )
    }

    // Filter responses based on user role
    let responses = ticket.responses
    if (!isAdmin) {
      // Customers can't see internal responses
      responses = responses.filter(r => !r.isInternal)
    }

    return NextResponse.json({
      success: true,
      responses: responses.map(r => ({
        id: r.id,
        authorName: r.authorName,
        authorType: r.authorType,
        message: r.message,
        attachments: r.attachments,
        isInternal: r.isInternal,
        createdAt: r.createdAt,
      })),
      total: responses.length,
    })

  } catch (error) {
    console.error('Get ticket responses API error:', error)
    return NextResponse.json(
      { error: 'Failed to get responses' },
      { status: 500 }
    )
  }
}