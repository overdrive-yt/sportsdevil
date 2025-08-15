import { NextRequest } from 'next/server'
import { CategoryService } from '../../../../lib/services/category.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    console.log('🎯 Fetching featured categories with images...')
    
    const featuredCategories = await CategoryService.getCategoriesWithFeaturedImages()
    
    console.log(`✅ Found ${featuredCategories.length} featured categories`)
    
    return createSuccessResponse(featuredCategories, 'Featured categories retrieved successfully', 200, {
      count: featuredCategories.length,
      cached: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Featured categories API error:', error)
    return handleApiError(error)
  }
}