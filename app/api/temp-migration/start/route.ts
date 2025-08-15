// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// Start WooCommerce Migration Process

import { NextRequest, NextResponse } from 'next/server'
import { WooCommerceMigrationAPI } from '../../../../lib/temp-migration/woocommerce-api'
import { DatabaseMigrator } from '../../../../lib/temp-migration/database-migrator'

// Store migration instance globally for progress tracking
let currentMigration: DatabaseMigrator | null = null

export async function POST(request: NextRequest) {
  try {
    const { siteUrl, consumerKey, consumerSecret, options = {} } = await request.json()

    // Support environment variables as fallback
    const config = {
      siteUrl: siteUrl || process.env.WOOCOMMERCE_SITE_URL,
      consumerKey: consumerKey || process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: consumerSecret || process.env.WOOCOMMERCE_CONSUMER_SECRET
    }

    if (!config.siteUrl || !config.consumerKey || !config.consumerSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: siteUrl, consumerKey, consumerSecret'
      }, { status: 400 })
    }

    // Check if migration is already running
    if (currentMigration) {
      const progress = currentMigration.getProgress()
      if (progress.step !== 'complete' && progress.step !== 'error') {
        return NextResponse.json({
          success: false,
          error: 'Migration already in progress',
          progress
        }, { status: 409 })
      }
    }

    // Initialize APIs
    const wooAPI = new WooCommerceMigrationAPI(config)

    const migrator = new DatabaseMigrator()
    currentMigration = migrator

    // Start migration in background
    setImmediate(async () => {
      try {
        console.log('🚀 Starting WooCommerce migration...')
        
        // Handle different filter types
        const categoryFilter = options.categoryFilter || 'ball'
        
        let categories, products
        
        if (categoryFilter === 'images-only') {
          console.log(`📸 Images Only migration: ALL products for image extraction`)
          // Get all categories (we need them for proper structure)
          categories = await wooAPI.getAllCategories()
          // Get ALL products including WK and cricket balls for image extraction
          products = await wooAPI.getProductsImagesOnly()
        } else if (categoryFilter === 'exclude-wk-balls') {
          console.log(`🚫 Filtered migration: ALL products EXCEPT wicket keeping & cricket balls`)
          // Get all categories (we need them for proper structure)
          categories = await wooAPI.getAllCategories()
          // Get products excluding WK and cricket balls
          products = await wooAPI.getProductsExcludingWKAndBalls()
          
          // Filter categories to only include those with products
          const productCategoryIds = new Set()
          products.forEach(product => {
            product.categories.forEach(cat => {
              productCategoryIds.add(cat.id)
            })
          })
          
          categories = categories.filter(cat => productCategoryIds.has(cat.id))
        } else if (categoryFilter && categoryFilter !== 'all') {
          console.log(`🏏 Filtered migration for: ${categoryFilter}`)
          // Get all categories (we need them for proper structure)
          categories = await wooAPI.getAllCategories()
          // Get only specific products
          products = await wooAPI.getProductsByCategory(categoryFilter)
          
          // Filter categories to only include those with products
          const productCategoryIds = new Set()
          products.forEach(product => {
            product.categories.forEach(cat => {
              productCategoryIds.add(cat.id)
            })
          })
          
          categories = categories.filter(cat => 
            productCategoryIds.has(cat.id) || 
            cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
          )
        } else {
          // Full migration
          console.log('📦 Full migration - all products')
          ;[categories, products] = await Promise.all([
            wooAPI.getAllCategories(),
            wooAPI.getAllProducts()
          ])
        }

        console.log(`📊 Fetched ${categories.length} categories and ${products.length} products`)

        // Start database migration
        const result = await migrator.migrateData(categories, products)
        
        console.log('✅ Migration completed:', result)

      } catch (error) {
        console.error('❌ Migration failed:', error)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Migration started successfully',
      migrationId: Date.now().toString()
    })

  } catch (error) {
    console.error('Migration start error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  // Get current migration progress
  if (!currentMigration) {
    return NextResponse.json({
      success: false,
      error: 'No migration in progress'
    }, { status: 404 })
  }

  const progress = currentMigration.getProgress()
  
  return NextResponse.json({
    success: true,
    progress
  })
}