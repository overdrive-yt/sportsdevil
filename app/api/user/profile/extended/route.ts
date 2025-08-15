import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        country: true,
        loyaltyPoints: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            orderItems: {
              select: {
                id: true,
                quantity: true,
                price: true,
                product: {
                  select: {
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Latest 10 orders for profile overview
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate actual totals from orders
    const actualTotalSpent = user.orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount)
    }, 0)

    // Calculate loyalty points (1:1 ratio with spending)
    const calculatedLoyaltyPoints = Math.floor(actualTotalSpent)

    // If database values don't match calculated values, we'll update them
    const needsUpdate = 
      Number(user.totalSpent) !== actualTotalSpent || 
      user.loyaltyPoints !== calculatedLoyaltyPoints

    let updatedUser = user

    if (needsUpdate) {
      // Update user with correct calculated values
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          totalSpent: actualTotalSpent,
          loyaltyPoints: calculatedLoyaltyPoints
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          postalCode: true,
          country: true,
          loyaltyPoints: true,
          totalSpent: true,
          createdAt: true,
          updatedAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
              orderItems: {
                select: {
                  id: true,
                  quantity: true,
                  price: true,
                  product: {
                    select: {
                      name: true,
                      slug: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              orders: true
            }
          }
        }
      })

      // Create loyalty transaction record if points were updated
      if (user.loyaltyPoints !== calculatedLoyaltyPoints) {
        await prisma.loyaltyTransaction.create({
          data: {
            userId: user.id,
            type: 'EARNED',
            points: calculatedLoyaltyPoints - user.loyaltyPoints,
            description: `Loyalty points adjustment - calculated from order history (${calculatedLoyaltyPoints} total points)`
          }
        })
      }
    }

    // Format orders for frontend
    const formattedOrders = updatedUser.orders.map(order => ({
      id: order.orderNumber,
      date: order.createdAt.toISOString().split('T')[0],
      status: order.status.toLowerCase(),
      total: Number(order.totalAmount),
      items: order.orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    }))

    // Calculate loyalty metrics
    const pointsValue = Math.floor(updatedUser.loyaltyPoints / 1000) * 10
    const canRedeem = updatedUser.loyaltyPoints >= 1000
    const nextRewardAt = 1000 - (updatedUser.loyaltyPoints % 1000)

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        country: updatedUser.country,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      },
      loyalty: {
        loyaltyPoints: updatedUser.loyaltyPoints,
        totalSpent: Number(updatedUser.totalSpent),
        pointsValue,
        canRedeem,
        nextRewardAt,
        redeemableAmount: Math.floor(updatedUser.loyaltyPoints / 1000) * 10
      },
      orders: {
        recent: formattedOrders,
        totalCount: updatedUser._count.orders,
        totalValue: Number(updatedUser.totalSpent)
      },
      stats: {
        totalOrders: updatedUser._count.orders,
        totalSpent: Number(updatedUser.totalSpent),
        loyaltyPoints: updatedUser.loyaltyPoints,
        memberSince: updatedUser.createdAt,
        accountUpdated: needsUpdate
      }
    })

  } catch (error) {
    console.error('Error fetching extended user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}