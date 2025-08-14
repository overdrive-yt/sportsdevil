/**
 * Create Stripe Test Product - £1 Test Item
 * Creates a simple test product for Stripe payment testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createStripeTestProduct() {
  console.log('🧪 Creating Stripe Test Product...')
  
  try {
    // Create test product
    const testProduct = await prisma.product.create({
      data: {
        name: "STRIPE TEST ITEM - £1 Payment Test",
        slug: "stripe-test-item-1-pound",
        description: "This is a test product for testing Stripe payments. Complete purchase to test the checkout flow. This item will be removed after testing.",
        shortDescription: "£1 Stripe payment test item",
        price: 1.00,
        originalPrice: null, // No sale
        sku: "TEST-STRIPE-001",
        stockQuantity: 1, // Only 1 in stock for testing
        isActive: true,
        isFeatured: true, // Make it featured so it appears prominently
        isNew: true,
        weight: 0.1,
        dimensions: "Test Item",
        tags: '["test", "stripe", "payment", "checkout"]', // JSON string
        metaTitle: "Stripe Test Product - £1",
        metaDescription: "Test product for Stripe payment integration testing",
        status: "ACTIVE"
      }
    })

    console.log('✅ Stripe Test Product Created:')
    console.log(`   📦 Name: ${testProduct.name}`)
    console.log(`   💷 Price: £${testProduct.price}`)
    console.log(`   🔗 Slug: ${testProduct.slug}`)
    console.log(`   📊 SKU: ${testProduct.sku}`)
    console.log(`   📦 Stock: ${testProduct.stockQuantity}`)
    console.log(`   ⭐ Featured: ${testProduct.isFeatured ? 'Yes' : 'No'}`)
    console.log(`   ✨ New: ${testProduct.isNew ? 'Yes' : 'No'}`)
    console.log(`   📊 Status: ${testProduct.status}`)
    
    console.log('\n🎯 Testing Instructions:')
    console.log('1. Go to http://localhost:3001/products')
    console.log('2. Find "STRIPE TEST ITEM - £1 Payment Test"')
    console.log('3. Click "Add to Cart"')
    console.log('4. Go to cart and proceed to checkout')
    console.log('5. Use Stripe test card: 4242 4242 4242 4242')
    console.log('6. Any future date for expiry, any 3 digits for CVC')
    console.log('7. Complete payment to test integration')
    
    console.log('\n💳 Stripe Test Cards:')
    console.log('   Success: 4242 4242 4242 4242')
    console.log('   Decline: 4000 0000 0000 0002')
    console.log('   3D Secure: 4000 0027 6000 3184')

  } catch (error) {
    console.error('❌ Error creating test product:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  createStripeTestProduct().catch(console.error)
}

export { createStripeTestProduct }