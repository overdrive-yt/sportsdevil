import { prisma } from './prisma'

export async function testDatabaseConnection() {
  try {
    // Test the connection by counting users
    const userCount = await prisma.user.count()
    console.log('✅ Database connection successful!')
    console.log(`📊 Current user count: ${userCount}`)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}