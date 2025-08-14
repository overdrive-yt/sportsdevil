/**
 * Notification triggers for Sports Devil Cricket Equipment
 * Automatically sends notifications based on business events
 */

import { notificationService } from './notifications'
import { logger } from './monitoring'

export interface OrderData {
  id: string
  orderNumber: string
  customerId: string
  customerEmail: string
  customerPhone?: string
  customerName: string
  total: number
  items: Array<{
    id: string
    name: string
    sku: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  estimatedDelivery?: Date
}

export interface ShippingData {
  orderId: string
  orderNumber: string
  trackingNumber: string
  carrier: string
  trackingUrl: string
  expectedDelivery: Date
  customerEmail: string
  customerPhone?: string
  customerName: string
  shippingAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
  }
}

export interface ProductData {
  id: string
  name: string
  sku: string
  currentStock: number
  reorderLevel: number
  price: number
  category: string
  slug: string
}

export interface CustomerData {
  id: string
  email: string
  phone?: string
  name: string
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    marketingEmails: boolean
  }
}

/**
 * Order notification triggers
 */
export class OrderNotificationTriggers {
  
  static async onOrderConfirmed(orderData: OrderData) {
    try {
      logger.info('Triggering order confirmation notification', 'notifications', { 
        orderId: orderData.id,
        orderNumber: orderData.orderNumber 
      })

      // Format order items for email
      const orderItemsHtml = orderData.items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <strong>${item.name}</strong><br>
          SKU: ${item.sku} | Qty: ${item.quantity} | £${item.price.toFixed(2)}
        </div>
      `).join('')

      const orderItemsText = orderData.items.map(item => 
        `${item.name} (£${item.price.toFixed(2)})`
      ).join(', ')

      // Format delivery address
      const deliveryAddress = `${orderData.shippingAddress.name}\n${orderData.shippingAddress.street}\n${orderData.shippingAddress.city} ${orderData.shippingAddress.postalCode}\n${orderData.shippingAddress.country}`

      const result = await notificationService.sendOrderConfirmation({
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        orderDate: orderData.createdAt.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        orderTotal: orderData.total.toFixed(2),
        orderItems: orderItemsHtml,
        orderItemsText: orderItemsText,
        deliveryAddress: deliveryAddress,
        estimatedDelivery: orderData.estimatedDelivery?.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) || '3-5 business days',
      })

      if (result.success) {
        logger.info('Order confirmation notification sent successfully', 'notifications', {
          orderId: orderData.id,
          results: result.results
        })
      } else {
        logger.error('Failed to send order confirmation notification', 'notifications', {
          orderId: orderData.id,
          results: result.results
        })
      }

      return result

    } catch (error) {
      logger.error('Error in order confirmation trigger', 'notifications', {
        orderId: orderData.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  static async onOrderShipped(shippingData: ShippingData) {
    try {
      logger.info('Triggering order shipped notification', 'notifications', { 
        orderId: shippingData.orderId,
        trackingNumber: shippingData.trackingNumber 
      })

      const deliveryAddress = `${shippingData.shippingAddress.name}\n${shippingData.shippingAddress.street}\n${shippingData.shippingAddress.city} ${shippingData.shippingAddress.postalCode}\n${shippingData.shippingAddress.country}`

      const result = await notificationService.sendShippingNotification({
        customerEmail: shippingData.customerEmail,
        customerPhone: shippingData.customerPhone,
        customerName: shippingData.customerName,
        orderNumber: shippingData.orderNumber,
        trackingNumber: shippingData.trackingNumber,
        carrier: shippingData.carrier,
        expectedDelivery: shippingData.expectedDelivery.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        trackingUrl: shippingData.trackingUrl,
        deliveryAddress: deliveryAddress,
      })

      if (result.success) {
        logger.info('Order shipped notification sent successfully', 'notifications', {
          orderId: shippingData.orderId,
          results: result.results
        })
      } else {
        logger.error('Failed to send order shipped notification', 'notifications', {
          orderId: shippingData.orderId,
          results: result.results
        })
      }

      return result

    } catch (error) {
      logger.error('Error in order shipped trigger', 'notifications', {
        orderId: shippingData.orderId,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

/**
 * Inventory notification triggers
 */
export class InventoryNotificationTriggers {
  
  static async onLowStock(productData: ProductData, adminEmail: string = 'admin@sportsdevil.co.uk') {
    try {
      logger.warn('Triggering low stock alert', 'notifications', { 
        productId: productData.id,
        currentStock: productData.currentStock,
        reorderLevel: productData.reorderLevel
      })

      const result = await notificationService.sendLowStockAlert({
        adminEmail,
        productName: productData.name,
        productSku: productData.sku,
        currentStock: productData.currentStock.toString(),
        reorderLevel: productData.reorderLevel.toString(),
        adminUrl: 'https://sportsdevil.co.uk/admin/inventory',
      })

      if (result.success) {
        logger.info('Low stock alert sent successfully', 'notifications', {
          productId: productData.id,
          results: result.results
        })
      } else {
        logger.error('Failed to send low stock alert', 'notifications', {
          productId: productData.id,
          results: result.results
        })
      }

      return result

    } catch (error) {
      logger.error('Error in low stock trigger', 'notifications', {
        productId: productData.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  static async onBackInStock(productData: ProductData, customerData: CustomerData) {
    try {
      logger.info('Triggering back in stock notification', 'notifications', { 
        productId: productData.id,
        customerId: customerData.id
      })

      const result = await notificationService.sendBackInStockNotification({
        customerEmail: customerData.email,
        customerPhone: customerData.phone,
        productName: productData.name,
        price: productData.price.toFixed(2),
        productSlug: productData.slug,
      })

      if (result.success) {
        logger.info('Back in stock notification sent successfully', 'notifications', {
          productId: productData.id,
          customerId: customerData.id,
          results: result.results
        })
      } else {
        logger.error('Failed to send back in stock notification', 'notifications', {
          productId: productData.id,
          customerId: customerData.id,
          results: result.results
        })
      }

      return result

    } catch (error) {
      logger.error('Error in back in stock trigger', 'notifications', {
        productId: productData.id,
        customerId: customerData.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

/**
 * Marketing notification triggers
 */
export class MarketingNotificationTriggers {

  static async sendSeasonReminders(customers: CustomerData[]) {
    const results = []

    for (const customer of customers) {
      try {
        // Check if customer opted in for marketing emails
        if (customer.preferences?.marketingEmails === false) {
          continue
        }

        logger.info('Sending season reminder', 'notifications', { 
          customerId: customer.id 
        })

        const result = await notificationService.sendSeasonReminder({
          customerEmail: customer.email,
          customerName: customer.name,
        })

        results.push({
          customerId: customer.id,
          success: result.success,
          results: result.results
        })

        // Add delay between sends to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        logger.error('Error sending season reminder', 'notifications', {
          customerId: customer.id,
          error: error instanceof Error ? error.message : String(error)
        })
        results.push({
          customerId: customer.id,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    logger.info('Season reminder campaign completed', 'notifications', {
      totalCustomers: customers.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })

    return results
  }

  static async sendCricketSeasonStartReminder() {
    // This would typically fetch customers from database
    // For now, we'll use a mock implementation
    
    logger.info('Starting cricket season reminder campaign', 'notifications')

    // In a real implementation, you would:
    // 1. Fetch customers who opted in for marketing emails
    // 2. Filter by location (Birmingham area)
    // 3. Filter by purchase history (cricket equipment buyers)
    // 4. Send in batches to avoid overwhelming email service

    const mockCustomers: CustomerData[] = [
      // This would come from database query
    ]

    return await this.sendSeasonReminders(mockCustomers)
  }
}

/**
 * Automatic notification scheduler
 */
export class NotificationScheduler {
  private static instance: NotificationScheduler
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler()
    }
    return NotificationScheduler.instance
  }

  startLowStockMonitoring(checkIntervalMinutes: number = 60) {
    if (this.intervals.has('lowStock')) {
      this.stopLowStockMonitoring()
    }

    logger.info('Starting low stock monitoring', 'notifications', {
      intervalMinutes: checkIntervalMinutes
    })

    const interval = setInterval(async () => {
      try {
        // In a real implementation, query database for low stock products
        // const lowStockProducts = await prisma.product.findMany({
        //   where: {
        //     stock: {
        //       lte: prisma.product.fields.reorderLevel
        //     }
        //   }
        // })

        // For each low stock product, send notification
        // for (const product of lowStockProducts) {
        //   await InventoryNotificationTriggers.onLowStock(product)
        // }

        logger.debug('Low stock monitoring check completed', 'notifications')

      } catch (error) {
        logger.error('Error in low stock monitoring', 'notifications', {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }, checkIntervalMinutes * 60 * 1000)

    this.intervals.set('lowStock', interval)
  }

  stopLowStockMonitoring() {
    const interval = this.intervals.get('lowStock')
    if (interval) {
      clearInterval(interval)
      this.intervals.delete('lowStock')
      logger.info('Stopped low stock monitoring', 'notifications')
    }
  }

  scheduleSeasonReminders() {
    // Schedule cricket season reminders
    // This would typically be set up as cron jobs in production

    logger.info('Scheduling cricket season reminders', 'notifications')

    // Example: Send reminders at the start of cricket season (March/April)
    const now = new Date()
    const currentYear = now.getFullYear()
    const seasonStart = new Date(currentYear, 2, 15) // March 15th

    // If season start has passed, schedule for next year
    if (now > seasonStart) {
      seasonStart.setFullYear(currentYear + 1)
    }

    const timeUntilSeason = seasonStart.getTime() - now.getTime()

    setTimeout(async () => {
      try {
        await MarketingNotificationTriggers.sendCricketSeasonStartReminder()
      } catch (error) {
        logger.error('Error sending season reminders', 'notifications', {
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }, timeUntilSeason)

    logger.info('Cricket season reminders scheduled', 'notifications', {
      scheduledFor: seasonStart.toISOString()
    })
  }

  destroy() {
    // Clean up all intervals
    for (const [name, interval] of this.intervals) {
      clearInterval(interval)
      logger.info(`Stopped ${name} monitoring`, 'notifications')
    }
    this.intervals.clear()
  }
}

// Export singleton instances
export const orderNotificationTriggers = OrderNotificationTriggers
export const inventoryNotificationTriggers = InventoryNotificationTriggers
export const marketingNotificationTriggers = MarketingNotificationTriggers
export const notificationScheduler = NotificationScheduler.getInstance()

export default {
  OrderNotificationTriggers,
  InventoryNotificationTriggers,
  MarketingNotificationTriggers,
  NotificationScheduler,
  orderNotificationTriggers,
  inventoryNotificationTriggers,
  marketingNotificationTriggers,
  notificationScheduler,
}