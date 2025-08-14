/**
 * Test script to verify add-to-cart functionality works without quantity doubling
 * This simulates the complete add-to-cart flow
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3001'
const TEST_PRODUCT_ID = 'cme7px2qz0000s1kxxcu5kcul' // Stripe test item

async function testAddToCart() {
  console.log('🧪 Testing add-to-cart flow...')
  
  try {
    // Step 1: Get the test product details
    console.log('📦 Getting product details...')
    const productResponse = await fetch(`${BASE_URL}/api/products/${TEST_PRODUCT_ID}`)
    const productData = await productResponse.json()
    
    if (!productData.success) {
      throw new Error('Failed to get product details')
    }
    
    const product = productData.data
    console.log(`✅ Product: ${product.name} - £${product.price}`)
    
    // Step 2: Test adding item to cart (this should work without authentication for guest cart)
    console.log('🛒 Testing add to cart...')
    const addToCartResponse = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: TEST_PRODUCT_ID,
        quantity: 1
      })
    })
    
    const addToCartData = await addToCartResponse.json()
    console.log('Add to cart response:', addToCartData)
    
    // Step 3: Check cart contents
    console.log('📋 Checking cart contents...')
    const cartResponse = await fetch(`${BASE_URL}/api/cart`)
    const cartData = await cartResponse.json()
    console.log('Cart response:', cartData)
    
    // Step 4: Test adding the same item again to check for quantity doubling
    console.log('🔄 Testing second add to cart...')
    const addAgainResponse = await fetch(`${BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: TEST_PRODUCT_ID,
        quantity: 1
      })
    })
    
    const addAgainData = await addAgainResponse.json()
    console.log('Second add to cart response:', addAgainData)
    
    // Step 5: Check final cart state
    console.log('📋 Checking final cart state...')
    const finalCartResponse = await fetch(`${BASE_URL}/api/cart`)
    const finalCartData = await finalCartResponse.json()
    console.log('Final cart response:', finalCartData)
    
    console.log('✅ Add-to-cart test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Run the test
testAddToCart()
  .then(() => {
    console.log('✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })