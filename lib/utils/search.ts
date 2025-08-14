export interface SearchOptions {
  query: string
  limit?: number
  categories?: string[]
  priceRange?: {
    min: number
    max: number
  }
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
}

export interface SearchFilters {
  search?: string
  categoryId?: string
  categoryIds?: string[] // Support multiple categories
  ageCategory?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  featured?: boolean
  new?: boolean
}

export function buildSearchQuery(searchTerm: string) {
  // SQLite doesn't support case-insensitive contains, so we'll use basic contains
  return {
    OR: [
      {
        name: {
          contains: searchTerm,
        },
      },
      {
        description: {
          contains: searchTerm,
        },
      },
      {
        shortDescription: {
          contains: searchTerm,
        },
      },
    ],
  }
}

export function buildProductFilters(filters: SearchFilters) {
  const where: any = {
    isActive: true,
  }

  if (filters.search) {
    where.OR = buildSearchQuery(filters.search).OR
  }

  // Handle category filtering with support for multiple categories
  if (filters.categoryId || filters.categoryIds || filters.ageCategory) {
    const categoryConditions: any[] = []
    
    // Handle single category
    if (filters.categoryId) {
      // Check if it's a CUID (starts with 'c' and is long) - treat as ID
      if (filters.categoryId.startsWith('c') && filters.categoryId.length > 20) {
        categoryConditions.push({
          category: { id: filters.categoryId }
        })
      } else {
        // Otherwise treat as name or slug for backwards compatibility
        categoryConditions.push({
          OR: [
            { category: { name: filters.categoryId } },
            { category: { slug: filters.categoryId } },
            { category: { slug: filters.categoryId.toLowerCase().replace(/\s+/g, '-') } }
          ]
        })
      }
    }
    
    // Handle multiple categories
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const categoryOrConditions: any[] = []
      
      filters.categoryIds.forEach(categoryId => {
        // Check if it's a CUID (starts with 'c' and is long) - treat as ID
        if (categoryId.startsWith('c') && categoryId.length > 20) {
          categoryOrConditions.push(
            { category: { id: categoryId } }
          )
        } else {
          // Otherwise treat as name or slug for backwards compatibility
          categoryOrConditions.push(
            { category: { name: categoryId } },
            { category: { slug: categoryId } },
            { category: { slug: categoryId.toLowerCase().replace(/\s+/g, '-') } }
          )
        }
      })
      
      categoryConditions.push({
        OR: categoryOrConditions
      })
    }
    
    if (filters.ageCategory) {
      categoryConditions.push({
        category: {
          OR: [
            { ageCategory: filters.ageCategory },
            { ageCategory: 'UNISEX' }
          ]
        }
      })
    }
    
    where.productCategories = {
      some: categoryConditions.length === 1 
        ? categoryConditions[0] 
        : { OR: categoryConditions } // Use OR for multiple categories, not AND
    }
    
    console.log('🔍 Search Filter: Enhanced category filter applied:', {
      categoryId: filters.categoryId,
      categoryIds: filters.categoryIds,
      ageCategory: filters.ageCategory,
      whereClause: JSON.stringify(where.productCategories, null, 2)
    })
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {}
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice
    }
  }

  if (filters.inStock) {
    where.stockQuantity = { gt: 0 }
  }

  if (filters.featured !== undefined) {
    where.isFeatured = filters.featured
  }

  if (filters.new !== undefined) {
    where.isNew = filters.new
  }

  if (filters.colors && filters.colors.length > 0) {
    // Since colors are stored as JSON string, we need to search within the JSON
    where.colors = {
      in: filters.colors.map(color => `%"${color}"%`),
    }
  }

  if (filters.sizes && filters.sizes.length > 0) {
    // Since sizes are stored as JSON string, we need to search within the JSON
    where.sizes = {
      in: filters.sizes.map(size => `%"${size}"%`),
    }
  }

  return where
}

export function extractSearchSuggestions(searchTerm: string, products: any[]): string[] {
  const suggestions = new Set<string>()
  const lowerSearchTerm = searchTerm.toLowerCase()

  products.forEach(product => {
    // Add product name if it contains the search term
    if (product.name.toLowerCase().includes(lowerSearchTerm)) {
      suggestions.add(product.name)
    }

    // Add category name if it contains the search term
    if (product.category?.name.toLowerCase().includes(lowerSearchTerm)) {
      suggestions.add(product.category.name)
    }

    // Add colors and sizes that match
    if (product.colors) {
      try {
        const colors = JSON.parse(product.colors)
        colors.forEach((color: string) => {
          if (color.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.add(color)
          }
        })
      } catch (e) {
        // Ignore parsing errors
      }
    }

    if (product.sizes) {
      try {
        const sizes = JSON.parse(product.sizes)
        sizes.forEach((size: string) => {
          if (size.toLowerCase().includes(lowerSearchTerm)) {
            suggestions.add(size)
          }
        })
      } catch (e) {
        // Ignore parsing errors
      }
    }
  })

  return Array.from(suggestions).slice(0, 10) // Limit to 10 suggestions
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .slice(0, 100) // Limit length
}

export function buildSortOptions(sortBy?: string, sortOrder?: 'asc' | 'desc') {
  const orderBy: any = []

  // Handle explicit user sorting requests first
  switch (sortBy) {
    case 'name':
      // Pure alphabetical sorting when user explicitly selects A-Z or Z-A
      orderBy.push({ name: sortOrder || 'asc' })
      break
    case 'price':
      // Pure price sorting when user explicitly selects price ordering
      orderBy.push({ price: sortOrder || 'asc' })
      break
    case 'createdAt':
    case 'newest':
      orderBy.push({ createdAt: sortOrder || 'desc' })
      break
    case 'oldest':
      orderBy.push({ createdAt: 'asc' })
      break
    case 'updatedAt':
      orderBy.push({ updatedAt: sortOrder || 'desc' })
      break
    case 'popularity':
      // Assuming we have a way to track popularity (could be order count, views, etc.)
      orderBy.push({ createdAt: 'desc' }) // Fallback to newest first
      break
    case 'featured':
      orderBy.push({ isFeatured: 'desc' })
      orderBy.push({ createdAt: 'desc' }) // Then newest
      break
    case 'name-asc':
      // Handle compound sort parameter for A-Z
      orderBy.push({ name: 'asc' })
      break
    case 'name-desc':
      // Handle compound sort parameter for Z-A
      orderBy.push({ name: 'desc' })
      break
    case 'price-asc':
      // Handle compound sort parameter for price low to high
      orderBy.push({ price: 'asc' })
      break
    case 'price-desc':
      // Handle compound sort parameter for price high to low
      orderBy.push({ price: 'desc' })
      break
    default:
      // Only apply stock-based sorting if no explicit sorting is provided
      if (!sortBy || sortBy === 'newest') {
        // Default behavior: Smart stock-based sorting for general browsing
        // Prioritize in-stock products, then newest
        orderBy.push({ stockQuantity: 'desc' })
        orderBy.push({ createdAt: 'desc' })
      } else {
        // For any other sort value, just use newest as fallback
        orderBy.push({ createdAt: 'desc' })
      }
  }

  return orderBy
}