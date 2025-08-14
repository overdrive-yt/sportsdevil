import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const batsCategory = await prisma.category.create({
    data: {
      name: 'Bats',
      slug: 'bats',
      description: 'Cricket bats for all skill levels',
      isActive: true,
      sortOrder: 1,
    },
  })

  const wicketKeepingCategory = await prisma.category.create({
    data: {
      name: 'Wicket Keeping',
      slug: 'wicket-keeping',
      description: 'Wicket keeping equipment and gear',
      isActive: true,
      sortOrder: 2,
    },
  })

  const juniorStockCategory = await prisma.category.create({
    data: {
      name: 'Junior Stock',
      slug: 'junior-stock', 
      description: 'Cricket equipment for junior players',
      isActive: true,
      sortOrder: 3,
    },
  })

  const extraProtectionCategory = await prisma.category.create({
    data: {
      name: 'Extra Protection',
      slug: 'extra-protection',
      description: 'Protective cricket gear and equipment',
      isActive: true,
      sortOrder: 4,
    },
  })

  // Create sample products
  const sampleProducts = [
    {
      name: 'Premium Cricket Helmet',
      slug: 'premium-cricket-helmet',
      description: 'Professional grade cricket helmet with superior protection and comfort',
      shortDescription: 'High-quality cricket helmet for maximum safety',
      price: 149.99,
      originalPrice: 199.99,
      sku: 'PCH-001',
      stockQuantity: 25,
      isActive: true,
      isFeatured: true,
      isNew: false,
      colors: JSON.stringify(['Black', 'White', 'Blue']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['helmet', 'protection', 'cricket']),
      categoryId: extraProtectionCategory.id,
    },
    {
      name: 'Elite Cricket Bat',
      slug: 'elite-cricket-bat',
      description: 'Professional cricket bat made from premium English willow',
      shortDescription: 'High-performance cricket bat for serious players',
      price: 299.99,
      sku: 'ECB-001', 
      stockQuantity: 15,
      isActive: true,
      isFeatured: true,
      isNew: true,
      colors: JSON.stringify(['Natural', 'Stained']),
      sizes: JSON.stringify(['Short Handle', 'Long Handle']),
      tags: JSON.stringify(['bat', 'willow', 'professional']),
      categoryId: batsCategory.id,
    },
    {
      name: 'Professional Wicket Keeping Gloves',
      slug: 'professional-wicket-keeping-gloves',
      description: 'Premium wicket keeping gloves with excellent grip and protection',
      shortDescription: 'Professional WK gloves for superior performance',
      price: 79.99,
      originalPrice: 119.99,
      sku: 'WKG-001',
      stockQuantity: 30,
      isActive: true,
      isFeatured: false,
      isNew: false,
      colors: JSON.stringify(['Black', 'White']),
      sizes: JSON.stringify(['S', 'M', 'L']),
      tags: JSON.stringify(['gloves', 'wicket-keeping', 'professional']),
      categoryId: wicketKeepingCategory.id,
    },
    {
      name: 'Junior Cricket Bat',
      slug: 'junior-cricket-bat',
      description: 'Lightweight cricket bat designed specifically for junior players',
      shortDescription: 'Perfect cricket bat for young players',
      price: 49.99,
      sku: 'JCB-001',
      stockQuantity: 40,
      isActive: true,
      isFeatured: false,
      isNew: true,
      colors: JSON.stringify(['Natural']),
      sizes: JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6']),
      tags: JSON.stringify(['junior', 'bat', 'youth']),
      categoryId: juniorStockCategory.id,
    },
    {
      name: 'Batting Gloves Pro',
      slug: 'batting-gloves-pro',
      description: 'Professional batting gloves with enhanced grip and protection',
      shortDescription: 'High-quality batting gloves for superior grip',
      price: 34.99,
      originalPrice: 49.99,
      sku: 'BGP-001',
      stockQuantity: 50,
      isActive: true,
      isFeatured: true,
      isNew: false,
      colors: JSON.stringify(['Black', 'White', 'Red']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      tags: JSON.stringify(['gloves', 'batting', 'protection']),
      categoryId: extraProtectionCategory.id,
    }
  ]

  // Create products with images
  for (const productData of sampleProducts) {
    const product = await prisma.product.create({
      data: productData,
    })

    // Add sample image for each product
    await prisma.productImage.create({
      data: {
        url: '/placeholder.svg?height=300&width=300',
        alt: `${product.name} image`,
        isPrimary: true,
        sortOrder: 0,
        productId: product.id,
      },
    })

    console.log(`✅ Created product: ${product.name}`)
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
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

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const testCustomer = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john@example.com',
      password: customerPassword,
      phone: '+44 121 987 6543',
    },
  })

  // Essential Coupon: FIRST7 (always persists through resets)
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
      description: '7% off your first order - New customer special',
      discountType: 'PERCENTAGE',
      discountValue: 7,
      minimumAmount: 25.00,
      maximumDiscount: 50.00,
      usageLimit: 1000,
      usedCount: 0,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
    },
  })

  console.log('✅ Created admin user:', adminUser.email)
  console.log('✅ Created test customer:', testCustomer.email)
  console.log(`✅ FIRST7 coupon ready: ${first7Coupon.code}`)
  console.log(`   Usage: ${first7Coupon.usedCount}/${first7Coupon.usageLimit} (preserved)`)
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })