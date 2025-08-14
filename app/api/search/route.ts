import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/api/responses'
import { handleApiError, ValidationError } from '@/lib/api/errors'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/api/middleware'
import { buildSearchQuery, sanitizeSearchQuery } from '@/lib/utils/search'

export async function GET(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!checkRateLimit(identifier, 150, 60000)) {
      return handleApiError(new Error('Too many requests'))
    }

    const searchParams = new URL(request.url).searchParams
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query is required')
    }

    const sanitizedQuery = sanitizeSearchQuery(query)
    const searchQuery = buildSearchQuery(sanitizedQuery)

    const results: any = {
      query: sanitizedQuery,
      results: {},
    }

    if (type === 'all' || type === 'products') {
      const products = await prisma.product.findMany({
        where: {
          ...searchQuery,
          isActive: true,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          productCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      })

      results.results.products = products.map(product => ({
        ...product,
        colors: product.colors ? JSON.parse(product.colors) : [],
        sizes: product.sizes ? JSON.parse(product.sizes) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        primaryImage: product.images[0] || null,
        images: undefined,
      }))
    }

    if (type === 'all' || type === 'categories') {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            {
              name: {
                contains: sanitizedQuery,
              },
            },
            {
              description: {
                contains: sanitizedQuery,
              },
            },
          ],
          isActive: true,
        },
        take: Math.min(limit, 10),
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              productCategories: {
                where: {
                  product: {
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      })

      results.results.categories = categories
    }

    const totalResults = (results.results.products?.length || 0) + (results.results.categories?.length || 0)

    return createSuccessResponse(
      results,
      `Found ${totalResults} results for "${sanitizedQuery}"`
    )
  } catch (error) {
    return handleApiError(error)
  }
}