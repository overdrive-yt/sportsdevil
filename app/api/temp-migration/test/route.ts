// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// Test WooCommerce API Connection

import { NextRequest, NextResponse } from 'next/server'
import { WooCommerceMigrationAPI } from '../../../../lib/temp-migration/woocommerce-api'

export async function POST(request: NextRequest) {
  try {
    const { siteUrl, consumerKey, consumerSecret } = await request.json()

    if (!siteUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: siteUrl, consumerKey, consumerSecret'
      }, { status: 400 })
    }

    // Test the connection
    const api = new WooCommerceMigrationAPI({
      siteUrl,
      consumerKey,
      consumerSecret
    })

    const testResult = await api.testConnection()

    if (testResult.success) {
      // If connection successful, get basic stats
      const productCount = await api.getProductsCount()
      const categories = await api.getAllCategories()
      
      // Also get stats for filtered options
      let excludeWKBallsCount = 0
      let imagesOnlyCount = 0
      try {
        const excludedProducts = await api.getProductsExcludingWKAndBalls()
        excludeWKBallsCount = excludedProducts.length
        
        const imagesOnlyProducts = await api.getProductsImagesOnly()
        imagesOnlyCount = imagesOnlyProducts.length
      } catch (error) {
        console.warn('Could not get filter counts:', error)
      }

      return NextResponse.json({
        success: true,
        message: testResult.message,
        siteInfo: testResult.siteInfo,
        stats: {
          totalProducts: productCount,
          totalCategories: categories.length,
          excludeWKBallsProducts: excludeWKBallsCount,
          imagesOnlyProducts: imagesOnlyCount
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Migration test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}