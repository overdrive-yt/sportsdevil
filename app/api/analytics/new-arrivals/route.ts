import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { analyticsCache, CacheKeys, AnalyticsCache } from '@/lib/cache/analytics-cache'
import { serializePrice } from '@/lib/utils/price-formatting'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')
    const days = parseInt(searchParams.get('days') || '90')
    
    // Check cache first
    const cacheKey = CacheKeys.newArrivals(limit, days)
    const cached = analyticsCache.get(cacheKey)
    if (cached) {
      // Mark as cached and return
      const cachedResponse = { ...cached, meta: { ...cached.meta, cached: true } }
      return NextResponse.json(cachedResponse)
    }
    
    // Calculate cutoff date for "new" products (default: 90 days / 3 months)
    const newProductCutoff = new Date()
    newProductCutoff.setDate(newProductCutoff.getDate() - days)
    
    console.log(`🆕 Fetching new arrivals from database - Last ${days} days, Limit: ${limit}`)
    console.log(`📅 New product cutoff: ${newProductCutoff.toISOString()}`)
    
    // Query for products created within the time period OR marked as new
    const newArrivals = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        isNew: true,
        createdAt: true,
        updatedAt: true,
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
        OR: [
          // Products created within the time period
          {
            createdAt: {
              gte: newProductCutoff
            }
          },
          // Products manually marked as new
          {
            isNew: true
          }
        ]
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      take: limit
    })
    
    // Calculate how "new" each product is
    const enrichedNewArrivals = newArrivals.map(product => {
      const daysSinceCreated = Math.floor((Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const isRecentlyCreated = daysSinceCreated <= days
      const shouldAutoExpire = daysSinceCreated > days && product.isNew
      
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: serializePrice(product.price),
        originalPrice: product.originalPrice ? serializePrice(product.originalPrice) : null,
        primaryImage: product.images[0] || null,
        category: product.productCategories[0]?.category || null,
        newStatus: {
          isNew: product.isNew,
          isRecentlyCreated,
          daysSinceCreated,
          shouldAutoExpire, // Flag for products that should have isNew removed
          createdAt: product.createdAt,
          isManuallyMarked: product.isNew && !isRecentlyCreated
        }
      }
    })
    
    console.log(`🆕 Found ${enrichedNewArrivals.length} new arrivals:`)
    enrichedNewArrivals.forEach((product, index) => {
      const status = product.newStatus
      console.log(`${index + 1}. ${product.name} - ${status.daysSinceCreated} days old (${status.isManuallyMarked ? 'Manual' : 'Auto'}${status.shouldAutoExpire ? ' - Should Expire' : ''})`)
    })
    
    // Update products that should auto-expire their "new" status
    const productsToExpire = enrichedNewArrivals.filter(p => p.newStatus.shouldAutoExpire)
    if (productsToExpire.length > 0) {
      console.log(`🔄 Auto-expiring "new" status for ${productsToExpire.length} products`)
      
      await prisma.product.updateMany({
        where: {
          id: {
            in: productsToExpire.map(p => p.id)
          }
        },
        data: {
          isNew: false
        }
      })
      
      // Update the returned data to reflect the change
      productsToExpire.forEach(product => {
        product.newStatus.isNew = false
        console.log(`   - Expired: ${product.name}`)
      })
    }
    
    // Filter out expired products from results
    const activeNewArrivals = enrichedNewArrivals.filter(p => 
      p.newStatus.isRecentlyCreated || (p.newStatus.isNew && !p.newStatus.shouldAutoExpire)
    )
    
    const response = {
      success: true,
      data: activeNewArrivals,
      meta: {
        total: activeNewArrivals.length,
        period: `${days} days`,
        autoExpiredCount: productsToExpire.length,
        breakdown: {
          recentlyCreated: activeNewArrivals.filter(p => p.newStatus.isRecentlyCreated).length,
          manuallyMarked: activeNewArrivals.filter(p => p.newStatus.isManuallyMarked && p.newStatus.isNew).length
        },
        cached: false,
        timestamp: new Date().toISOString()
      }
    }
    
    // Cache the response (shorter TTL since this can change frequently due to auto-expiry)
    analyticsCache.set(cacheKey, response, AnalyticsCache.CACHE_TTL.NEW_ARRIVALS)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ New arrivals API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch new arrivals',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}