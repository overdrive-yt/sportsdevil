import { NextRequest, NextResponse } from 'next/server'
import { requireValidUser } from '../../../../lib/auth-validation'
import { prisma } from '../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Validate user session and database existence
    const validation = await requireValidUser(request)
    if (!validation.success) {
      return validation.response
    }

    // Get user with loyalty points (user is guaranteed to exist)
    const user = await prisma.user.findUnique({
      where: { email: validation.user?.email },
      select: {
        id: true,
        loyaltyPoints: true,
        totalSpent: true,
      }
    })

    // This should never happen now due to validation, but keep as safety check
    if (!user) {
      return NextResponse.json(
        { error: 'User data synchronization error' },
        { status: 500 }
      )
    }

    // Calculate redemption value (500 points = £5 voucher)
    const pointsValue = Math.floor(user.loyaltyPoints / 500) * 5
    const canRedeem = user.loyaltyPoints >= 500

    return NextResponse.json({
      loyaltyPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
      pointsValue,
      canRedeem,
      nextRewardAt: 500 - (user.loyaltyPoints % 500),
      redeemableAmount: Math.floor(user.loyaltyPoints / 500) * 5
    })

  } catch (error) {
    console.error('Error fetching loyalty balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}