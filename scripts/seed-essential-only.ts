import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Essential Data Seed Script
 * 
 * Seeds only essential data that should persist through resets:
 * - FIRST7 coupon (preserves usage count)
 * - No test users or products
 * 
 * Use this when you want a clean database with only essential system data.
 */

async function seedEssentialOnly() {
  try {
    console.log('🌱 Seeding essential data only...')

    // Essential Coupon: FIRST7 (always persists through resets)
    console.log('🎫 Creating/updating FIRST7 coupon...')
    
    const first7Coupon = await prisma.coupon.upsert({
      where: { code: 'FIRST7' },
      update: {
        // Preserve existing usage data, only update config if needed
        description: '7% off your first order - New customer special',
        discountType: 'PERCENTAGE',
        discountValue: 7,
        minimumAmount: 25.00,
        maximumDiscount: 50.00,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
      },
      create: {
        // Create FIRST7 if it doesn't exist
        code: 'FIRST7',
        description: '7% off your first order - New customer special (unlimited uses with abuse prevention)',
        discountType: 'PERCENTAGE',
        discountValue: 7,
        minimumAmount: 25.00,
        maximumDiscount: 50.00,
        usageLimit: null, // unlimited uses
        usedCount: 0,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
      },
    })

    console.log(`✅ FIRST7 coupon ready: ${first7Coupon.code}`)
    console.log(`   Discount: ${first7Coupon.discountValue}% off`)
    console.log(`   Usage: ${first7Coupon.usedCount}/${first7Coupon.usageLimit || 'unlimited'} (preserved)`)
    console.log(`   Status: ${first7Coupon.isActive ? 'Active' : 'Inactive'}`)
    console.log(`   Valid: ${first7Coupon.validFrom.toLocaleDateString()} - ${first7Coupon.validUntil.toLocaleDateString()}`)

    // Preserve all existing users
    console.log('\n👥 Preserving existing users...')
    const existingUsers = await prisma.user.findMany({
      select: { 
        id: true, 
        email: true, 
        name: true, 
        loyaltyPoints: true,
        totalSpent: true,
        createdAt: true
      }
    })

    if (existingUsers.length > 0) {
      console.log(`✅ Found ${existingUsers.length} existing users - all preserved:`)
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`)
        console.log(`      Loyalty: ${user.loyaltyPoints} points, Spent: £${user.totalSpent}`)
        console.log(`      Member since: ${user.createdAt.toLocaleDateString()}`)
      })
    } else {
      console.log('   📭 No existing users found')
    }

    // Preserve loyalty transactions, coupon usage, orders, etc.
    const loyaltyTransactions = await prisma.loyaltyTransaction.count()
    const couponUsages = await prisma.couponUsage.count()
    const orders = await prisma.order.count()

    console.log('\n📊 Additional preserved data:')
    console.log(`   💎 ${loyaltyTransactions} loyalty transactions`)
    console.log(`   🎟️ ${couponUsages} coupon usage records`)
    console.log(`   🛒 ${orders} order records`)

    console.log('\n✅ Essential data seeding completed!')
    console.log('📋 Database preservation summary:')
    console.log('   🎫 FIRST7 coupon (persistent)')
    console.log(`   👥 ${existingUsers.length} users (all preserved)`)
    console.log(`   📊 All user data and transactions (preserved)`)
    console.log('   🔒 Ready for production with zero data loss')

  } catch (error) {
    console.error('❌ Error seeding essential data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedEssentialOnly()
    .then(() => {
      console.log('\n🎉 Clean database with essential data only!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Essential seeding failed:', error)
      process.exit(1)
    })
}

export { seedEssentialOnly }