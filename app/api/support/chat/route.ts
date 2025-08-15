import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { LiveChatManager } from '../../../../lib/customer-support'
import { z } from 'zod'

const createChatSchema = z.object({
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: z.string().email().optional(),
})

const sendMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z.array(z.string()).optional(),
})

const endChatSchema = z.object({
  sessionId: z.string(),
  satisfaction: z.object({
    rating: z.number().min(1).max(5),
    feedback: z.string().max(500).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'create') {
      return await handleCreateChat(request)
    } else if (action === 'message') {
      return await handleSendMessage(request)
    } else if (action === 'end') {
      return await handleEndChat(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use create, message, or end' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Chat API error' },
      { status: 500 }
    )
  }
}

async function handleCreateChat(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const chatData = createChatSchema.parse(body)

    // Use session data if available
    const customerData = {
      customerId: session?.user?.id,
      customerName: chatData.customerName || session?.user?.name || undefined,
      customerEmail: chatData.customerEmail || session?.user?.email,
    }

    // Create chat session
    const chatSession = await LiveChatManager.createChatSession(customerData)

    // Log chat creation
    console.log('Live chat session created:', {
      sessionId: chatSession.id,
      customerId: customerData.customerId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Chat session created',
      session: {
        id: chatSession.id,
        status: chatSession.status,
        startedAt: chatSession.startedAt,
        customerName: chatSession.customerName,
      },
    })

  } catch (error) {
    console.error('Create chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid chat data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}

async function handleSendMessage(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const messageData = sendMessageSchema.parse(body)

    // Get chat session to verify access
    const chatSession = await LiveChatManager.getChatSession(messageData.sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const isAdmin = session?.user?.role === 'ADMIN'
    const isCustomer = chatSession.customerId === session?.user?.id
    const isAgent = isAdmin || (chatSession.agentId === session?.user?.id)
    
    if (!isCustomer && !isAgent) {
      return NextResponse.json(
        { error: 'Unauthorized to send message in this chat' },
        { status: 403 }
      )
    }

    // Add message to chat
    const message = await LiveChatManager.addMessage(messageData.sessionId, {
      authorId: session?.user?.id || 'anonymous',
      authorName: session?.user?.name || chatSession.customerName || 'Customer',
      authorType: isAgent ? 'agent' : 'customer',
      message: messageData.message,
      messageType: messageData.messageType,
      attachments: messageData.attachments,
    })

    // Log message
    console.log('Chat message sent:', {
      sessionId: messageData.sessionId,
      messageId: message.id,
      authorId: session?.user?.id,
      authorType: message.authorType,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent',
      chatMessage: {
        id: message.id,
        authorName: message.authorName,
        authorType: message.authorType,
        message: message.message,
        messageType: message.messageType,
        timestamp: message.timestamp,
      },
    })

  } catch (error) {
    console.error('Send message error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

async function handleEndChat(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const endData = endChatSchema.parse(body)

    // Get chat session to verify access
    const chatSession = await LiveChatManager.getChatSession(endData.sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Check authorization - customers and assigned agents can end chat
    const isAdmin = session?.user?.role === 'ADMIN'
    const isCustomer = chatSession.customerId === session?.user?.id
    const isAgent = isAdmin || (chatSession.agentId === session?.user?.id)
    
    if (!isCustomer && !isAgent) {
      return NextResponse.json(
        { error: 'Unauthorized to end this chat' },
        { status: 403 }
      )
    }

    // End chat session
    const success = await LiveChatManager.endChatSession(
      endData.sessionId,
      endData.satisfaction
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to end chat session' },
        { status: 500 }
      )
    }

    // Log chat end
    console.log('Chat session ended:', {
      sessionId: endData.sessionId,
      endedBy: session?.user?.id,
      satisfaction: endData.satisfaction,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Chat session ended',
      sessionId: endData.sessionId,
      satisfaction: endData.satisfaction,
    })

  } catch (error) {
    console.error('End chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid end chat data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to end chat session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get chat session
    const chatSession = await LiveChatManager.getChatSession(sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const isAdmin = session?.user?.role === 'ADMIN'
    const isCustomer = chatSession.customerId === session?.user?.id
    const isAgent = isAdmin || (chatSession.agentId === session?.user?.id)
    
    if (!isCustomer && !isAgent) {
      return NextResponse.json(
        { error: 'Unauthorized to view this chat' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: chatSession.id,
        customerName: chatSession.customerName,
        agentName: chatSession.agentName,
        status: chatSession.status,
        startedAt: chatSession.startedAt,
        endedAt: chatSession.endedAt,
        messages: chatSession.messages.map(m => ({
          id: m.id,
          authorName: m.authorName,
          authorType: m.authorType,
          message: m.message,
          messageType: m.messageType,
          timestamp: m.timestamp,
        })),
        satisfaction: chatSession.satisfaction,
      },
    })

  } catch (error) {
    console.error('Get chat session error:', error)
    return NextResponse.json(
      { error: 'Failed to get chat session' },
      { status: 500 }
    )
  }
}