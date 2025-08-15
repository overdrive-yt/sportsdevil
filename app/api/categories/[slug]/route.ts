import { NextRequest } from 'next/server'
import { CategoryService } from '../../lib/services/category.service'
import { createSuccessResponse } from '../../lib/api/responses'
import { handleApiError } from '../../lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '../../lib/api/middleware'

interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const resolvedParams = await context.params

    const category = await CategoryService.getCategoryBySlug(resolvedParams.slug, includeProducts)
    return createSuccessResponse(category, 'Category retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}