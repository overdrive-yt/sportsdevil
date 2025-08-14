import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create Sample Products
 * 
 * Creates a comprehensive product catalog to test the preservation system:
 * - Categories and subcategories
 * - Products with full specifications
 * - Product images and attributes
 * - Sample reviews and ratings
 */

async function createSampleProducts() {
  try {
    console.log('📦 Creating sample product catalog...')

    // Create categories
    console.log('\n📁 Creating product categories...')
    
    const batsCategory = await prisma.category.upsert({
      where: { slug: 'cricket-bats' },
      update: {},
      create: {
        name: 'Cricket Bats',
        slug: 'cricket-bats',
        description: 'Professional cricket bats for all skill levels',
        isActive: true,
        sortOrder: 1,
        attributeTemplate: JSON.stringify(['bat-size', 'weight', 'grade', 'hand-preference'])
      }
    })

    const protectionCategory = await prisma.category.upsert({
      where: { slug: 'protection' },
      update: {},
      create: {
        name: 'Protection',
        slug: 'protection',
        description: 'Cricket protective gear and equipment',
        isActive: true,
        sortOrder: 2,
        attributeTemplate: JSON.stringify(['size', 'material', 'certification'])
      }
    })

    const wicketKeepingCategory = await prisma.category.upsert({
      where: { slug: 'wicket-keeping' },
      update: {},
      create: {
        name: 'Wicket Keeping',
        slug: 'wicket-keeping',
        description: 'Wicket keeping equipment and gear',
        isActive: true,
        sortOrder: 3,
        attributeTemplate: JSON.stringify(['size', 'material', 'grip-type'])
      }
    })

    console.log(`   ✅ Created ${3} categories`)

    // Create attributes
    console.log('\n🏷️ Creating product attributes...')
    
    const batSizeAttr = await prisma.attribute.upsert({
      where: { slug: 'bat-size' },
      update: {},
      create: {
        name: 'Bat Size',
        slug: 'bat-size',
        type: 'SELECT',
        options: JSON.stringify(['Short Handle', 'Long Handle', 'Junior Size 1', 'Junior Size 2', 'Junior Size 3', 'Junior Size 4', 'Junior Size 5', 'Junior Size 6']),
        isRequired: true,
        sortOrder: 1,
        categoryId: batsCategory.id
      }
    })

    const weightAttr = await prisma.attribute.upsert({
      where: { slug: 'weight' },
      update: {},
      create: {
        name: 'Weight',
        slug: 'weight',
        type: 'SELECT',
        options: JSON.stringify(['2lb 7oz - 2lb 9oz', '2lb 8oz - 2lb 10oz', '2lb 9oz - 2lb 11oz', '2lb 10oz - 2lb 12oz', '2lb 11oz - 2lb 13oz']),
        isRequired: true,
        sortOrder: 2,
        categoryId: batsCategory.id
      }
    })

    const gradeAttr = await prisma.attribute.upsert({
      where: { slug: 'grade' },
      update: {},
      create: {
        name: 'Grade',
        slug: 'grade',
        type: 'SELECT',
        options: JSON.stringify(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Player Edition']),
        isRequired: true,
        sortOrder: 3,
        categoryId: batsCategory.id
      }
    })

    const sizeAttr = await prisma.attribute.upsert({
      where: { slug: 'size' },
      update: {},
      create: {
        name: 'Size',
        slug: 'size',
        type: 'SELECT',
        options: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
        isRequired: true,
        sortOrder: 1
      }
    })

    console.log(`   ✅ Created ${4} attributes`)

    // Create sample products
    console.log('\n📦 Creating sample products...')

    const products = [
      {
        name: 'Gray-Nicolls Powerbow 6X 101 Cricket Bat',
        slug: 'gray-nicolls-powerbow-6x-101',
        description: 'The Powerbow 6X 101 features our innovative Powerbow design with a low sweet spot and excellent pickup. Made from premium English willow with traditional pressed face and edges.',
        shortDescription: 'Premium English willow bat with innovative Powerbow design',
        price: 299.99,
        originalPrice: 349.99,
        sku: 'GN-PB6X-101',
        stockQuantity: 15,
        isActive: true,
        isFeatured: true,
        isNew: false,
        weight: 2.65,
        dimensions: '96.5cm x 10.8cm x 6.5cm',
        colors: JSON.stringify(['Natural Willow']),
        sizes: JSON.stringify(['Short Handle', 'Long Handle']),
        tags: JSON.stringify(['english-willow', 'powerbow', 'professional', 'gray-nicolls']),
        metaTitle: 'Gray-Nicolls Powerbow 6X 101 Cricket Bat | Premium English Willow',
        metaDescription: 'Professional cricket bat with innovative Powerbow design, low sweet spot, and excellent pickup. Made from premium English willow.'
      },
      {
        name: 'Kookaburra Ghost Pro 1000 Cricket Bat',
        slug: 'kookaburra-ghost-pro-1000',
        description: 'The Ghost Pro 1000 is crafted from premium English willow with traditional pressing. Features a mid-middle position for exceptional power hitting and precise shot placement.',
        shortDescription: 'Premium English willow bat with mid-middle sweet spot',
        price: 199.99,
        originalPrice: 249.99,
        sku: 'KB-GP1000',
        stockQuantity: 22,
        isActive: true,
        isFeatured: true,
        isNew: true,
        weight: 2.70,
        dimensions: '96.5cm x 10.8cm x 6.5cm',
        colors: JSON.stringify(['Natural Willow']),
        sizes: JSON.stringify(['Short Handle', 'Long Handle']),
        tags: JSON.stringify(['english-willow', 'ghost', 'professional', 'kookaburra']),
        metaTitle: 'Kookaburra Ghost Pro 1000 Cricket Bat | English Willow',
        metaDescription: 'Professional cricket bat with mid-middle sweet spot for exceptional power hitting. Made from premium English willow.'
      },
      {
        name: 'Masuri Vision Series Test Cricket Helmet',
        slug: 'masuri-vision-series-test-helmet',
        description: 'The Masuri Vision Series Test helmet offers maximum protection with superior visibility. Features titanium grille, advanced ventilation system, and comfortable padding.',
        shortDescription: 'Professional cricket helmet with titanium grille and superior protection',
        price: 149.99,
        sku: 'MAS-VST-001',
        stockQuantity: 35,
        isActive: true,
        isFeatured: false,
        isNew: false,
        colors: JSON.stringify(['Navy Blue', 'Maroon', 'Green']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        tags: JSON.stringify(['helmet', 'protection', 'titanium', 'masuri']),
        metaTitle: 'Masuri Vision Series Test Cricket Helmet | Professional Protection',
        metaDescription: 'Professional cricket helmet with titanium grille, advanced ventilation, and superior protection for all levels.'
      },
      {
        name: 'Gray-Nicolls Ultimate WK Gloves',
        slug: 'gray-nicolls-ultimate-wk-gloves',
        description: 'Professional wicket keeping gloves with premium leather palms, advanced shock absorption, and ergonomic design for superior catching and protection.',
        shortDescription: 'Professional WK gloves with premium leather and shock absorption',
        price: 89.99,
        originalPrice: 109.99,
        sku: 'GN-ULT-WK',
        stockQuantity: 28,
        isActive: true,
        isFeatured: true,
        isNew: false,
        colors: JSON.stringify(['Black/Red', 'White/Blue']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        tags: JSON.stringify(['wicket-keeping', 'gloves', 'professional', 'gray-nicolls']),
        metaTitle: 'Gray-Nicolls Ultimate WK Gloves | Professional Wicket Keeping',
        metaDescription: 'Professional wicket keeping gloves with premium leather, shock absorption, and ergonomic design.'
      },
      {
        name: 'Gunn & Moore Icon DXM 909 Cricket Bat',
        slug: 'gunn-moore-icon-dxm-909',
        description: 'The Icon DXM 909 features premium English willow with a low-middle sweet spot. Hand-selected blade with traditional pressing for exceptional performance.',
        shortDescription: 'Premium English willow bat with low-middle sweet spot',
        price: 259.99,
        sku: 'GM-ICON-909',
        stockQuantity: 18,
        isActive: true,
        isFeatured: false,
        isNew: true,
        weight: 2.68,
        colors: JSON.stringify(['Natural Willow']),
        sizes: JSON.stringify(['Short Handle', 'Long Handle']),
        tags: JSON.stringify(['english-willow', 'icon', 'professional', 'gunn-moore']),
        metaTitle: 'Gunn & Moore Icon DXM 909 Cricket Bat | English Willow',
        metaDescription: 'Professional cricket bat with premium English willow and low-middle sweet spot for exceptional performance.'
      }
    ]

    const createdProducts = []
    const productCategories = [
      { productIndex: 0, categoryId: batsCategory.id },     // Gray-Nicolls Powerbow
      { productIndex: 1, categoryId: batsCategory.id },     // Kookaburra Ghost
      { productIndex: 2, categoryId: protectionCategory.id }, // Masuri Helmet
      { productIndex: 3, categoryId: wicketKeepingCategory.id }, // GN WK Gloves
      { productIndex: 4, categoryId: batsCategory.id },     // Gunn & Moore Icon
    ]

    for (let i = 0; i < products.length; i++) {
      const productData = products[i]
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: productData,
        create: productData
      })
      createdProducts.push(product)

      // Create product categories
      const categoryMapping = productCategories[i]
      await prisma.productCategory.upsert({
        where: { 
          productId_categoryId: { 
            productId: product.id, 
            categoryId: categoryMapping.categoryId 
          } 
        },
        update: {},
        create: {
          productId: product.id,
          categoryId: categoryMapping.categoryId,
          isPrimary: true,
          sortOrder: 0
        }
      })

      // Add product images
      await prisma.productImage.upsert({
        where: { id: `${product.id}-primary` },
        update: {},
        create: {
          id: `${product.id}-primary`,
          url: `/images/products/${productData.slug}-main.webp`,
          alt: `${product.name} - Main Image`,
          isPrimary: true,
          sortOrder: 0,
          productId: product.id
        }
      })

      console.log(`   ✅ Created product: ${product.name}`)
    }

    // Create sample reviews
    console.log('\n⭐ Creating sample reviews...')
    
    const users = await prisma.user.findMany()
    if (users.length > 0) {
      const sampleReviews = [
        {
          productId: createdProducts[0].id,
          userId: users[0].id,
          rating: 5,
          title: 'Excellent bat, great pickup!',
          content: 'This Gray-Nicolls Powerbow 6X is fantastic. The pickup is incredibly light for such a powerful bat. Highly recommend for serious players.',
          verifiedPurchase: true
        },
        {
          productId: createdProducts[1].id,
          userId: users[1]?.id || users[0].id,
          rating: 4,
          title: 'Good quality, value for money',
          content: 'The Kookaburra Ghost Pro 1000 is a solid bat with good middle. Great value for the price point.',
          verifiedPurchase: true
        },
        {
          productId: createdProducts[2].id,
          userId: users[2]?.id || users[0].id,
          rating: 5,
          title: 'Best helmet I\'ve owned',
          content: 'The Masuri Vision Series helmet is incredibly comfortable and provides excellent protection. The visibility is outstanding.',
          verifiedPurchase: true
        }
      ]

      for (const reviewData of sampleReviews) {
        await prisma.review.upsert({
          where: { 
            id: `review-${reviewData.productId}-${reviewData.userId}`
          },
          update: {},
          create: {
            id: `review-${reviewData.productId}-${reviewData.userId}`,
            ...reviewData
          }
        })
      }
      console.log(`   ✅ Created ${sampleReviews.length} sample reviews`)
    }

    console.log('\n🎉 Sample product catalog created successfully!')
    console.log('📊 Catalog summary:')
    console.log(`   📁 ${3} categories`)
    console.log(`   📦 ${createdProducts.length} products`)
    console.log(`   🏷️ ${4} product attributes`)
    console.log(`   ⭐ ${users.length > 0 ? 3 : 0} customer reviews`)
    console.log('\n🔒 All product data will now persist through database resets!')

  } catch (error) {
    console.error('❌ Error creating sample products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createSampleProducts()
    .then(() => {
      console.log('\n🎯 Sample product catalog ready for testing!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Sample product creation failed:', error)
      process.exit(1)
    })
}

export { createSampleProducts }