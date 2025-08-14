import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsCache, AnalyticsCache } from '@/lib/cache/analytics-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'name'
    const filter = searchParams.get('filter') || ''

    const slugArray = params.slug || []
    console.log(`🔍 Dynamic product route: /${slugArray.join('/')}`)

    // Generate cache key for this specific request
    const cacheKey = `product-page:${slugArray.join('/')}:${page}:${limit}:${sort}:${filter}`
    const cached = analyticsCache.get(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit for dynamic product page: ${slugArray.join('/')}`)
      return NextResponse.json({ ...cached, meta: { ...cached.meta, cached: true } })
    }

    // Determine if this is a single product or category/listing
    const isProductSlug = await checkIfProductSlug(slugArray[slugArray.length - 1])
    
    let result
    if (isProductSlug && slugArray.length === 1) {
      // Single product page
      result = await handleSingleProduct(slugArray[0])
    } else {
      // Category listing or multi-level navigation
      result = await handleProductListing(slugArray, page, limit, sort, filter)
    }

    // Cache the response
    analyticsCache.set(cacheKey, result, AnalyticsCache.CACHE_TTL.PRODUCT_LIST)
    console.log(`📝 Cached dynamic product page: ${slugArray.join('/')}`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Dynamic product API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load product data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

async function checkIfProductSlug(slug: string): Promise<boolean> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      select: { id: true }
    })
    return !!product
  } catch {
    return false
  }
}

async function handleSingleProduct(slug: string) {
  console.log(`📦 Loading single product: ${slug}`)
  
  const product = await prisma.product.findUnique({
    where: {
      slug,
      isActive: true
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      productCategories: {
        where: { isPrimary: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              fullPath: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  parent: {
                    select: {
                      id: true,
                      name: true,
                      slug: true
                    }
                  }
                }
              }
            }
          }
        },
        take: 1
      }
    }
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // Build breadcrumbs
  const breadcrumbs = []
  const primaryCategory = product.productCategories[0]?.category
  
  if (primaryCategory) {
    // Build category hierarchy
    const categoryPath = []
    let currentCategory = primaryCategory
    
    // Walk up the category tree
    while (currentCategory) {
      categoryPath.unshift({
        name: currentCategory.name,
        href: `/product/${currentCategory.slug}`
      })
      currentCategory = currentCategory.parent
    }
    
    breadcrumbs.push(...categoryPath)
  }

  // Add "Products" as base
  breadcrumbs.unshift({ name: 'Products', href: '/products' })

  return {
    type: 'single' as const,
    product: {
      ...product,
      price: parseFloat(product.price.toString()),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined
    },
    breadcrumbs,
    meta: {
      total: 1,
      page: 1,
      limit: 1,
      hasNextPage: false,
      hasPrevPage: false,
      cached: false,
      timestamp: new Date().toISOString()
    }
  }
}

async function handleProductListing(
  slugArray: string[], 
  page: number, 
  limit: number, 
  sort: string, 
  filter: string
) {
  console.log(`📋 Loading product listing: ${slugArray.join('/')}`)

  const skip = (page - 1) * limit
  let category = null
  let whereClause: any = { isActive: true }
  
  // Try to find category by the last slug
  const lastSlug = slugArray[slugArray.length - 1]
  if (lastSlug) {
    category = await prisma.category.findUnique({
      where: { slug: lastSlug, isActive: true },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (category) {
      // Get all products in this category and its subcategories
      const categoryIds = [category.id, ...category.children.map(c => c.id)]
      whereClause.productCategories = {
        some: {
          categoryId: { in: categoryIds }
        }
      }
    }
  }

  // Apply text filter if provided
  if (filter) {
    whereClause.OR = [
      { name: { contains: filter, mode: 'insensitive' } },
      { description: { contains: filter, mode: 'insensitive' } },
      { shortDescription: { contains: filter, mode: 'insensitive' } }
    ]
  }

  // Build order by clause
  let orderBy: any = { name: 'asc' }
  switch (sort) {
    case 'price-low':
      orderBy = { price: 'asc' }
      break
    case 'price-high':
      orderBy = { price: 'desc' }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'popularity':
      // Could be enhanced with actual popularity metrics
      orderBy = [{ isFeatured: 'desc' }, { name: 'asc' }]
      break
    default:
      orderBy = { name: 'asc' }
  }

  // Get products and total count
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
          orderBy: { sortOrder: 'asc' }
        },
        productCategories: {
          where: { isPrimary: true },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          },
          take: 1
        }
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma.product.count({ where: whereClause })
  ])

  // Build breadcrumbs
  const breadcrumbs = []
  
  if (category) {
    // Build category hierarchy
    const categoryPath = []
    let currentCategory = category
    
    while (currentCategory) {
      categoryPath.unshift({
        name: currentCategory.name,
        href: `/product/${currentCategory.slug}`
      })
      currentCategory = currentCategory.parent
    }
    
    breadcrumbs.push(...categoryPath)
  } else {
    // Generic product listing
    breadcrumbs.push({ name: 'Products', href: '/products' })
  }

  // Add "Products" as base if not already there
  if (!breadcrumbs.some(crumb => crumb.name === 'Products')) {
    breadcrumbs.unshift({ name: 'Products', href: '/products' })
  }

  // Format products
  const formattedProducts = products.map(product => ({
    ...product,
    price: parseFloat(product.price.toString()),
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined
  }))

  const hasNextPage = skip + products.length < totalCount
  const hasPrevPage = page > 1

  return {
    type: category ? 'category' : 'listing' as const,
    products: formattedProducts,
    category: category ? {
      ...category,
      children: category.children
    } : undefined,
    breadcrumbs,
    meta: {
      total: totalCount,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
      cached: false,
      timestamp: new Date().toISOString()
    }
  }
}