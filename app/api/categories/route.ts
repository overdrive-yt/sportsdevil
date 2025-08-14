import { NextRequest } from 'next/server'
import { CategoryService } from '@/lib/services/category.service'
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { requireAdmin, validateRequestBody, checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'
import { categorySchema } from '@/lib/api/validation'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const hierarchy = searchParams.get('hierarchy') === 'true'
    const includeInactive = searchParams.get('includeInactive') === 'true'

    if (hierarchy) {
      const categories = await CategoryService.getCategoryHierarchy()
      return createSuccessResponse(categories, 'Category hierarchy retrieved successfully')
    } else {
      const categories = await CategoryService.getCategories(includeInactive)
      return createSuccessResponse(categories, 'Categories retrieved successfully')
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const data = await validateRequestBody(request, categorySchema)
    const category = await CategoryService.createCategory(data)

    return createCreatedResponse(category, 'Category created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}