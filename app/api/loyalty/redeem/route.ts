import { NextRequest, NextResponse } from 'next/server'
import { requireValidUser } from '@/lib/auth-validation'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Validate user session and database existence
    const validation = await requireValidUser(request)
    if (!validation.success) {
      return validation.response
    }

    const { pointsToRedeem } = await request.json()

    // Validate points amount
    if (!pointsToRedeem || pointsToRedeem < 500 || pointsToRedeem % 500 !== 0) {
      return NextResponse.json(
        { error: 'Invalid points amount. Must be in multiples of 500 points.' },
        { status: 400 }
      )
    }

    // Get user (guaranteed to exist due to validation)
    const user = await prisma.user.findUnique({
      where: { email: validation.user?.email },
      select: {
        id: true,
        loyaltyPoints: true,
        email: true,
        name: true
      }
    })

    // This should never happen now due to validation, but keep as safety check
    if (!user) {
      return NextResponse.json(
        { error: 'User data synchronization error' },
        { status: 500 }
      )
    }

    // Check if user has enough points
    if (user.loyaltyPoints < pointsToRedeem) {
      return NextResponse.json(
        { error: 'Insufficient loyalty points' },
        { status: 400 }
      )
    }

    // Calculate voucher value (500 points = £5)
    const voucherValue = (pointsToRedeem / 500) * 5

    // Generate unique voucher code
    const voucherCode = `SD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          loyaltyPoints: {
            decrement: pointsToRedeem
          }
        }
      })

      // Create loyalty transaction record
      const loyaltyTransaction = await tx.loyaltyTransaction.create({
        data: {
          userId: user.id,
          type: 'REDEEMED',
          points: -pointsToRedeem,
          description: `Redeemed ${pointsToRedeem} points for £${voucherValue} voucher (${voucherCode})`
        }
      })

      // Create coupon for the voucher
      const coupon = await tx.coupon.create({
        data: {
          code: voucherCode,
          description: `£${voucherValue} Loyalty Voucher - Redeemed ${pointsToRedeem} points`,
          discountType: 'FIXED_AMOUNT',
          discountValue: voucherValue,
          minimumAmount: 0,
          maximumDiscount: voucherValue,
          usageLimit: 1,
          usedCount: 0,
          isActive: true,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days validity
        }
      })

      return {
        updatedUser,
        loyaltyTransaction,
        coupon
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${pointsToRedeem} points for £${voucherValue} voucher`,
      voucher: {
        code: result.coupon.code,
        value: voucherValue,
        validUntil: result.coupon.validUntil,
        minimumAmount: Number(result.coupon.minimumAmount)
      },
      newBalance: result.updatedUser.loyaltyPoints,
      transactionId: result.loyaltyTransaction.id
    })

  } catch (error) {
    console.error('Error redeeming loyalty points:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}