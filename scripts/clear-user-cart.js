/**
 * Script to completely clear a user's cart for testing
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearUserCart() {
  console.log('🧹 Clearing user cart for testing...')
  
  try {
    // Find the user (assuming overdrive1612@gmail.com from logs)
    const user = await prisma.user.findUnique({
      where: {
        email: 'overdrive1612@gmail.com'
      }
    })

    if (!user) {
      console.log('❌ User not found with email: overdrive1612@gmail.com')
      return
    }

    console.log(`🔍 Found user: ${user.email} (ID: ${user.id})`)

    // Clear all cart items for this user
    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        userId: user.id
      }
    })

    console.log(`✅ Deleted ${deleteResult.count} cart items for user ${user.email}`)
    console.log('🎯 Cart completely cleared - ready for fresh testing!')

  } catch (error) {
    console.error('❌ Cart clear failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
clearUserCart()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })