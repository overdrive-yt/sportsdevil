import { prisma } from '../prisma'
import { User, MilestoneReward, Coupon } from '@prisma/client'

interface MilestoneConfig {
  points: number
  rewardValue: number
  rewardType: 'VOUCHER'
}

// Define milestone configurations (500, 1000, 1500, 2000, etc.)
const MILESTONE_CONFIGS: MilestoneConfig[] = [
  { points: 500, rewardValue: 5.00, rewardType: 'VOUCHER' },   // £5 voucher
  { points: 1000, rewardValue: 10.00, rewardType: 'VOUCHER' }, // £10 voucher
  { points: 1500, rewardValue: 7.50, rewardType: 'VOUCHER' },  // £7.50 voucher
  { points: 2000, rewardValue: 10.00, rewardType: 'VOUCHER' }, // £10 voucher
  { points: 2500, rewardValue: 12.50, rewardType: 'VOUCHER' }, // £12.50 voucher
  { points: 3000, rewardValue: 15.00, rewardType: 'VOUCHER' }, // £15 voucher
  { points: 4000, rewardValue: 20.00, rewardType: 'VOUCHER' }, // £20 voucher
  { points: 5000, rewardValue: 25.00, rewardType: 'VOUCHER' }, // £25 voucher
]

/**
 * Generate a unique, secure voucher code for milestone rewards
 */
function generateMilestoneVoucherCode(userId: string, milestonePoints: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `MILESTONE${milestonePoints}-${userId.slice(-4)}-${random}`
}

/**
 * Check if user has already received a reward for this milestone
 */
async function hasReceivedMilestoneReward(userId: string, milestonePoints: number): Promise<boolean> {
  const existingReward = await prisma.milestoneReward.findUnique({
    where: {
      userId_milestonePoints: {
        userId,
        milestonePoints
      }
    }
  })
  
  return !!existingReward
}

/**
 * Create a milestone reward voucher
 */
async function createMilestoneVoucher(
  userId: string, 
  milestoneConfig: MilestoneConfig,
  voucherCode: string
): Promise<Coupon> {
  return await prisma.coupon.create({
    data: {
      code: voucherCode,
      description: `£${milestoneConfig.rewardValue} Milestone Reward - ${milestoneConfig.points} points achieved`,
      discountType: 'FIXED_AMOUNT',
      discountValue: milestoneConfig.rewardValue,
      minimumAmount: 0,
      maximumDiscount: milestoneConfig.rewardValue,
      usageLimit: 1, // Single use only
      usedCount: 0,
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year validity
    }
  })
}

/**
 * Record milestone reward in database
 */
async function recordMilestoneReward(
  userId: string,
  milestoneConfig: MilestoneConfig,
  voucherCode: string
): Promise<MilestoneReward> {
  return await prisma.milestoneReward.create({
    data: {
      userId,
      milestonePoints: milestoneConfig.points,
      rewardType: milestoneConfig.rewardType,
      rewardValue: milestoneConfig.rewardValue,
      voucherCode
    }
  })
}

/**
 * Check for milestone achievements and generate rewards
 */
export async function checkAndRewardMilestones(userId: string, currentPoints: number): Promise<{
  newMilestones: Array<{
    points: number
    voucherCode: string
    rewardValue: number
  }>
  totalRewardsGenerated: number
}> {
  const newMilestones: Array<{
    points: number
    voucherCode: string
    rewardValue: number
  }> = []

  // Find all milestones the user has reached
  const reachedMilestones = MILESTONE_CONFIGS.filter(config => currentPoints >= config.points)

  for (const milestone of reachedMilestones) {
    // Check if user already received this milestone reward
    const alreadyRewarded = await hasReceivedMilestoneReward(userId, milestone.points)
    
    if (!alreadyRewarded) {
      try {
        // Generate unique voucher code
        const voucherCode = generateMilestoneVoucherCode(userId, milestone.points)
        
        // Use transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
          // Create the voucher
          await createMilestoneVoucher(userId, milestone, voucherCode)
          
          // Record the milestone reward
          await recordMilestoneReward(userId, milestone, voucherCode)
        })

        newMilestones.push({
          points: milestone.points,
          voucherCode,
          rewardValue: milestone.rewardValue
        })
      } catch (error) {
        console.error(`Error creating milestone reward for user ${userId}, milestone ${milestone.points}:`, error)
        // Continue with other milestones even if one fails
      }
    }
  }

  return {
    newMilestones,
    totalRewardsGenerated: newMilestones.length
  }
}

/**
 * Get all milestone rewards for a user
 */
export async function getUserMilestoneRewards(userId: string): Promise<MilestoneReward[]> {
  return await prisma.milestoneReward.findMany({
    where: { userId },
    orderBy: { milestonePoints: 'asc' }
  })
}

/**
 * Get next milestone information for a user
 */
export function getNextMilestone(currentPoints: number): MilestoneConfig | null {
  const nextMilestone = MILESTONE_CONFIGS.find(config => currentPoints < config.points)
  return nextMilestone || null
}

/**
 * Calculate progress to next milestone
 */
export function getMilestoneProgress(currentPoints: number): {
  currentMilestone: MilestoneConfig | null
  nextMilestone: MilestoneConfig | null
  pointsToNext: number
  progressPercentage: number
} {
  const nextMilestone = getNextMilestone(currentPoints)
  const currentMilestone = MILESTONE_CONFIGS
    .filter(config => currentPoints >= config.points)
    .pop() || null

  if (!nextMilestone) {
    return {
      currentMilestone,
      nextMilestone: null,
      pointsToNext: 0,
      progressPercentage: 100
    }
  }

  const previousMilestonePoints = currentMilestone?.points || 0
  const pointsToNext = nextMilestone.points - currentPoints
  const milestoneRange = nextMilestone.points - previousMilestonePoints
  const pointsInRange = currentPoints - previousMilestonePoints
  const progressPercentage = Math.round((pointsInRange / milestoneRange) * 100)

  return {
    currentMilestone,
    nextMilestone,
    pointsToNext,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage))
  }
}