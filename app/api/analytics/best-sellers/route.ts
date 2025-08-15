import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { analyticsCache, CacheKeys, AnalyticsCache } from '@/lib/cache/analytics-cache'
import { serializePrice } from '@/lib/utils/price-formatting'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')
    const days = parseInt(searchParams.get('days') || '30')
    
    // Check cache first
    const cacheKey = CacheKeys.bestSellers(limit, days)
    const cached = analyticsCache.get(cacheKey)
    if (cached) {
      // Mark as cached and return
      const cachedResponse = { ...cached, meta: { ...cached.meta, cached: true } }
      return NextResponse.json(cachedResponse)
    }
    
    // Calculate date range (default: last 30 days)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    console.log(`📊 Fetching best sellers from database - Last ${days} days, Limit: ${limit}`)
    console.log(`📅 Date range: ${startDate.toISOString()} to ${new Date().toISOString()}`)
    
    // Query to get best selling products based on order volume
    const bestSellers = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        isActive: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            alt: true
          }
        },
        productCategories: {
          where: { isPrimary: true },
          take: 1,
          include: {
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: startDate
              },
              status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
              }
            }
          },
          select: {
            quantity: true,
            order: {
              select: {
                createdAt: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: {
              where: {
                order: {
                  createdAt: {
                    gte: startDate
                  },
                  status: {
                    in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                  }
                }
              }
            }
          }
        }
      },
      where: {
        isActive: true
      },
      take: limit * 2 // Get more than needed to filter properly
    })
    
    // Calculate total quantities sold for each product
    const productsWithSales = bestSellers
      .map(product => {
        const totalQuantitySold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalOrderCount = product._count.orderItems
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: serializePrice(product.price),
          originalPrice: product.originalPrice ? serializePrice(product.originalPrice) : null,
          primaryImage: product.images[0] || null,
          category: product.productCategories[0]?.category || null,
          analytics: {
            totalQuantitySold,
            totalOrderCount,
            salesScore: totalQuantitySold * 1.5 + totalOrderCount // Weighted score
          }
        }
      })
      .filter(product => product.analytics.totalQuantitySold > 0) // Only products with actual sales
      .sort((a, b) => b.analytics.salesScore - a.analytics.salesScore) // Sort by sales score
      .slice(0, limit)
    
    console.log(`📈 Found ${productsWithSales.length} best sellers:`)
    productsWithSales.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.analytics.totalQuantitySold} units sold in ${product.analytics.totalOrderCount} orders`)
    })
    
    // If we don't have enough best sellers (less than 4), fallback to featured products
    if (productsWithSales.length < 4) {
      console.log(`⚠️ Only ${productsWithSales.length} best sellers found. Adding featured products as fallback.`)
      
      const featuredProducts = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              url: true,
              alt: true
            }
          },
          productCategories: {
            where: { isPrimary: true },
            take: 1,
            include: {
              category: {
                select: {
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        where: {
          isActive: true,
          isFeatured: true,
          id: {
            notIn: productsWithSales.map(p => p.id) // Exclude already selected best sellers
          }
        },
        take: limit - productsWithSales.length
      })
      
      // Add featured products as fallback
      const fallbackProducts = featuredProducts.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: serializePrice(product.price),
        originalPrice: product.originalPrice ? serializePrice(product.originalPrice) : null,
        primaryImage: product.images[0] || null,
        category: product.productCategories[0]?.category || null,
        analytics: {
          totalQuantitySold: 0,
          totalOrderCount: 0,
          salesScore: 0,
          isFallback: true
        }
      }))
      
      productsWithSales.push(...fallbackProducts)
      console.log(`✅ Added ${fallbackProducts.length} featured products as fallback`)
    }
    
    const response = {
      success: true,
      data: productsWithSales,
      meta: {
        total: productsWithSales.length,
        period: `${days} days`,
        hasActualSales: productsWithSales.some(p => p.analytics.totalQuantitySold > 0),
        fallbackUsed: productsWithSales.some(p => p.analytics.isFallback),
        cached: false,
        timestamp: new Date().toISOString()
      }
    }
    
    // Cache the response
    analyticsCache.set(cacheKey, response, AnalyticsCache.CACHE_TTL.BEST_SELLERS)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Best sellers API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch best sellers',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}