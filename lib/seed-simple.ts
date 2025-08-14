import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    console.log('🌱 Starting simple database seeding...')

    // Check if data already exists
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      console.log('📊 Database already contains data, skipping seed')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('@dminsports2024!', 12)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Sports Devil Admin',
        email: 'admin@sportsdevil.co.uk',
        password: hashedPassword,
        phone: '+44 121 123 4567',
        address: '309 Kingstanding Rd',
        city: 'Birmingham',
        postalCode: 'B44 9TH',
        country: 'UK',
      },
    })

    console.log('✅ Created admin user:', adminUser.email)
    console.log('🎉 Simple database seeding completed!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}