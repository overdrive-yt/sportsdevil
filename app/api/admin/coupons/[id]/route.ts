import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// V9.11.2: Update coupon validation schema
const updateCouponSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric').optional(),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']).optional(),
  discountValue: z.number().positive().optional(),
  minimumAmount: z.number().min(0).optional().nullable(),
  maximumDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  
  // V9.11.2 Enhanced fields
  template: z.string().optional().nullable(),
  campaignId: z.string().optional().nullable(),
  targetSegment: z.object({
    type: z.enum(['all', 'new', 'returning', 'vip', 'location', 'purchase_history']),
    criteria: z.any().optional()
  }).optional().nullable(),
  scheduleStart: z.string().datetime().optional().nullable(),
  scheduleEnd: z.string().datetime().optional().nullable(),
  timeRestrictions: z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    hoursOfDay: z.array(z.object({
      start: z.number().min(0).max(23),
      end: z.number().min(0).max(23)
    })).optional()
  }).optional().nullable(),
  maxUsesPerUser: z.number().int().positive().optional().nullable(),
  requiresAccount: z.boolean().optional(),
  stackable: z.boolean().optional(),
  priority: z.number().int().optional(),
  buyXQuantity: z.number().int().positive().optional().nullable(),
  getYQuantity: z.number().int().positive().optional().nullable(),
  applicableProducts: z.array(z.string()).optional().nullable(),
  applicableCategories: z.array(z.string()).optional().nullable()
})

// GET /api/admin/coupons/[id] - Get single coupon details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        campaign: true,
        couponUsages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                createdAt: true
              }
            }
          },
          orderBy: { usedAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            couponUsages: true
          }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Transform coupon data
    const transformedCoupon = {
      ...coupon,
      targetSegment: coupon.targetSegment ? JSON.parse(coupon.targetSegment) : null,
      timeRestrictions: coupon.timeRestrictions ? JSON.parse(coupon.timeRestrictions) : null,
      applicableProducts: coupon.applicableProducts ? JSON.parse(coupon.applicableProducts) : [],
      applicableCategories: coupon.applicableCategories ? JSON.parse(coupon.applicableCategories) : [],
      usageStats: {
        totalUses: coupon._count.couponUsages,
        remaining: coupon.usageLimit ? coupon.usageLimit - coupon._count.couponUsages : null,
        recentUses: coupon.couponUsages
      }
    }

    return NextResponse.json(transformedCoupon)
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

// PUT /api/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = updateCouponSchema.parse(body)
    
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    })
    
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // If changing code, check if new code already exists
    if (validatedData.code && validatedData.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: validatedData.code }
      })
      
      if (codeExists) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    // Only include fields that were provided
    if (validatedData.code !== undefined) updateData.code = validatedData.code
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.discountType !== undefined) updateData.discountType = validatedData.discountType
    if (validatedData.discountValue !== undefined) updateData.discountValue = validatedData.discountValue
    if (validatedData.minimumAmount !== undefined) updateData.minimumAmount = validatedData.minimumAmount
    if (validatedData.maximumDiscount !== undefined) updateData.maximumDiscount = validatedData.maximumDiscount
    if (validatedData.usageLimit !== undefined) updateData.usageLimit = validatedData.usageLimit
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.validFrom !== undefined) updateData.validFrom = new Date(validatedData.validFrom)
    if (validatedData.validUntil !== undefined) updateData.validUntil = new Date(validatedData.validUntil)
    
    // V9.11.2 Enhanced fields
    if (validatedData.template !== undefined) updateData.template = validatedData.template
    if (validatedData.campaignId !== undefined) updateData.campaignId = validatedData.campaignId
    if (validatedData.targetSegment !== undefined) {
      updateData.targetSegment = validatedData.targetSegment ? JSON.stringify(validatedData.targetSegment) : null
    }
    if (validatedData.scheduleStart !== undefined) {
      updateData.scheduleStart = validatedData.scheduleStart ? new Date(validatedData.scheduleStart) : null
    }
    if (validatedData.scheduleEnd !== undefined) {
      updateData.scheduleEnd = validatedData.scheduleEnd ? new Date(validatedData.scheduleEnd) : null
    }
    if (validatedData.timeRestrictions !== undefined) {
      updateData.timeRestrictions = validatedData.timeRestrictions ? JSON.stringify(validatedData.timeRestrictions) : null
    }
    if (validatedData.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = validatedData.maxUsesPerUser
    if (validatedData.requiresAccount !== undefined) updateData.requiresAccount = validatedData.requiresAccount
    if (validatedData.stackable !== undefined) updateData.stackable = validatedData.stackable
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.buyXQuantity !== undefined) updateData.buyXQuantity = validatedData.buyXQuantity
    if (validatedData.getYQuantity !== undefined) updateData.getYQuantity = validatedData.getYQuantity
    if (validatedData.applicableProducts !== undefined) {
      updateData.applicableProducts = validatedData.applicableProducts ? JSON.stringify(validatedData.applicableProducts) : null
    }
    if (validatedData.applicableCategories !== undefined) {
      updateData.applicableCategories = validatedData.applicableCategories ? JSON.stringify(validatedData.applicableCategories) : null
    }

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        campaign: true
      }
    })

    return NextResponse.json({
      message: 'Coupon updated successfully',
      coupon: {
        ...updatedCoupon,
        targetSegment: updatedCoupon.targetSegment ? JSON.parse(updatedCoupon.targetSegment) : null,
        timeRestrictions: updatedCoupon.timeRestrictions ? JSON.parse(updatedCoupon.timeRestrictions) : null,
        applicableProducts: updatedCoupon.applicableProducts ? JSON.parse(updatedCoupon.applicableProducts) : [],
        applicableCategories: updatedCoupon.applicableCategories ? JSON.parse(updatedCoupon.applicableCategories) : []
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error updating coupon:', error)
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if coupon exists and has usage
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            couponUsages: true
          }
        }
      }
    })
    
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    // Prevent deletion if coupon has been used
    if (coupon._count.couponUsages > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete coupon with usage history',
        details: `This coupon has been used ${coupon._count.couponUsages} times. Consider deactivating it instead.`
      }, { status: 400 })
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Coupon deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}