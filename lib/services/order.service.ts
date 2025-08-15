import { prisma } from '../prisma'
import { NotFoundError, ValidationError } from '../api/errors'
import { CartService } from './cart.service'
import { ProductService } from './product.service'
import { EmailService } from '../email'
import Stripe from 'stripe'

// New payment-flow order data structure
export interface PaymentOrderCreateData {
  paymentIntentId: string
  cartItems: Array<{
    productId: string
    quantity: number
    selectedColor?: string
    selectedSize?: string
    product: {
      name: string
      price: string | number
      image?: string
      primaryImage?: {
        url: string
        alt: string
      }
    }
  }>
  shippingMethod: 'standard' | 'express'
  couponCode?: string
}

// Legacy order data structure (kept for compatibility)
export interface OrderCreateData {
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: 'CARD' | 'PAYPAL' | 'CASH_ON_DELIVERY'
  notes?: string
}

export interface OrderStatusUpdate {
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  trackingNumber?: string
  notes?: string
}

export class OrderService {
  // Initialize Stripe for payment intent retrieval
  private static stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
  })

  // New payment-flow order creation method
  static async createOrderFromPayment(userId: string, data: PaymentOrderCreateData) {
    try {
      console.log('🚀 Creating order from payment intent:', data.paymentIntentId)
      
      // Retrieve payment intent from Stripe to get payment and address details
      const paymentIntent = await this.stripe.paymentIntents.retrieve(data.paymentIntentId, {
        expand: ['latest_charge.billing_details', 'shipping']
      })

      if (paymentIntent.status !== 'succeeded') {
        throw new ValidationError('Payment must be completed before creating order')
      }

      // Extract address information from payment intent
      const billingDetails = (typeof paymentIntent.latest_charge === 'object' && paymentIntent.latest_charge !== null) 
        ? paymentIntent.latest_charge.billing_details 
        : null
      const shippingDetails = paymentIntent.shipping

      // Calculate totals
      let subtotal = 0
      for (const item of data.cartItems) {
        const price = typeof item.product.price === 'string' 
          ? parseFloat(item.product.price) 
          : item.product.price
        subtotal += price * item.quantity
      }

      // Apply coupon discount if provided
      let discountAmount = 0
      if (data.couponCode) {
        // Calculate discount (you can implement more sophisticated logic here)
        if (data.couponCode === 'FIRST7') {
          discountAmount = Math.min(subtotal * 0.07, 50) // 7% off up to £50
        }
      }

      const discountedSubtotal = subtotal - discountAmount

      // Calculate shipping cost based on method
      const isTestItem = data.cartItems.some(item => 
        item.product.name.toLowerCase().includes('stripe test item')
      )
      let shippingCost = 0
      if (!isTestItem) {
        if (data.shippingMethod === 'express') {
          shippingCost = 9.99
        } else if (discountedSubtotal < 100) {
          shippingCost = 7.99 // Standard shipping
        }
        // Free shipping for orders over £100 or test items
      }

      // VAT is already included in UK prices, so total = discountedSubtotal + shipping
      const total = discountedSubtotal + shippingCost

      // Verify total matches payment intent (allow small differences for rounding)
      const paymentTotal = paymentIntent.amount / 100 // Convert from pence to pounds
      if (Math.abs(total - paymentTotal) > 0.01) {
        console.warn(`⚠️ Total mismatch: calculated £${total}, paid £${paymentTotal}`)
      }

      // Create order with transaction to ensure consistency
      const order = await prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber: `SD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            status: 'CONFIRMED', // Payment already succeeded
            paymentStatus: 'COMPLETED',
            paymentMethod: 'CARD',
            paymentIntentId: data.paymentIntentId,
            
            // Totals
            subtotalAmount: subtotal,
            taxAmount: 0, // VAT already included in UK prices
            discountAmount: discountAmount,
            shippingAmount: shippingCost,
            totalAmount: total,
            
            // Shipping details
            shippingName: shippingDetails?.name || billingDetails?.name || 'Unknown',
            shippingEmail: billingDetails?.email || 'unknown@example.com',
            shippingPhone: billingDetails?.phone || '',
            shippingAddress: shippingDetails?.address?.line1 || billingDetails?.address?.line1 || '',
            shippingCity: shippingDetails?.address?.city || billingDetails?.address?.city || '',
            shippingPostal: shippingDetails?.address?.postal_code || billingDetails?.address?.postal_code || '',
            shippingCountry: shippingDetails?.address?.country || billingDetails?.address?.country || 'UK',
            
            // Billing details (fallback to shipping if not available)
            billingName: billingDetails?.name || shippingDetails?.name || 'Unknown',
            billingEmail: billingDetails?.email || 'unknown@example.com',
            billingPhone: billingDetails?.phone || '',
            billingAddress: billingDetails?.address?.line1 || shippingDetails?.address?.line1 || '',
            billingCity: billingDetails?.address?.city || shippingDetails?.address?.city || '',
            billingPostal: billingDetails?.address?.postal_code || shippingDetails?.address?.postal_code || '',
            billingCountry: billingDetails?.address?.country || shippingDetails?.address?.country || 'UK',
            
            // Store shipping method and coupon in notes (since no dedicated fields)
            notes: `Shipping: ${data.shippingMethod}${data.couponCode ? `, Coupon: ${data.couponCode}` : ''}`,
            couponCode: data.couponCode,
          },
        })

        // Create order items from cart items
        for (const cartItem of data.cartItems) {
          const price = typeof cartItem.product.price === 'string' 
            ? parseFloat(cartItem.product.price) 
            : cartItem.product.price

          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: price,
              color: cartItem.selectedColor,
              size: cartItem.selectedSize,
            },
          })

          // Update product stock (only for real products, not test items)
          if (!cartItem.product.name.toLowerCase().includes('stripe test item')) {
            await tx.product.update({
              where: { id: cartItem.productId },
              data: {
                stockQuantity: {
                  decrement: cartItem.quantity,
                },
              },
            })
          }
        }

        console.log('✅ Order created successfully:', newOrder.orderNumber)
        
        // ADDED: Send order confirmation email
        try {
          console.log('📧 Sending order confirmation email to:', billingDetails?.email || paymentIntent.receipt_email)
          
          // Get user details for email
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
          })
          
          if (user?.email || billingDetails?.email || paymentIntent.receipt_email) {
            const emailAddress = user?.email || billingDetails?.email || paymentIntent.receipt_email
            const customerName = user?.name || billingDetails?.name || 'Customer'
            
            // Send order confirmation email using the existing email service
            await EmailService.sendOrderConfirmation({
              orderNumber: newOrder.orderNumber,
              customerEmail: emailAddress as string,
              customerName: customerName as string,
              items: data.cartItems.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: parseFloat(item.product.price.toString()),
                image: item.product.primaryImage?.url
              })),
              totals: {
                subtotal: subtotal,
                vat: 0, // VAT already included in UK prices
                shipping: shippingCost,
                total: subtotal + shippingCost,
              },
              shippingAddress: shippingDetails ? {
                name: shippingDetails.name || '',
                address: shippingDetails.address?.line1 || '',
                city: shippingDetails.address?.city || '',
                postalCode: shippingDetails.address?.postal_code || '',
                country: shippingDetails.address?.country || '',
              } : {
                name: billingDetails?.name || 'Unknown',
                address: billingDetails?.address?.line1 || '',
                city: billingDetails?.address?.city || '',
                postalCode: billingDetails?.address?.postal_code || '',
                country: billingDetails?.address?.country || 'UK',
              },
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'), // 7 days from now
            })
            
            console.log('✅ Order confirmation email sent successfully to:', emailAddress)
          } else {
            console.warn('⚠️ No email address found for order confirmation')
          }
        } catch (emailError) {
          console.error('❌ Failed to send order confirmation email:', emailError)
          // Don't throw error - order creation should succeed even if email fails
        }
        
        return newOrder
      })

      // Return order with items
      return await this.getOrderById(order.id)
    } catch (error) {
      console.error('❌ Error creating order from payment:', error)
      throw error
    }
  }

  // Legacy order creation method (kept for backward compatibility)
  static async createOrder(userId: string, data: OrderCreateData) {
    // Validate cart and get items
    const cartValidation = await CartService.validateCartForCheckout(userId)
    
    if (!cartValidation.valid) {
      throw new ValidationError('Cart validation failed')
    }

    // Calculate totals (simplified - in real app, you'd apply taxes, shipping, discounts)
    const subtotal = cartValidation.summary.subtotal
    const tax = subtotal * 0.2 // 20% VAT
    const shipping = subtotal >= 100 ? 0 : 10 // Free shipping over £100
    const total = subtotal + tax + shipping

    // Create order with transaction to ensure consistency
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: `SD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: data.paymentMethod,
          subtotalAmount: subtotal,
          taxAmount: tax,
          shippingAmount: shipping,
          totalAmount: total,
          notes: data.notes,
          
          // Shipping address
          shippingName: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
          shippingEmail: data.shippingAddress.email,
          shippingPhone: data.shippingAddress.phone,
          shippingAddress: data.shippingAddress.address,
          shippingCity: data.shippingAddress.city,
          shippingPostal: data.shippingAddress.postalCode,
          shippingCountry: data.shippingAddress.country,
          
          // Billing address
          billingName: `${data.billingAddress.firstName} ${data.billingAddress.lastName}`,
          billingEmail: data.billingAddress.email,
          billingPhone: data.billingAddress.phone,
          billingAddress: data.billingAddress.address,
          billingCity: data.billingAddress.city,
          billingPostal: data.billingAddress.postalCode,
          billingCountry: data.billingAddress.country,
        },
      })

      // Create order items from cart
      for (const cartItem of cartValidation.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.product.price,
            color: cartItem.color,
            size: cartItem.size,
          },
        })

        // Update product stock
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stockQuantity: {
              decrement: cartItem.quantity,
            },
          },
        })
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId },
      })

      return newOrder
    })

    // Return order with items
    return await this.getOrderById(order.id)
  }

  static async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    return {
      ...order,
      items: order.orderItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          primaryImage: item.product.images[0] || null,
          images: undefined,
        },
      })),
    }
  }

  static async getAllOrders(
    page = 1,
    limit = 20,
    status?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  }

  static async updateOrderStatus(orderId: string, update: OrderStatusUpdate) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    }

    const allowedNextStatuses = validTransitions[order.status] || []
    if (!allowedNextStatuses.includes(update.status)) {
      throw new ValidationError(
        `Cannot change order status from ${order.status} to ${update.status}`
      )
    }

    // Handle stock restoration for cancelled orders
    if (update.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.restoreOrderStock(orderId)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: update.status,
        // trackingNumber: update.trackingNumber, // Not available on Order model
        notes: update.notes ? `${order.notes || ''}\n${update.notes}`.trim() : order.notes,
        ...(update.status === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(update.status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(update.status === 'CONFIRMED' && { confirmedAt: new Date() }),
      },
    })

    return await this.getOrderById(updatedOrder.id)
  }

  static async cancelOrder(orderId: string, userId?: string, reason?: string) {
    const whereClause: any = { id: orderId }
    if (userId) {
      whereClause.userId = userId
    }

    const order = await prisma.order.findUnique({
      where: whereClause,
    })

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new ValidationError('Order cannot be cancelled at this stage')
    }

    return await this.updateOrderStatus(orderId, {
      status: 'CANCELLED',
      notes: reason ? `Cancelled: ${reason}` : 'Order cancelled',
    })
  }

  private static async restoreOrderStock(orderId: string) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
      },
    })

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            increment: item.quantity,
          },
        },
      })
    }
  }

  static async getOrderStats() {
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    })

    const totalOrders = await prisma.order.count()
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    })

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count.id,
          revenue: Number(stat._sum.totalAmount) || 0,
        }
        return acc
      }, {} as Record<string, { count: number; revenue: number }>),
    }
  }

  static async getRecentOrders(limit = 10) {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })
  }

  // Get most recent order with full details for email templates
  static async getMostRecentOrderForEmail() {
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      throw new NotFoundError('No orders found')
    }

    return order
  }
}