import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/api/responses'
import { handleApiError } from '@/lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 100, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const categoryId = searchParams.get('categoryId')

    // Build base where clause
    const where: any = {
      isActive: true,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    // Get all products to extract filter options
    const products = await prisma.product.findMany({
      where,
      select: {
        price: true,
        colors: true,
        sizes: true,
        tags: true,
        stockQuantity: true,
      },
    })

    // Extract unique filter options
    const filters = {
      priceRange: {
        min: 0,
        max: 0,
      },
      colors: new Set<string>(),
      sizes: new Set<string>(),
      tags: new Set<string>(),
      inStockCount: 0,
      totalCount: products.length,
    }

    products.forEach(product => {
      // Price range
      if (filters.priceRange.min === 0 || Number(product.price) < filters.priceRange.min) {
        filters.priceRange.min = Number(product.price)
      }
      if (Number(product.price) > filters.priceRange.max) {
        filters.priceRange.max = Number(product.price)
      }

      // Stock count
      if (product.stockQuantity > 0) {
        filters.inStockCount++
      }

      // Colors
      if (product.colors) {
        try {
          const colors = JSON.parse(product.colors)
          colors.forEach((color: string) => filters.colors.add(color))
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Sizes
      if (product.sizes) {
        try {
          const sizes = JSON.parse(product.sizes)
          sizes.forEach((size: string) => filters.sizes.add(size))
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Tags
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags)
          tags.forEach((tag: string) => filters.tags.add(tag))
        } catch (e) {
          // Ignore parsing errors
        }
      }
    })

    // Get categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    const result = {
      categories: categories,
      priceRange: {
        min: Math.floor(filters.priceRange.min),
        max: Math.ceil(filters.priceRange.max),
      },
      colors: Array.from(filters.colors).sort(),
      sizes: Array.from(filters.sizes).sort(),
      tags: Array.from(filters.tags).sort(),
      availability: {
        inStock: filters.inStockCount,
        total: filters.totalCount,
      },
    }

    return createSuccessResponse(result, 'Filters retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}