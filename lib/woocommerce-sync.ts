/**
 * WooCommerce Stock Synchronization Service
 * 
 * This service connects to your WooCommerce store to sync real stock quantities
 * with our local database, ensuring accurate inventory levels.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface WooCommerceConfig {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
  version?: string
}

interface WooCommerceProduct {
  id: number
  sku: string
  name: string
  stock_quantity: number | null
  manage_stock: boolean
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  price: string
  regular_price: string
  sale_price: string
}

export class WooCommerceStockSync {
  private config: WooCommerceConfig

  constructor(config: WooCommerceConfig) {
    this.config = {
      ...config,
      version: config.version || 'wc/v3'
    }
  }

  /**
   * Create Basic Auth header for WooCommerce API
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64')
    return `Basic ${credentials}`
  }

  /**
   * Make authenticated request to WooCommerce API
   */
  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.config.baseUrl}/wp-json/${this.config.version}/${endpoint}`)
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    console.log(`🔗 Making request to: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`WooCommerce API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  /**
   * Fetch all products from WooCommerce with pagination
   */
  async fetchAllProducts(): Promise<WooCommerceProduct[]> {
    console.log('🏪 Fetching all products from WooCommerce...')
    
    const allProducts: WooCommerceProduct[] = []
    let page = 1
    const perPage = 100

    while (true) {
      console.log(`📄 Fetching page ${page}...`)
      
      const products = await this.makeRequest('products', {
        page,
        per_page: perPage,
        status: 'publish'
      })

      if (products.length === 0) {
        break
      }

      allProducts.push(...products)
      console.log(`   Found ${products.length} products on page ${page}`)
      
      // If we got fewer products than requested, we're on the last page
      if (products.length < perPage) {
        break
      }
      
      page++
    }

    console.log(`🎯 Total products fetched: ${allProducts.length}`)
    return allProducts
  }

  /**
   * Sync stock quantities from WooCommerce to local database
   */
  async syncStockQuantities(): Promise<{
    updated: number
    skipped: number
    errors: string[]
  }> {
    console.log('🔄 Starting stock synchronization...')
    
    const results = {
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    }

    try {
      // Fetch all products from WooCommerce
      const wooProducts = await this.fetchAllProducts()
      
      // Get all local products
      const localProducts = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, sku: true, name: true, stockQuantity: true }
      })

      console.log(`\n📊 Comparison:`)
      console.log(`   WooCommerce products: ${wooProducts.length}`)
      console.log(`   Local products: ${localProducts.length}`)

      // Create SKU lookup map
      const wooProductsBySku = new Map<string, WooCommerceProduct>()
      wooProducts.forEach(product => {
        if (product.sku) {
          wooProductsBySku.set(product.sku, product)
        }
      })

      console.log(`\n🔄 Syncing stock quantities...`)
      console.log('='.repeat(80))

      // Update stock for each local product
      for (const localProduct of localProducts) {
        const wooProduct = wooProductsBySku.get(localProduct.sku)
        
        if (!wooProduct) {
          results.skipped++
          console.log(`⏭️  SKIPPED: ${localProduct.name} (SKU: ${localProduct.sku}) - not found in WooCommerce`)
          continue
        }

        // Determine stock quantity
        let newStockQuantity = 0
        
        if (wooProduct.manage_stock && wooProduct.stock_quantity !== null) {
          // Use actual stock quantity if stock management is enabled
          newStockQuantity = wooProduct.stock_quantity
        } else if (wooProduct.stock_status === 'instock') {
          // If stock management is disabled but status is in stock, assume available
          newStockQuantity = 10 // Default quantity for products marked as "in stock"
        } else {
          // Out of stock or backorder
          newStockQuantity = 0
        }

        // Update if quantity changed
        if (localProduct.stockQuantity !== newStockQuantity) {
          try {
            await prisma.product.update({
              where: { id: localProduct.id },
              data: { stockQuantity: newStockQuantity }
            })

            results.updated++
            const statusIcon = newStockQuantity > 0 ? '✅' : '❌'
            const change = `${localProduct.stockQuantity} → ${newStockQuantity}`
            console.log(`${statusIcon} UPDATED: ${localProduct.name}`)
            console.log(`    SKU: ${localProduct.sku} | Stock: ${change}`)
            
          } catch (error) {
            results.errors.push(`Failed to update ${localProduct.name}: ${error}`)
            console.log(`❌ ERROR updating ${localProduct.name}: ${error}`)
          }
        } else {
          results.skipped++
          const statusIcon = newStockQuantity > 0 ? '✅' : '❌'
          console.log(`${statusIcon} NO CHANGE: ${localProduct.name} (${newStockQuantity})`)
        }
      }

    } catch (error) {
      console.error('💥 Sync failed:', error)
      results.errors.push(`Sync failed: ${error}`)
    }

    return results
  }

  /**
   * Get stock status summary from WooCommerce
   */
  async getStockSummary() {
    console.log('📈 Generating WooCommerce stock summary...')
    
    const products = await this.fetchAllProducts()
    
    const summary = {
      total: products.length,
      inStock: 0,
      outOfStock: 0,
      backorder: 0,
      managedStock: 0,
      unmanagedStock: 0
    }

    products.forEach(product => {
      // Count by stock status
      if (product.stock_status === 'instock') summary.inStock++
      else if (product.stock_status === 'outofstock') summary.outOfStock++
      else if (product.stock_status === 'onbackorder') summary.backorder++

      // Count by stock management
      if (product.manage_stock) summary.managedStock++
      else summary.unmanagedStock++
    })

    console.log('\n📊 WooCommerce Stock Summary:')
    console.log('='.repeat(50))
    console.log(`Total Products: ${summary.total}`)
    console.log(`✅ In Stock: ${summary.inStock} (${((summary.inStock/summary.total)*100).toFixed(1)}%)`)
    console.log(`❌ Out of Stock: ${summary.outOfStock} (${((summary.outOfStock/summary.total)*100).toFixed(1)}%)`)
    console.log(`🔄 On Backorder: ${summary.backorder} (${((summary.backorder/summary.total)*100).toFixed(1)}%)`)
    console.log(`📦 Managed Stock: ${summary.managedStock}`)
    console.log(`🆓 Unmanaged Stock: ${summary.unmanagedStock}`)

    return summary
  }
}

// Helper function to create WooCommerce sync instance from environment variables
export function createWooCommerceSync(): WooCommerceStockSync | null {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET

  if (!baseUrl || !consumerKey || !consumerSecret) {
    console.error('❌ WooCommerce configuration missing. Please set:')
    console.error('   WOOCOMMERCE_BASE_URL=https://yourdomain.com')
    console.error('   WOOCOMMERCE_CONSUMER_KEY=your_consumer_key')
    console.error('   WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret')
    return null
  }

  return new WooCommerceStockSync({
    baseUrl,
    consumerKey,
    consumerSecret
  })
}