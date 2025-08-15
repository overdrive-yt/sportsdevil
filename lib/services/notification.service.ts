import { prisma } from '../prisma'
import { EmailService } from '../email'

export interface OrderNotificationData {
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
    image?: string
  }>
  totals: {
    subtotal: number
    vat: number
    shipping: number
    total: number
  }
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

export interface ShippingNotificationData {
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
  shippingAddress: {
    name: string
    address: string
    city: string
    postalCode: string
  }
}

export class NotificationService {
  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(orderData: OrderNotificationData) {
    try {
      // Calculate estimated delivery (2-3 business days from now)
      const deliveryDate = new Date()
      deliveryDate.setDate(deliveryDate.getDate() + 3) // Add 3 days
      const estimatedDelivery = deliveryDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const result = await EmailService.sendOrderConfirmation({
        ...orderData,
        estimatedDelivery,
      })

      // Log notification in database (optional)
      if (result.success) {
        await this.logNotification({
          orderId: orderData.orderId,
          type: 'ORDER_CONFIRMATION',
          recipient: orderData.customerEmail,
          status: 'SENT',
          sentAt: new Date(),
        })
      }

      return result
    } catch (error) {
      console.error('Error sending order confirmation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send shipping notification email
   */
  static async sendShippingNotification(shippingData: ShippingNotificationData) {
    try {
      const result = await EmailService.sendOrderShipped(shippingData)

      // Log notification in database
      if (result.success) {
        await this.logNotification({
          orderId: shippingData.orderId,
          type: 'ORDER_SHIPPED',
          recipient: shippingData.customerEmail,
          status: 'SENT',
          sentAt: new Date(),
        })
      }

      return result
    } catch (error) {
      console.error('Error sending shipping notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send payment failure notification
   */
  static async sendPaymentFailureNotification(paymentData: {
    orderId: string
    orderNumber: string
    customerEmail: string
    customerName: string
    failureReason: string
  }) {
    try {
      const retryUrl = `${process.env.NEXTAUTH_URL}/checkout/retry?order=${paymentData.orderNumber}`
      
      const result = await EmailService.sendPaymentFailed({
        ...paymentData,
        retryUrl,
      })

      // Log notification in database
      if (result.success) {
        await this.logNotification({
          orderId: paymentData.orderId,
          type: 'PAYMENT_FAILED',
          recipient: paymentData.customerEmail,
          status: 'SENT',
          sentAt: new Date(),
        })
      }

      return result
    } catch (error) {
      console.error('Error sending payment failure notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Process order status change and send appropriate notifications
   */
  static async processOrderStatusChange(orderId: string, newStatus: string, additionalData?: any) {
    try {
      // Get order details from database
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }

      // Prepare order data for notifications
      const orderData: OrderNotificationData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.user.email!,
        customerName: order.user.name || order.shippingName,
        status: newStatus,
        items: order.orderItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.price),
          image: item.product.images[0]?.url,
        })),
        totals: {
          subtotal: Number(order.subtotalAmount),
          vat: Number(order.taxAmount),
          shipping: Number(order.shippingAmount),
          total: Number(order.totalAmount),
        },
        shippingAddress: {
          name: order.shippingName,
          address: order.shippingAddress,
          city: order.shippingCity,
          postalCode: order.shippingPostal,
          country: order.shippingCountry,
        },
      }

      // Send appropriate notification based on status
      switch (newStatus) {
        case 'CONFIRMED':
          await this.sendOrderConfirmation(orderData)
          break

        case 'SHIPPED':
          if (additionalData?.trackingNumber) {
            const shippingData: ShippingNotificationData = {
              orderId: order.id,
              orderNumber: order.orderNumber,
              customerEmail: order.user.email!,
              customerName: order.user.name || order.shippingName,
              trackingNumber: additionalData.trackingNumber,
              carrier: additionalData.carrier || 'Royal Mail',
              estimatedDelivery: additionalData.estimatedDelivery || 'Next business day',
              shippingAddress: {
                name: order.shippingName,
                address: order.shippingAddress,
                city: order.shippingCity,
                postalCode: order.shippingPostal,
              },
            }
            await this.sendShippingNotification(shippingData)
          }
          break

        case 'CANCELLED':
          // Could add cancellation notification here
          break

        default:
          console.log(`No notification configured for status: ${newStatus}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error processing order status change:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Log notification in database (optional - requires notification table)
   */
  private static async logNotification(notificationData: {
    orderId: string
    type: string
    recipient: string
    status: string
    sentAt: Date
  }) {
    try {
      // This would require a notifications table in the database
      // For now, we'll just log to console
      console.log('📧 Notification logged:', {
        orderId: notificationData.orderId,
        type: notificationData.type,
        recipient: notificationData.recipient,
        status: notificationData.status,
        sentAt: notificationData.sentAt.toISOString(),
      })

      // Uncomment if you add a notifications table:
      /*
      await prisma.notification.create({
        data: {
          orderId: notificationData.orderId,
          type: notificationData.type,
          recipient: notificationData.recipient,
          status: notificationData.status,
          sentAt: notificationData.sentAt,
        },
      })
      */
    } catch (error) {
      console.error('Error logging notification:', error)
    }
  }

  /**
   * Get order tracking information
   */
  static async getOrderTracking(orderNumber: string, userEmail?: string) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          orderNumber,
          ...(userEmail && { 
            user: { email: userEmail } 
          }),
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          shippingName: true,
          shippingAddress: true,
          shippingCity: true,
          shippingPostal: true,
          createdAt: true,
          shippedAt: true,
          deliveredAt: true,
          notes: true,
        },
      })

      if (!order) {
        return { success: false, error: 'Order not found' }
      }

      // Calculate tracking timeline
      const timeline = []
      
      timeline.push({
        status: 'Order Placed',
        date: order.createdAt,
        completed: true,
        description: 'Your order has been received and is being processed',
      })

      if (order.status === 'CONFIRMED' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        timeline.push({
          status: 'Payment Confirmed',
          date: order.createdAt, // Would be payment confirmed date
          completed: true,
          description: 'Payment has been processed successfully',
        })
      }

      if (order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        timeline.push({
          status: 'Order Processing',
          date: order.createdAt, // Would be processing start date
          completed: true,
          description: 'Your cricket equipment is being prepared for dispatch',
        })
      }

      if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        timeline.push({
          status: 'Dispatched',
          date: order.shippedAt || order.createdAt,
          completed: true,
          description: 'Your order has been dispatched and is on its way',
        })
      }

      if (order.status === 'DELIVERED') {
        timeline.push({
          status: 'Delivered',
          date: order.deliveredAt || order.shippedAt || order.createdAt,
          completed: true,
          description: 'Your order has been delivered successfully',
        })
      } else if (order.status !== 'CANCELLED') {
        // Add expected delivery if not yet delivered
        const expectedDelivery = new Date(order.createdAt)
        expectedDelivery.setDate(expectedDelivery.getDate() + 3)
        
        timeline.push({
          status: 'Expected Delivery',
          date: expectedDelivery,
          completed: false,
          description: 'Estimated delivery date',
        })
      }

      return {
        success: true,
        tracking: {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          shippingAddress: {
            name: order.shippingName,
            address: order.shippingAddress,
            city: order.shippingCity,
            postalCode: order.shippingPostal,
          },
          timeline,
          notes: order.notes,
        },
      }
    } catch (error) {
      console.error('Error getting order tracking:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}