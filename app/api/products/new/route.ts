import { NextRequest } from 'next/server'
import { ProductService } from '../../../../lib/services/product.service'
import { createSuccessResponse } from '../../../../lib/api/responses'
import { handleApiError } from '../../../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../../../lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const limit = parseInt(searchParams.get('limit') || '8', 10)

    const products = await ProductService.getNewProducts(Math.min(limit, 20))
    return createSuccessResponse(products, 'New products retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}