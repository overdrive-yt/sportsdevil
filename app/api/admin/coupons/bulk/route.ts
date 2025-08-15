import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// V9.11.2: Bulk operations validation schema
const bulkOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'update']),
  couponIds: z.array(z.string()).min(1),
  updateData: z.object({
    isActive: z.boolean().optional(),
    campaignId: z.string().optional().nullable(),
    priority: z.number().int().optional()
  }).optional()
})

// POST /api/admin/coupons/bulk - Bulk operations on coupons
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = bulkOperationSchema.parse(body)
    const { operation, couponIds, updateData } = validatedData

    let result: any = {}

    switch (operation) {
      case 'activate':
        result = await prisma.coupon.updateMany({
          where: { id: { in: couponIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.coupon.updateMany({
          where: { id: { in: couponIds } },
          data: { isActive: false }
        })
        break

      case 'delete':
        // Check if any coupons have usage
        const couponsWithUsage = await prisma.coupon.findMany({
          where: {
            id: { in: couponIds },
            couponUsages: { some: {} }
          },
          select: {
            id: true,
            code: true,
            _count: {
              select: { couponUsages: true }
            }
          }
        })

        if (couponsWithUsage.length > 0) {
          return NextResponse.json({
            error: 'Cannot delete coupons with usage history',
            details: couponsWithUsage.map(c => ({
              code: c.code,
              uses: c._count.couponUsages
            }))
          }, { status: 400 })
        }

        result = await prisma.coupon.deleteMany({
          where: { id: { in: couponIds } }
        })
        break

      case 'update':
        if (!updateData) {
          return NextResponse.json({ error: 'Update data required for update operation' }, { status: 400 })
        }
        
        result = await prisma.coupon.updateMany({
          where: { id: { in: couponIds } },
          data: updateData
        })
        break
    }

    return NextResponse.json({
      message: `Bulk ${operation} completed successfully`,
      affected: result.count || 0
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error performing bulk operation:', error)
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 })
  }
}