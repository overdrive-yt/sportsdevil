import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndRewardMilestones, getMilestoneProgress } from '@/lib/services/loyalty-milestone.service'

/**
 * POST /api/loyalty/milestone
 * Check for milestone achievements and generate automatic rewards
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with current loyalty points
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        loyaltyPoints: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for milestone achievements
    const milestoneResult = await checkAndRewardMilestones(user.id, user.loyaltyPoints)
    
    // Get milestone progress information
    const progressInfo = getMilestoneProgress(user.loyaltyPoints)

    return NextResponse.json({
      success: true,
      currentPoints: user.loyaltyPoints,
      newMilestones: milestoneResult.newMilestones,
      totalRewardsGenerated: milestoneResult.totalRewardsGenerated,
      progress: progressInfo,
      message: milestoneResult.totalRewardsGenerated > 0 
        ? `Congratulations! You've earned ${milestoneResult.totalRewardsGenerated} milestone reward(s)!`
        : 'No new milestone rewards at this time.'
    })

  } catch (error) {
    console.error('Error checking milestone rewards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/loyalty/milestone
 * Get milestone progress and history for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with current loyalty points
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        loyaltyPoints: true,
        milestoneRewards: {
          orderBy: { milestonePoints: 'asc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get milestone progress information
    const progressInfo = getMilestoneProgress(user.loyaltyPoints)

    return NextResponse.json({
      success: true,
      currentPoints: user.loyaltyPoints,
      milestoneHistory: user.milestoneRewards,
      progress: progressInfo
    })

  } catch (error) {
    console.error('Error fetching milestone information:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}