import { prisma } from '../prisma'
import { NotFoundError, ValidationError, ConflictError } from '../api/errors'
import bcrypt from 'bcryptjs'

export interface UserProfileData {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user
  }

  static async updateUserProfile(userId: string, data: UserProfileData) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    // Check if email is being updated and ensure it's unique
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) {
        throw new ConflictError('Email address is already in use')
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }

  static async changePassword(userId: string, data: ChangePasswordData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    if (!user.password) {
      throw new ValidationError('User account does not have a password set')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect')
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    })

    return { success: true, message: 'Password changed successfully' }
  }

  static async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
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
      }),
      prisma.order.count({ where: { userId } }),
    ])

    return {
      orders: orders.map(order => ({
        ...order,
        items: order.orderItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            primaryImage: item.product.images[0] || null,
            images: undefined,
          },
        })),
      })),
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

  static async getUserOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
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

  static async deleteUserAccount(userId: string, password?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Verify password if provided (for accounts with passwords)
    if (user.password && password) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new ValidationError('Password is incorrect')
      }
    }

    // Check for pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'],
        },
      },
    })

    if (pendingOrders > 0) {
      throw new ValidationError(
        'Cannot delete account with pending orders. Please contact support.'
      )
    }

    // In a real application, you might want to:
    // 1. Anonymize user data instead of deleting
    // 2. Keep order history for business records
    // 3. Send confirmation email
    // 4. Log the deletion for audit purposes

    // For now, we'll perform a soft delete by deactivating the account
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${Date.now()}_${user.email}`,
        name: 'Deleted User',
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        country: null,
        password: null,
      },
    })

    // Clear cart items
    await prisma.cartItem.deleteMany({
      where: { userId },
    })

    return { 
      success: true, 
      message: 'Account has been successfully deleted',
      email: user.email,
    }
  }

  static async getUserStats(userId: string) {
    const [orderCount, totalSpent, cartItemCount] = await Promise.all([
      prisma.order.count({
        where: { userId },
      }),
      prisma.order.aggregate({
        where: { 
          userId,
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.cartItem.count({
        where: { userId },
      }),
    ])

    return {
      orderCount,
      totalSpent: totalSpent._sum.totalAmount || 0,
      cartItemCount,
    }
  }

  static async getRecentActivity(userId: string, limit = 10) {
    const [recentOrders, recentCartItems] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
      prisma.cartItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
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
      }),
    ])

    return {
      recentOrders,
      recentCartItems,
    }
  }
}