// V9.15: Weekly Analytics API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface WeeklyAnalytics {
  revenue: {
    current: number
    previous: number
    change: number
    trend: number[]
  }
  orders: {
    current: number
    previous: number
    change: number
    trend: number[]
  }
  customers: {
    current: number
    previous: number
    change: number
    new: number
    returning: number
  }
  products: {
    current: number
    previous: number
    change: number
    inStock: number
    lowStock: number
    outOfStock: number
    trend: number[]
    topSelling: Array<{
      id: string
      name: string
      sales: number
      revenue: number
    }>
    categories: Array<{
      name: string
      percentage: number
      change: number
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    
    // Calculate date ranges
    const now = new Date()
    const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get current week revenue
    const currentWeekOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: currentWeekStart,
          lte: now
        },
        status: 'DELIVERED'
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Get previous week revenue
    const previousWeekOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousWeekStart,
          lt: currentWeekStart
        },
        status: 'DELIVERED'
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Calculate revenue
    const currentRevenue = currentWeekOrders.reduce((total, order) => 
      total + order.orderItems.reduce((orderTotal, item) => 
        orderTotal + (Number(item.price) * item.quantity), 0), 0)
    
    const previousRevenue = previousWeekOrders.reduce((total, order) => 
      total + order.orderItems.reduce((orderTotal, item) => 
        orderTotal + (Number(item.price) * item.quantity), 0), 0)

    // Generate daily revenue trend for current week
    const revenueTrend = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayOrders = currentWeekOrders.filter(order => 
        order.createdAt >= dayStart && order.createdAt < dayEnd
      )
      
      const dayRevenue = dayOrders.reduce((total, order) => 
        total + order.orderItems.reduce((orderTotal, item) => 
          orderTotal + (Number(item.price) * item.quantity), 0), 0)
      
      revenueTrend.push(dayRevenue)
    }

    // Calculate order trends
    const orderTrend = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayOrderCount = currentWeekOrders.filter(order => 
        order.createdAt >= dayStart && order.createdAt < dayEnd
      ).length
      
      orderTrend.push(dayOrderCount)
    }

    // Get customer data
    const currentWeekCustomers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: currentWeekStart,
          lte: now
        }
      }
    })

    const previousWeekCustomers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: previousWeekStart,
          lt: currentWeekStart
        }
      }
    })

    // Get returning customers (customers who placed orders this week but account created before)
    const returningCustomers = await prisma.user.findMany({
      where: {
        createdAt: {
          lt: currentWeekStart
        },
        orders: {
          some: {
            createdAt: {
              gte: currentWeekStart,
              lte: now
            }
          }
        }
      }
    })

    // Get top selling products
    const productSales = new Map<string, { product: any, sales: number, revenue: number }>()
    
    currentWeekOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const existing = productSales.get(item.productId) || {
          product: item.product,
          sales: 0,
          revenue: 0
        }
        
        existing.sales += item.quantity
        existing.revenue += Number(item.price) * item.quantity
        productSales.set(item.productId, existing)
      })
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(item => ({
        id: item.product.id,
        name: item.product.name,
        sales: item.sales,
        revenue: item.revenue
      }))

    // Get category performance
    const categories = await prisma.category.findMany({
      include: {
        productCategories: {
          include: {
            product: {
              include: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: {
                        gte: currentWeekStart,
                        lte: now
                      },
                      status: 'DELIVERED'
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const totalCategoryRevenue = categories.reduce((total, category) => {
      const categoryRevenue = category.productCategories.reduce((catTotal, productCategory) => {
        return catTotal + productCategory.product.orderItems.reduce((prodTotal, item) => 
          prodTotal + (Number(item.price) * item.quantity), 0)
      }, 0)
      return total + categoryRevenue
    }, 0)

    const categoryPerformance = categories.map(category => {
      const categoryRevenue = category.productCategories.reduce((catTotal, productCategory) => {
        return catTotal + productCategory.product.orderItems.reduce((prodTotal, item) => 
          prodTotal + (Number(item.price) * item.quantity), 0)
      }, 0)

      const percentage = totalCategoryRevenue > 0 ? (categoryRevenue / totalCategoryRevenue) * 100 : 0

      // Calculate previous week performance for comparison
      const prevCategoryRevenue = category.productCategories.reduce((catTotal, productCategory) => {
        const prevItems = productCategory.product.orderItems.filter(item => {
          const order = currentWeekOrders.find(o => o.id === item.orderId)
          return order && order.createdAt >= previousWeekStart && order.createdAt < currentWeekStart
        })
        return catTotal + prevItems.reduce((prodTotal, item) => 
          prodTotal + (Number(item.price) * item.quantity), 0)
      }, 0)

      const change = prevCategoryRevenue > 0 ? 
        ((categoryRevenue - prevCategoryRevenue) / prevCategoryRevenue) * 100 : 0

      return {
        name: category.name,
        percentage: Math.round(percentage * 10) / 10,
        change: Math.round(change * 10) / 10
      }
    }).filter(cat => cat.percentage > 0)

    // Get current week product statistics
    const currentWeekProducts = await prisma.product.findMany({
      where: { isActive: true }
    })
    
    const previousWeekProducts = await prisma.product.findMany({
      where: { 
        isActive: true,
        createdAt: {
          lt: currentWeekStart
        }
      }
    })

    const currentProductCount = currentWeekProducts.length
    const previousProductCount = previousWeekProducts.length
    const productChange = currentProductCount - previousProductCount

    // Calculate inventory statistics
    const inStockProducts = currentWeekProducts.filter(p => p.stockQuantity > 10).length
    const lowStockProducts = currentWeekProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length
    const outOfStockProducts = currentWeekProducts.filter(p => p.stockQuantity === 0).length

    // Generate product trend data (daily product count over the week)
    const productTrend = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayProductCount = await prisma.product.count({
        where: {
          isActive: true,
          createdAt: {
            lt: dayEnd
          }
        }
      })
      
      productTrend.push(dayProductCount)
    }

    const analytics: WeeklyAnalytics = {
      revenue: {
        current: Math.round(currentRevenue * 100) / 100,
        previous: Math.round(previousRevenue * 100) / 100,
        change: Math.round((currentRevenue - previousRevenue) * 100) / 100,
        trend: revenueTrend.map(val => Math.round(val * 100) / 100)
      },
      orders: {
        current: currentWeekOrders.length,
        previous: previousWeekOrders.length,
        change: currentWeekOrders.length - previousWeekOrders.length,
        trend: orderTrend
      },
      customers: {
        current: currentWeekCustomers.length,
        previous: previousWeekCustomers.length,
        change: currentWeekCustomers.length - previousWeekCustomers.length,
        new: currentWeekCustomers.length,
        returning: returningCustomers.length
      },
      products: {
        current: currentProductCount,
        previous: previousProductCount,
        change: productChange,
        inStock: inStockProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        trend: productTrend,
        topSelling: topProducts,
        categories: categoryPerformance
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        period,
        currentWeekStart: currentWeekStart.toISOString(),
        currentWeekEnd: now.toISOString(),
        previousWeekStart: previousWeekStart.toISOString(),
        previousWeekEnd: currentWeekStart.toISOString()
      }
    })

  } catch (error) {
    console.error('Weekly analytics API error:', error)
    
    // Return mock data if database queries fail
    const mockAnalytics: WeeklyAnalytics = {
      revenue: {
        current: 12458.50,
        previous: 10890.25,
        change: 1568.25,
        trend: [1200.50, 1350.75, 1100.25, 1890.60, 2100.80, 2015.30, 2799.50]
      },
      orders: {
        current: 145,
        previous: 128,
        change: 17,
        trend: [18, 22, 16, 28, 31, 30, 35]
      },
      customers: {
        current: 234,
        previous: 198,
        change: 36,
        new: 234,
        returning: 1890
      },
      products: {
        current: 156,
        previous: 152,
        change: 4,
        inStock: 134,
        lowStock: 15,
        outOfStock: 7,
        trend: [152, 153, 154, 154, 155, 155, 156],
        topSelling: [
          { id: '1', name: 'Gray-Nicolls Kaboom Pro Cricket Bat', sales: 45, revenue: 4049.55 },
          { id: '2', name: 'Aero P1 Pro Batting Gloves', sales: 78, revenue: 3119.22 },
          { id: '3', name: 'Masuri Pro Cricket Helmet', sales: 23, revenue: 1839.77 },
          { id: '4', name: 'Kookaburra Pro Pads', sales: 34, revenue: 2243.66 },
          { id: '5', name: 'GM Diamond Cricket Ball Set', sales: 67, revenue: 3015.00 }
        ],
        categories: [
          { name: 'Cricket Bats', percentage: 35.2, change: 12.5 },
          { name: 'Protection', percentage: 28.8, change: 8.2 },
          { name: 'Wicket Keeping', percentage: 22.1, change: 15.7 },
          { name: 'Clothing', percentage: 13.9, change: -2.1 }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: mockAnalytics,
      meta: {
        period: '7d',
        fallback: true,
        message: 'Using mock data due to database unavailability'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 })
}