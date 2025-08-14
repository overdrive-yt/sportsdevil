import { NextRequest } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { requireAdmin, validateRequestBody, validateSearchParams, checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'
import { productSchema, productQuerySchema } from '@/lib/api/validation'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 200, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    
    // Manual validation for better type safety
    // Parse sort parameter which can be compound like "name-asc" or simple like "newest"
    const sort = searchParams.get('sort') || 'newest'
    let sortBy = 'newest'
    let sortOrder: 'asc' | 'desc' = 'desc'
    
    if (sort.includes('-')) {
      const [sortField, sortDirection] = sort.split('-')
      sortBy = sortField
      sortOrder = sortDirection as 'asc' | 'desc'
    } else {
      sortBy = sort
      // Set default sort order based on sort type
      sortOrder = ['price', 'name'].includes(sort) ? 'asc' : 'desc'
    }

    // Handle category/categories parameters - support both single and multiple
    const singleCategory = searchParams.get('category')
    const multipleCategories = searchParams.get('categories')
    
    let categoryIds: string[] | undefined = undefined
    let categoryId: string | undefined = undefined
    
    if (multipleCategories) {
      // Split comma-separated categories and trim whitespace
      categoryIds = multipleCategories.split(',').map(cat => cat.trim()).filter(Boolean)
    } else if (singleCategory) {
      categoryId = singleCategory
    }

    const filters = {
      search: searchParams.get('search') || undefined,
      category: singleCategory || undefined, // Keep for backward compatibility
      categories: multipleCategories || undefined, // Keep for client-side processing
      ageCategory: searchParams.get('ageCategory') || undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
      minPrice: searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      featured: searchParams.has('featured') ? searchParams.get('featured') === 'true' : undefined,
      new: searchParams.has('new') ? searchParams.get('new') === 'true' : undefined,
      inStock: searchParams.has('inStock') ? searchParams.get('inStock') === 'true' : undefined,
      sortBy: sortBy as 'name' | 'price' | 'createdAt' | 'updatedAt' | 'newest' | 'oldest' | 'featured',
      sortOrder,
    }

    const result = await ProductService.getProducts(
      {
        search: filters.search,
        categoryId: categoryId,
        categoryIds: categoryIds,
        ageCategory: filters.ageCategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        featured: filters.featured,
        new: filters.new,
        inStock: filters.inStock,
      },
      {
        page: filters.page || 1,
        limit: filters.limit || 10,
      },
      filters.sortBy,
      filters.sortOrder
    )

    return createSuccessResponse(result.products, 'Products retrieved successfully', 200, result.pagination)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const data = await validateRequestBody(request, productSchema)
    const product = await ProductService.createProduct(data)

    return createCreatedResponse(product, 'Product created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}