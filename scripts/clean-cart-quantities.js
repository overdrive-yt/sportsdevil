/**
 * Script to clean up suspicious cart quantities in the database
 * This will reset any cart items with quantities > 10 to quantity = 1
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanCartQuantities() {
  console.log('🧹 Starting cart quantity cleanup...')
  
  try {
    // Find all cart items with suspicious quantities
    const suspiciousItems = await prisma.cartItem.findMany({
      where: {
        quantity: {
          gt: 10
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    })

    if (suspiciousItems.length === 0) {
      console.log('✅ No suspicious quantities found - cart is clean!')
      return
    }

    console.log(`🚨 Found ${suspiciousItems.length} cart items with suspicious quantities:`)
    
    for (const item of suspiciousItems) {
      console.log(`   - ${item.product.name}: ${item.quantity} (will reset to 1)`)
    }

    // Reset all suspicious quantities to 1
    const updateResult = await prisma.cartItem.updateMany({
      where: {
        quantity: {
          gt: 10
        }
      },
      data: {
        quantity: 1
      }
    })

    console.log(`✅ Successfully reset ${updateResult.count} cart items to quantity 1`)
    console.log('🎯 Cart cleanup completed!')

  } catch (error) {
    console.error('❌ Cart cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanCartQuantities()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })