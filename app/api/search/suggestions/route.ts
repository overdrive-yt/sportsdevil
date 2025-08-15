import { NextRequest } from 'next/server'
import { SearchService } from '../../lib/services/search.service'
import { createSuccessResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) { // 100 requests per minute
      return handleApiError(new Error('Too many search requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '8')
    const includeCategories = searchParams.get('categories') !== 'false'
    const includeBrands = searchParams.get('brands') !== 'false'
    const includeHistory = searchParams.get('history') !== 'false'
    const userId = searchParams.get('userId') || undefined

    if (!query || query.length < 2) {
      return createSuccessResponse([], 'Query too short')
    }

    const suggestions = await SearchService.getSearchSuggestions({
      query,
      limit,
      includeCategories,
      includeBrands,
      includeHistory,
      userId
    })

    return createSuccessResponse(suggestions, 'Search suggestions retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}