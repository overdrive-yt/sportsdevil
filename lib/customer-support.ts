/**
 * Customer support system for Sports Devil Cricket Equipment
 * Handles live chat, tickets, FAQ automation, and WhatsApp integration
 */

import { z } from 'zod'

export interface SupportTicket {
  id: string
  ticketNumber: string
  customerId?: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  subject: string
  message: string
  category: 'general' | 'order' | 'product' | 'technical' | 'complaint' | 'return'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'pending-customer' | 'resolved' | 'closed'
  assignedTo?: string
  tags: string[]
  attachments: string[]
  responses: SupportResponse[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface SupportResponse {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  authorType: 'customer' | 'agent' | 'system'
  message: string
  attachments: string[]
  isInternal: boolean
  createdAt: Date
}

export interface ChatSession {
  id: string
  customerId?: string
  customerName?: string
  customerEmail?: string
  agentId?: string
  agentName?: string
  status: 'waiting' | 'active' | 'transferred' | 'ended'
  messages: ChatMessage[]
  tags: string[]
  startedAt: Date
  endedAt?: Date
  satisfaction?: {
    rating: number
    feedback?: string
  }
}

export interface ChatMessage {
  id: string
  sessionId: string
  authorId: string
  authorName: string
  authorType: 'customer' | 'agent' | 'system'
  message: string
  messageType: 'text' | 'image' | 'file' | 'system'
  attachments: string[]
  timestamp: Date
  readAt?: Date
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  popularity: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  message: string
  messageType: 'text' | 'image' | 'document' | 'template'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: Date
  customerId?: string
}

/**
 * Support ticket management system
 */
export class SupportTicketManager {
  
  static async createTicket(ticketData: {
    customerEmail: string
    customerName: string
    customerPhone?: string
    customerId?: string
    subject: string
    message: string
    category: SupportTicket['category']
    priority?: SupportTicket['priority']
    attachments?: string[]
  }): Promise<SupportTicket> {
    try {
      const ticketNumber = `SD-${Date.now().toString(36).toUpperCase()}`
      
      const ticket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        ticketNumber,
        customerId: ticketData.customerId,
        customerEmail: ticketData.customerEmail,
        customerName: ticketData.customerName,
        customerPhone: ticketData.customerPhone,
        subject: ticketData.subject,
        message: ticketData.message,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        status: 'open',
        tags: [],
        attachments: ticketData.attachments || [],
        responses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.supportTicket.create({ data: ticket })

      console.log('Support ticket created:', ticket)
      
      // Auto-assign based on category and priority
      await this.autoAssignTicket(ticket)
      
      return ticket

    } catch (error) {
      console.error('Error creating support ticket:', error)
      throw error
    }
  }

  static async addResponse(ticketId: string, response: {
    authorId: string
    authorName: string
    authorType: SupportResponse['authorType']
    message: string
    attachments?: string[]
    isInternal?: boolean
  }): Promise<SupportResponse> {
    try {
      const supportResponse: SupportResponse = {
        id: `response-${Date.now()}`,
        ticketId,
        authorId: response.authorId,
        authorName: response.authorName,
        authorType: response.authorType,
        message: response.message,
        attachments: response.attachments || [],
        isInternal: response.isInternal || false,
        createdAt: new Date(),
      }

      // In a real implementation, save to database and update ticket
      // await prisma.supportResponse.create({ data: supportResponse })
      // await prisma.supportTicket.update({
      //   where: { id: ticketId },
      //   data: { updatedAt: new Date() }
      // })

      console.log('Support response added:', supportResponse)
      return supportResponse

    } catch (error) {
      console.error('Error adding support response:', error)
      throw error
    }
  }

  static async updateTicketStatus(ticketId: string, status: SupportTicket['status'], assignedTo?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      if (assignedTo) {
        updateData.assignedTo = assignedTo
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date()
      }

      // In a real implementation, update database
      // await prisma.supportTicket.update({
      //   where: { id: ticketId },
      //   data: updateData
      // })

      console.log('Ticket status updated:', { ticketId, status, assignedTo })
      return true

    } catch (error) {
      console.error('Error updating ticket status:', error)
      throw error
    }
  }

  static async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      // In a real implementation, fetch from database
      // const ticket = await prisma.supportTicket.findUnique({
      //   where: { id: ticketId },
      //   include: { responses: true }
      // })
      // return ticket

      return null

    } catch (error) {
      console.error('Error getting ticket:', error)
      throw error
    }
  }

  static async getCustomerTickets(customerId: string): Promise<SupportTicket[]> {
    try {
      // In a real implementation, fetch from database
      // const tickets = await prisma.supportTicket.findMany({
      //   where: { customerId },
      //   orderBy: { createdAt: 'desc' }
      // })
      // return tickets

      return []

    } catch (error) {
      console.error('Error getting customer tickets:', error)
      throw error
    }
  }

  private static async autoAssignTicket(ticket: SupportTicket): Promise<void> {
    try {
      // Simple auto-assignment logic based on category
      const assignmentRules = {
        'order': 'orders-team@sportsdevil.co.uk',
        'product': 'product-team@sportsdevil.co.uk',
        'technical': 'tech-support@sportsdevil.co.uk',
        'return': 'returns-team@sportsdevil.co.uk',
        'general': 'support@sportsdevil.co.uk',
        'complaint': 'manager@sportsdevil.co.uk',
      }

      const assignedTo = assignmentRules[ticket.category]
      if (assignedTo) {
        await this.updateTicketStatus(ticket.id, 'in-progress', assignedTo)
      }

    } catch (error) {
      console.error('Error auto-assigning ticket:', error)
    }
  }
}

/**
 * Live chat system for customer support
 */
export class LiveChatManager {
  
  static async createChatSession(customerData: {
    customerId?: string
    customerName?: string
    customerEmail?: string
  }): Promise<ChatSession> {
    try {
      const session: ChatSession = {
        id: `chat-${Date.now()}`,
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        status: 'waiting',
        messages: [],
        tags: [],
        startedAt: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.chatSession.create({ data: session })

      console.log('Chat session created:', session)
      
      // Add welcome message
      await this.addMessage(session.id, {
        authorId: 'system',
        authorName: 'Sports Devil Support',
        authorType: 'system',
        message: 'Hello! Welcome to Sports Devil support. How can we help you with your cricket equipment needs today?',
        messageType: 'text',
      })

      return session

    } catch (error) {
      console.error('Error creating chat session:', error)
      throw error
    }
  }

  static async addMessage(sessionId: string, messageData: {
    authorId: string
    authorName: string
    authorType: ChatMessage['authorType']
    message: string
    messageType?: ChatMessage['messageType']
    attachments?: string[]
  }): Promise<ChatMessage> {
    try {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId,
        authorId: messageData.authorId,
        authorName: messageData.authorName,
        authorType: messageData.authorType,
        message: messageData.message,
        messageType: messageData.messageType || 'text',
        attachments: messageData.attachments || [],
        timestamp: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.chatMessage.create({ data: message })

      console.log('Chat message added:', message)
      return message

    } catch (error) {
      console.error('Error adding chat message:', error)
      throw error
    }
  }

  static async assignAgent(sessionId: string, agentId: string, agentName: string): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.chatSession.update({
      //   where: { id: sessionId },
      //   data: {
      //     agentId,
      //     agentName,
      //     status: 'active'
      //   }
      // })

      // Add system message about agent assignment
      await this.addMessage(sessionId, {
        authorId: 'system',
        authorName: 'Sports Devil Support',
        authorType: 'system',
        message: `${agentName} has joined the conversation and will assist you.`,
        messageType: 'text',
      })

      console.log('Agent assigned to chat:', { sessionId, agentId, agentName })
      return true

    } catch (error) {
      console.error('Error assigning agent to chat:', error)
      throw error
    }
  }

  static async endChatSession(sessionId: string, satisfaction?: { rating: number; feedback?: string }): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.chatSession.update({
      //   where: { id: sessionId },
      //   data: {
      //     status: 'ended',
      //     endedAt: new Date(),
      //     satisfaction
      //   }
      // })

      console.log('Chat session ended:', { sessionId, satisfaction })
      return true

    } catch (error) {
      console.error('Error ending chat session:', error)
      throw error
    }
  }

  static async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      // In a real implementation, fetch from database
      // const session = await prisma.chatSession.findUnique({
      //   where: { id: sessionId },
      //   include: { messages: true }
      // })
      // return session

      return null

    } catch (error) {
      console.error('Error getting chat session:', error)
      throw error
    }
  }
}

/**
 * FAQ management and automation system
 */
export class FAQManager {
  
  private static faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'What cricket equipment do you sell?',
      answer: 'Sports Devil specializes in a complete range of cricket equipment including professional cricket bats (English and Kashmir willow), protective gear (pads, gloves, helmets), cricket balls, stumps, and accessories. We cater to all skill levels from junior to professional players.',
      category: 'products',
      tags: ['cricket', 'equipment', 'products', 'bats', 'protective-gear'],
      popularity: 95,
      isPublished: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'faq-2',
      question: 'Do you offer cricket bat repairs and maintenance?',
      answer: 'Yes! We provide professional cricket bat repair services including re-gripping, handle repairs, crack repairs, and general maintenance. Our experienced craftsmen can restore your bat to optimal playing condition. Contact us at 07897813165 for repair quotes.',
      category: 'services',
      tags: ['repair', 'maintenance', 'cricket-bats', 'services'],
      popularity: 87,
      isPublished: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'faq-3',
      question: 'What is your return and exchange policy?',
      answer: 'We offer a 30-day return policy on unused items in original condition. Cricket equipment can be exchanged for size or specification changes within 14 days. Custom or personalized items cannot be returned unless defective. Please contact us before returning any items.',
      category: 'returns',
      tags: ['returns', 'exchange', 'policy', 'refund'],
      popularity: 78,
      isPublished: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'faq-4',
      question: 'How long does delivery take?',
      answer: 'Standard delivery within the UK takes 2-3 business days. Express delivery (next working day) is available. Local Birmingham delivery is available same day for orders placed before 12pm. Free delivery on orders over £50.',
      category: 'shipping',
      tags: ['delivery', 'shipping', 'timeline', 'express'],
      popularity: 92,
      isPublished: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'faq-5',
      question: 'How do I choose the right cricket bat weight?',
      answer: 'Cricket bat weight depends on your height, strength, and playing style. Generally: Light (2lb 6oz-2lb 9oz) for better control and bat speed, Medium (2lb 10oz-2lb 12oz) for balanced power and control, Heavy (2lb 13oz+) for maximum power. Visit our Birmingham store for professional bat fitting.',
      category: 'advice',
      tags: ['cricket-bats', 'weight', 'selection', 'advice'],
      popularity: 83,
      isPublished: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]

  static async searchFAQs(query: string): Promise<FAQItem[]> {
    try {
      const lowercaseQuery = query.toLowerCase()
      
      return this.faqs
        .filter(faq => faq.isPublished)
        .filter(faq => 
          faq.question.toLowerCase().includes(lowercaseQuery) ||
          faq.answer.toLowerCase().includes(lowercaseQuery) ||
          faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
        .sort((a, b) => b.popularity - a.popularity)

    } catch (error) {
      console.error('Error searching FAQs:', error)
      return []
    }
  }

  static async getFAQsByCategory(category: string): Promise<FAQItem[]> {
    try {
      return this.faqs
        .filter(faq => faq.isPublished && faq.category === category)
        .sort((a, b) => b.popularity - a.popularity)

    } catch (error) {
      console.error('Error getting FAQs by category:', error)
      return []
    }
  }

  static async getAllFAQs(): Promise<FAQItem[]> {
    try {
      return this.faqs
        .filter(faq => faq.isPublished)
        .sort((a, b) => b.popularity - a.popularity)

    } catch (error) {
      console.error('Error getting all FAQs:', error)
      return []
    }
  }

  static async getPopularFAQs(limit: number = 5): Promise<FAQItem[]> {
    try {
      return this.faqs
        .filter(faq => faq.isPublished)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, limit)

    } catch (error) {
      console.error('Error getting popular FAQs:', error)
      return []
    }
  }

  static async getRelevantFAQs(message: string): Promise<FAQItem[]> {
    try {
      // Simple keyword matching for FAQ suggestions
      const keywords = message.toLowerCase().split(' ')
      
      const scored = this.faqs
        .filter(faq => faq.isPublished)
        .map(faq => {
          let score = 0
          const text = (faq.question + ' ' + faq.answer + ' ' + faq.tags.join(' ')).toLowerCase()
          
          keywords.forEach(keyword => {
            if (text.includes(keyword)) {
              score += 1
            }
          })
          
          return { faq, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || b.faq.popularity - a.faq.popularity)

      return scored.slice(0, 3).map(item => item.faq)

    } catch (error) {
      console.error('Error getting relevant FAQs:', error)
      return []
    }
  }
}

/**
 * WhatsApp Business integration for customer support
 */
export class WhatsAppManager {
  private config = {
    businessNumber: '+447897813165',
    apiUrl: 'https://graph.facebook.com/v18.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  }

  async sendMessage(to: string, message: string, messageType: 'text' | 'template' = 'text'): Promise<WhatsAppMessage> {
    try {
      if (!this.config.accessToken) {
        throw new Error('WhatsApp access token not configured')
      }

      const whatsappMessage: WhatsAppMessage = {
        id: `wa-${Date.now()}`,
        from: this.config.businessNumber,
        to,
        message,
        messageType,
        status: 'sent',
        timestamp: new Date(),
      }

      // In a real implementation, send via WhatsApp Business API
      // const response = await fetch(`${this.config.apiUrl}/${phoneNumberId}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.accessToken}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to,
      //     type: 'text',
      //     text: { body: message }
      //   })
      // })

      console.log('WhatsApp message sent:', whatsappMessage)
      return whatsappMessage

    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw error
    }
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: string): Promise<WhatsAppMessage> {
    const message = `🏏 Sports Devil: Your order ${orderNumber} is confirmed! Total: £${total}. We're preparing your cricket equipment. Track your order at sportsdevil.co.uk or call us at 07897813165.`
    
    return await this.sendMessage(to, message)
  }

  async sendShippingUpdate(to: string, orderNumber: string, trackingNumber: string): Promise<WhatsAppMessage> {
    const message = `📦 Sports Devil: Your cricket equipment is on the way! Order ${orderNumber} has shipped. Tracking: ${trackingNumber}. Expected delivery: 1-2 business days.`
    
    return await this.sendMessage(to, message)
  }

  async sendSupportResponse(to: string, ticketNumber: string, response: string): Promise<WhatsAppMessage> {
    const message = `🎯 Sports Devil Support - Ticket ${ticketNumber}: ${response}\n\nNeed more help? Reply to this message or call 07897813165.`
    
    return await this.sendMessage(to, message)
  }

  async verifyWebhook(token: string): Promise<boolean> {
    return token === this.config.verifyToken
  }

  async processIncomingMessage(webhookData: any): Promise<void> {
    try {
      // Process incoming WhatsApp messages
      // This would handle customer messages sent to the business number
      console.log('Processing WhatsApp webhook:', webhookData)

      // In a real implementation, parse the webhook data and:
      // 1. Extract customer message
      // 2. Create support ticket or chat session
      // 3. Send auto-response or forward to agent
      // 4. Update customer records

    } catch (error) {
      console.error('Error processing WhatsApp message:', error)
    }
  }
}

// Export singleton instances
export const supportTicketManager = SupportTicketManager
export const liveChatManager = LiveChatManager
export const faqManager = FAQManager
export const whatsappManager = new WhatsAppManager()

export default {
  SupportTicketManager,
  LiveChatManager,
  FAQManager,
  WhatsAppManager,
  supportTicketManager,
  liveChatManager,
  faqManager,
  whatsappManager,
}