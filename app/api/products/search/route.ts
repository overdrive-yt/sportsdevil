import { NextRequest } from 'next/server'
import { ProductService } from '../../../../lib/services/product.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError, ValidationError } from '../../../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'
import { sanitizeSearchQuery } from '../../../../lib/utils/search'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 150, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query is required')
    }

    const sanitizedQuery = sanitizeSearchQuery(query)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const category = searchParams.get('category') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const inStock = searchParams.get('inStock') === 'true'
    const sortBy = searchParams.get('sortBy') || undefined
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined

    const result = await ProductService.getProducts(
      {
        search: sanitizedQuery,
        categoryId: category,
        minPrice,
        maxPrice,
        inStock: inStock || undefined,
      },
      { page, limit },
      sortBy,
      sortOrder
    )

    return createSuccessResponse(
      {
        ...result,
        searchTerm: sanitizedQuery,
      },
      `Found ${result.pagination.total} products matching "${sanitizedQuery}"`,
      200,
      result.pagination
    )
  } catch (error) {
    return handleApiError(error)
  }
}