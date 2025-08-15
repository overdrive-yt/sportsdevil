import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// V9.11.2: Coupon validation schema
const createCouponSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
  discountValue: z.number().positive(),
  minimumAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  
  // V9.11.2 Enhanced fields
  template: z.string().optional(),
  campaignId: z.string().optional(),
  targetSegment: z.object({
    type: z.enum(['all', 'new', 'returning', 'vip', 'location', 'purchase_history']),
    criteria: z.any().optional()
  }).optional(),
  scheduleStart: z.string().datetime().optional(),
  scheduleEnd: z.string().datetime().optional(),
  timeRestrictions: z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    hoursOfDay: z.array(z.object({
      start: z.number().min(0).max(23),
      end: z.number().min(0).max(23)
    })).optional()
  }).optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  requiresAccount: z.boolean().default(true),
  stackable: z.boolean().default(false),
  priority: z.number().int().default(0),
  buyXQuantity: z.number().int().positive().optional(),
  getYQuantity: z.number().int().positive().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional()
})

// GET /api/admin/coupons - List all coupons with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // active, inactive, scheduled, expired
    const campaignId = searchParams.get('campaignId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause based on filters
    const where: any = {}
    
    if (status) {
      const now = new Date()
      switch(status) {
        case 'active':
          where.isActive = true
          where.validFrom = { lte: now }
          where.validUntil = { gte: now }
          break
        case 'inactive':
          where.isActive = false
          break
        case 'scheduled':
          where.scheduleStart = { gt: now }
          break
        case 'expired':
          where.validUntil = { lt: now }
          break
      }
    }

    if (campaignId) {
      where.campaignId = campaignId
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.coupon.count({ where })

    // Get coupons with pagination
    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        campaign: true,
        couponUsages: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Transform coupons to include usage stats
    const transformedCoupons = coupons.map(coupon => ({
      ...coupon,
      targetSegment: coupon.targetSegment ? JSON.parse(coupon.targetSegment) : null,
      timeRestrictions: coupon.timeRestrictions ? JSON.parse(coupon.timeRestrictions) : null,
      applicableProducts: coupon.applicableProducts ? JSON.parse(coupon.applicableProducts) : [],
      applicableCategories: coupon.applicableCategories ? JSON.parse(coupon.applicableCategories) : [],
      usageStats: {
        used: coupon.couponUsages.length,
        remaining: coupon.usageLimit ? coupon.usageLimit - coupon.couponUsages.length : null
      }
    }))

    return NextResponse.json({
      coupons: transformedCoupons,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = createCouponSchema.parse(body)
    
    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code }
    })
    
    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Create coupon with JSON stringified fields
    const coupon = await prisma.coupon.create({
      data: {
        code: validatedData.code,
        description: validatedData.description,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minimumAmount: validatedData.minimumAmount,
        maximumDiscount: validatedData.maximumDiscount,
        usageLimit: validatedData.usageLimit,
        isActive: validatedData.isActive,
        validFrom: new Date(validatedData.validFrom),
        validUntil: new Date(validatedData.validUntil),
        
        // V9.11.2 Enhanced fields
        template: validatedData.template,
        campaignId: validatedData.campaignId,
        targetSegment: validatedData.targetSegment ? JSON.stringify(validatedData.targetSegment) : null,
        scheduleStart: validatedData.scheduleStart ? new Date(validatedData.scheduleStart) : null,
        scheduleEnd: validatedData.scheduleEnd ? new Date(validatedData.scheduleEnd) : null,
        timeRestrictions: validatedData.timeRestrictions ? JSON.stringify(validatedData.timeRestrictions) : null,
        maxUsesPerUser: validatedData.maxUsesPerUser,
        requiresAccount: validatedData.requiresAccount,
        stackable: validatedData.stackable,
        priority: validatedData.priority,
        buyXQuantity: validatedData.buyXQuantity,
        getYQuantity: validatedData.getYQuantity,
        applicableProducts: validatedData.applicableProducts ? JSON.stringify(validatedData.applicableProducts) : null,
        applicableCategories: validatedData.applicableCategories ? JSON.stringify(validatedData.applicableCategories) : null
      }
    })

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon: {
        ...coupon,
        targetSegment: coupon.targetSegment ? JSON.parse(coupon.targetSegment) : null,
        timeRestrictions: coupon.timeRestrictions ? JSON.parse(coupon.timeRestrictions) : null,
        applicableProducts: coupon.applicableProducts ? JSON.parse(coupon.applicableProducts) : [],
        applicableCategories: coupon.applicableCategories ? JSON.parse(coupon.applicableCategories) : []
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}