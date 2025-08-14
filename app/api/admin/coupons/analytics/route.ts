import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/coupons/analytics - Overall coupon analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const couponId = searchParams.get('couponId')

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // Overall statistics
    const totalCoupons = await prisma.coupon.count()
    const activeCoupons = await prisma.coupon.count({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      }
    })

    // Usage statistics
    const usageStats = await prisma.couponUsage.aggregate({
      where: {
        ...(couponId && { couponId }),
        ...(Object.keys(dateFilter).length > 0 && { usedAt: dateFilter })
      },
      _count: true,
      _sum: {
        discountAmount: true,
        orderTotal: true
      }
    })

    // Most used coupons
    const topCoupons = await prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        description: true,
        _count: {
          select: { couponUsages: true }
        }
      },
      orderBy: {
        couponUsages: { _count: 'desc' }
      },
      take: 10
    })

    // Device breakdown
    const deviceBreakdown = await prisma.couponUsage.groupBy({
      by: ['deviceType'],
      where: {
        ...(couponId && { couponId }),
        ...(Object.keys(dateFilter).length > 0 && { usedAt: dateFilter }),
        deviceType: { not: null }
      },
      _count: true
    })

    // Time-based usage patterns (hourly)
    const hourlyUsage = await prisma.$queryRaw`
      SELECT 
        strftime('%H', usedAt) as hour,
        COUNT(*) as count
      FROM coupon_usage
      WHERE ${couponId ? `couponId = ${couponId} AND` : ''} 
        usedAt >= ${dateFilter.gte || '2024-01-01'}
        AND usedAt <= ${dateFilter.lte || new Date()}
      GROUP BY hour
      ORDER BY hour
    `

    // Day of week patterns
    const dayOfWeekUsage = await prisma.$queryRaw`
      SELECT 
        CASE strftime('%w', usedAt)
          WHEN '0' THEN 'Sunday'
          WHEN '1' THEN 'Monday'
          WHEN '2' THEN 'Tuesday'
          WHEN '3' THEN 'Wednesday'
          WHEN '4' THEN 'Thursday'
          WHEN '5' THEN 'Friday'
          WHEN '6' THEN 'Saturday'
        END as dayOfWeek,
        COUNT(*) as count
      FROM coupon_usage
      WHERE ${couponId ? `couponId = ${couponId} AND` : ''} 
        usedAt >= ${dateFilter.gte || '2024-01-01'}
        AND usedAt <= ${dateFilter.lte || new Date()}
      GROUP BY dayOfWeek
      ORDER BY strftime('%w', usedAt)
    `

    // Revenue impact
    const revenueImpact = Number(usageStats._sum.orderTotal) || 0
    const totalDiscount = Number(usageStats._sum.discountAmount) || 0
    const conversionRate = usageStats._count > 0 ? 
      ((usageStats._count / activeCoupons) * 100).toFixed(2) : 0

    return NextResponse.json({
      overview: {
        totalCoupons,
        activeCoupons,
        totalUsage: usageStats._count,
        totalRevenue: revenueImpact,
        totalDiscount,
        averageOrderValue: usageStats._count > 0 ? 
          (revenueImpact / usageStats._count).toFixed(2) : 0,
        conversionRate
      },
      topCoupons: topCoupons.map(c => ({
        id: c.id,
        code: c.code,
        description: c.description,
        uses: c._count.couponUsages
      })),
      deviceBreakdown: deviceBreakdown.map(d => ({
        device: d.deviceType || 'Unknown',
        count: d._count
      })),
      timePatterns: {
        hourly: hourlyUsage,
        dayOfWeek: dayOfWeekUsage
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}