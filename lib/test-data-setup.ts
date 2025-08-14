import { prisma } from '@/lib/prisma'

/**
 * Enhanced test data setup for Version 9.4.2 live verification
 * Creates realistic test orders for current logged-in user
 */
export async function setupTestData(userEmail: string) {
  try {
    console.log(`🔍 Setting up test data for user: ${userEmail}`)
    
    // Find the user and verify account
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        orders: true,
        loyaltyTransactions: true
      }
    })

    if (!user) {
      throw new Error(`User not found with email: ${userEmail}`)
    }

    console.log(`✅ User found: ${user.name || 'Unnamed'} (ID: ${user.id})`)
    console.log(`📅 Account created: ${user.createdAt.toLocaleDateString('en-GB')}`)
    
    // Check if test data already exists
    if (user.orders.length > 0) {
      console.log(`⚠️ User already has ${user.orders.length} orders. Cleaning up first...`)
      await cleanupTestData(userEmail)
    }

    // Step 1: Create/verify products exist in database
    console.log(`🏗️ Creating required products...`)
    
    const productData = [
      { name: 'Premium Sports Bat', slug: 'premium-sports-bat', price: 89.99, sku: 'PSB001', description: 'High-quality sports bat for professional players' },
      { name: 'Professional Batting Gloves', slug: 'professional-batting-gloves', price: 39.99, sku: 'PBG001', description: 'Professional-grade batting gloves with enhanced grip' },
      { name: 'Professional Sports Equipment Kit', slug: 'professional-sports-kit', price: 199.99, sku: 'PSK001', description: 'Complete professional sports equipment kit for athletes' },
      { name: 'Sports Equipment Ball Set', slug: 'sports-ball-set', price: 45.00, sku: 'SBS001', description: 'Professional sports ball set for training and matches' },
      { name: 'Athletic Footwear', slug: 'athletic-footwear', price: 44.50, sku: 'AF001', description: 'High-performance athletic footwear for sports' }
    ]

    const createdProducts: any[] = []
    for (const product of productData) {
      let existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug }
      })
      
      if (!existingProduct) {
        existingProduct = await prisma.product.create({
          data: {
            ...product,
            stockQuantity: 100,
            isActive: true,
            isFeatured: false
          }
        })
        console.log(`✅ Created product: ${product.name}`)
      } else {
        console.log(`ℹ️ Product exists: ${product.name}`)
      }
      createdProducts.push(existingProduct)
    }

    // Step 2: Create realistic test orders with different statuses
    console.log(`📦 Creating test orders...`)
    
    const currentDate = new Date()
    const testOrders = [
      {
        orderNumber: 'ORD-001',
        status: 'DELIVERED' as const,
        totalAmount: 129.99,
        subtotalAmount: 129.99,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        userId: user.id,
        shippingName: user.name || 'Test User',
        shippingEmail: user.email,
        shippingAddress: user.address || 'Test Address',
        shippingCity: user.city || 'Test City',
        shippingPostal: user.postalCode || 'TEST123',
        shippingCountry: user.country || 'UK',
        billingName: user.name || 'Test User',
        billingEmail: user.email,
        billingAddress: user.address || 'Test Address',
        billingCity: user.city || 'Test City',
        billingPostal: user.postalCode || 'TEST123',
        billingCountry: user.country || 'UK',
        paymentMethod: 'stripe',
        paymentStatus: 'COMPLETED' as const,
        items: [
          { productSlug: 'premium-sports-bat', quantity: 1, price: 89.99 },
          { productSlug: 'professional-batting-gloves', quantity: 1, price: 39.99 }
        ]
      },
      {
        orderNumber: 'ORD-002',
        status: 'PROCESSING' as const,
        totalAmount: 199.99,
        subtotalAmount: 199.99,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        userId: user.id,
        shippingName: user.name || 'Test User',
        shippingEmail: user.email,
        shippingAddress: user.address || 'Test Address',
        shippingCity: user.city || 'Test City',
        shippingPostal: user.postalCode || 'TEST123',
        shippingCountry: user.country || 'UK',
        billingName: user.name || 'Test User',
        billingEmail: user.email,
        billingAddress: user.address || 'Test Address',
        billingCity: user.city || 'Test City',
        billingPostal: user.postalCode || 'TEST123',
        billingCountry: user.country || 'UK',
        paymentMethod: 'stripe',
        paymentStatus: 'COMPLETED' as const,
        items: [
          { productSlug: 'professional-sports-kit', quantity: 1, price: 199.99 }
        ]
      },
      {
        orderNumber: 'ORD-003',
        status: 'SHIPPED' as const,
        totalAmount: 89.50,
        subtotalAmount: 89.50,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        userId: user.id,
        shippingName: user.name || 'Test User',
        shippingEmail: user.email,
        shippingAddress: user.address || 'Test Address',
        shippingCity: user.city || 'Test City',
        shippingPostal: user.postalCode || 'TEST123',
        shippingCountry: user.country || 'UK',
        billingName: user.name || 'Test User',
        billingEmail: user.email,
        billingAddress: user.address || 'Test Address',
        billingCity: user.city || 'Test City',
        billingPostal: user.postalCode || 'TEST123',
        billingCountry: user.country || 'UK',
        paymentMethod: 'stripe',
        paymentStatus: 'COMPLETED' as const,
        items: [
          { productSlug: 'sports-ball-set', quantity: 1, price: 45.00 },
          { productSlug: 'athletic-footwear', quantity: 1, price: 44.50 }
        ]
      }
    ]

    // Step 3: Create orders with proper relationships
    const createdOrders = []
    for (const orderData of testOrders) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: orderData.orderNumber }
      })

      if (existingOrder) {
        console.log(`⚠️ Order ${orderData.orderNumber} already exists, skipping`)
        continue
      }

      const { items, ...orderWithoutItems } = orderData
      
      // Create the order
      const order = await prisma.order.create({
        data: orderWithoutItems
      })

      console.log(`✅ Created order: ${order.orderNumber} (${order.status}) - £${order.totalAmount}`)

      // Create order items with product relationships
      for (const item of items) {
        const product = createdProducts.find(p => p.slug === item.productSlug)
        if (product) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: item.quantity,
              price: item.price
            }
          })
          console.log(`  → Added item: ${product.name} (£${item.price})`)
        } else {
          console.log(`  ❌ Product not found for slug: ${item.productSlug}`)
        }
      }

      createdOrders.push(order)
    }

    // Step 4: Calculate loyalty points and create individual transactions for each order
    console.log(`💎 Creating individual loyalty transactions for each order...`)
    
    const totalSpent = testOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    let totalLoyaltyPoints = 0
    
    // Create individual loyalty transactions for each order
    for (let i = 0; i < createdOrders.length; i++) {
      const order = createdOrders[i]
      const orderPoints = Math.floor(Number(order.totalAmount)) // 1:1 ratio, rounded down
      totalLoyaltyPoints += orderPoints
      
      // Get item names for this order
      const orderData = testOrders[i]
      const itemNames = orderData.items.map(item => {
        const product = createdProducts.find(p => p.slug === item.productSlug)
        return product?.name || item.productSlug
      }).join(' + ')
      
      await prisma.loyaltyTransaction.create({
        data: {
          userId: user.id,
          orderId: order.id,
          type: 'EARNED',
          points: orderPoints,
          description: `Order ${order.orderNumber}: ${itemNames}`
        }
      })
      
      console.log(`✅ Created loyalty transaction: ${order.orderNumber} - ${orderPoints} points for ${itemNames}`)
    }
    
    console.log(`📊 Total calculation: £${totalSpent} spent = ${totalLoyaltyPoints} loyalty points across ${createdOrders.length} orders`)

    // Update user with correct loyalty data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalSpent: totalSpent,
        loyaltyPoints: totalLoyaltyPoints
      }
    })

    console.log(`✅ Test data setup COMPLETE for user: ${userEmail}`)
    console.log(`🎯 Results Summary:`)
    console.log(`   • Orders Created: ${createdOrders.length}`)
    console.log(`   • Products Created: ${createdProducts.filter(p => p.createdAt > new Date(Date.now() - 60000)).length}`)
    console.log(`   • Total Spent: £${totalSpent}`)
    console.log(`   • Loyalty Points: ${totalLoyaltyPoints}`)
    console.log(`   • Account Updated: ${user.name || user.email}`)
    console.log(``)
    console.log(`🚀 Ready for verification! Refresh your dashboard to see:`)
    console.log(`   • ${totalLoyaltyPoints} loyalty points (not 850!)`)
    console.log(`   • £${totalSpent} total spent`)
    console.log(`   • ${createdOrders.length} orders with different statuses`)
    console.log(`   • Member since ${user.createdAt.getFullYear()}`)

    return {
      user,
      orders: createdOrders,
      products: createdProducts,
      totalSpent,
      loyaltyPoints: totalLoyaltyPoints,
      summary: {
        ordersCreated: createdOrders.length,
        productsCreated: createdProducts.length,
        totalSpent: totalSpent,
        loyaltyPoints: totalLoyaltyPoints,
        verificationReady: true
      }
    }

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
    throw error
  }
}

/**
 * Enhanced cleanup function for test data
 */
export async function cleanupTestData(userEmail: string) {
  try {
    console.log(`🧹 Cleaning up test data for user: ${userEmail}`)
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        orders: true,
        loyaltyTransactions: true
      }
    })

    if (!user) {
      console.log(`ℹ️ No user found with email: ${userEmail}`)
      return
    }

    console.log(`📊 Found ${user.orders.length} orders and ${user.loyaltyTransactions.length} loyalty transactions to clean`)

    // Delete in reverse order of creation to maintain referential integrity
    
    // 1. Delete loyalty transactions
    const deletedLoyalty = await prisma.loyaltyTransaction.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${deletedLoyalty.count} loyalty transactions`)

    // 2. Delete order items
    const deletedOrderItems = await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: user.id
        }
      }
    })
    console.log(`✅ Deleted ${deletedOrderItems.count} order items`)

    // 3. Delete orders
    const deletedOrders = await prisma.order.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${deletedOrders.count} orders`)

    // 4. Reset user loyalty data to clean state
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalSpent: 0,
        loyaltyPoints: 0
      }
    })
    console.log(`✅ Reset user loyalty data to 0`)

    console.log(`🧹 Cleanup COMPLETE for user: ${userEmail}`)
    console.log(`🎯 User account reset to clean state:`)
    console.log(`   • Orders: 0`)
    console.log(`   • Total Spent: £0`)
    console.log(`   • Loyalty Points: 0`)
    console.log(`   • Loyalty Transactions: 0`)

    return {
      success: true,
      deletedOrders: deletedOrders.count,
      deletedOrderItems: deletedOrderItems.count,
      deletedLoyaltyTransactions: deletedLoyalty.count,
      userReset: true
    }

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error)
    throw error
  }
}