/**
 * Advanced Search Service with Fuzzy Search and Auto-complete
 * Provides intelligent search suggestions and history management
 */

import { prisma } from '../prisma'

export interface SearchSuggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand' | 'history'
  metadata?: {
    price?: string
    stock?: number
    categoryName?: string
    productCount?: number
  }
}

export interface SearchOptions {
  query: string
  limit?: number
  includeCategories?: boolean
  includeBrands?: boolean
  includeHistory?: boolean
  userId?: string
}

export class SearchService {
  
  /**
   * Fuzzy search algorithm - calculates similarity score between strings
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    
    // Exact match gets highest score
    if (s1 === s2) return 1.0
    
    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8
    
    // Calculate Levenshtein distance-based similarity
    const maxLength = Math.max(s1.length, s2.length)
    if (maxLength === 0) return 1.0
    
    const distance = this.levenshteinDistance(s1, s2)
    return Math.max(0, (maxLength - distance) / maxLength)
  }
  
  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array.from({ length: str2.length + 1 }, () => 
      Array.from({ length: str1.length + 1 }, () => 0)
    )
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1]
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,    // deletion
            matrix[j][i - 1] + 1,    // insertion
            matrix[j - 1][i - 1] + 1 // substitution
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
  
  /**
   * Get search suggestions with fuzzy matching (Server-side version)
   */
  static async getSearchSuggestions(options: SearchOptions): Promise<SearchSuggestion[]> {
    const { query, limit = 10, includeCategories = true, includeBrands = true } = options
    
    if (!query || query.length < 2) return []
    
    const suggestions: SearchSuggestion[] = []
    
    try {
      // Search products with fuzzy matching
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { shortDescription: { contains: query } }
          ]
        },
        include: {
          productCategories: {
            include: {
              category: true
            }
          }
        },
        take: limit * 2 // Get more for fuzzy filtering
      })
      
      // Apply fuzzy matching to products
      const productSuggestions = products
        .map(product => ({
          product,
          similarity: Math.max(
            this.calculateSimilarity(query, product.name),
            this.calculateSimilarity(query, product.description || ''),
            this.calculateSimilarity(query, product.shortDescription || '')
          )
        }))
        .filter(({ similarity }) => similarity > 0.3) // Threshold for relevance
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, Math.floor(limit * 0.6))
        .map(({ product }) => ({
          id: `product-${product.id}`,
          text: product.name,
          type: 'product' as const,
          metadata: {
            price: `£${product.price}`,
            stock: product.stockQuantity,
            categoryName: product.productCategories[0]?.category.name
          }
        }))
      
      suggestions.push(...productSuggestions)
      
      // Search categories if enabled
      if (includeCategories) {
        const categories = await prisma.category.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: query } },
              { description: { contains: query } }
            ]
          },
          include: {
            _count: {
              select: { productCategories: true }
            }
          }
        })
        
        const categorySuggestions = categories
          .map(category => ({
            category,
            similarity: Math.max(
              this.calculateSimilarity(query, category.name),
              this.calculateSimilarity(query, category.description || '')
            )
          }))
          .filter(({ similarity }) => similarity > 0.4)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, Math.floor(limit * 0.3))
          .map(({ category }) => ({
            id: `category-${category.id}`,
            text: category.name,
            type: 'category' as const,
            metadata: {
              productCount: category._count.productCategories
            }
          }))
        
        suggestions.push(...categorySuggestions)
      }
      
      // Search brands if enabled
      if (includeBrands) {
        const brands = await prisma.category.findMany({
          where: {
            isActive: true,
            name: { contains: query },
            // Filter for likely brand categories (shorter names, common brands)
            OR: [
              { slug: { in: ['ss', 'sg', 'mrf', 'gm', 'dsc', 'ceat', 'bas', 'bdm', 'kg', 'rns', 'sf', 'nb', 'a2'] } },
              { name: { contains: 'NICOLLS' } },
              { name: { contains: 'BALANCE' } }
            ]
          },
          include: {
            _count: {
              select: { productCategories: true }
            }
          }
        })
        
        const brandSuggestions = brands
          .map(brand => ({
            id: `brand-${brand.id}`,
            text: brand.name,
            type: 'brand' as const,
            metadata: {
              productCount: brand._count.productCategories
            }
          }))
        
        suggestions.push(...brandSuggestions)
      }
      
      return suggestions.slice(0, limit)
      
    } catch (error) {
      console.error('Search suggestions error:', error)
      return []
    }
  }

  /**
   * Get search suggestions with API call (Client-side version)
   */
  static async getSearchSuggestionsClient(options: SearchOptions): Promise<SearchSuggestion[]> {
    const { query, limit = 8, includeCategories = true, includeBrands = true, userId } = options
    
    if (!query || query.length < 2) return []
    
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        categories: includeCategories.toString(),
        brands: includeBrands.toString(),
        ...(userId && { userId })
      })
      
      const response = await fetch(`/api/search/suggestions?${params}`)
      const data = await response.json()
      
      return data.success ? data.data : []
    } catch (error) {
      console.error('Client search suggestions error:', error)
      return []
    }
  }
  
  /**
   * Save search query to history
   */
  static async saveSearchHistory(query: string, userId?: string): Promise<void> {
    if (!query || query.length < 2) return
    
    try {
      // For now, we'll implement client-side history
      // In production, this could save to database with userId
      if (typeof window !== 'undefined') {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
        const newHistory = [query, ...history.filter((h: string) => h !== query)].slice(0, 10)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      }
    } catch (error) {
      console.error('Save search history error:', error)
    }
  }
  
  /**
   * Get search history
   */
  static getSearchHistory(): string[] {
    if (typeof window === 'undefined') return []
    
    try {
      return JSON.parse(localStorage.getItem('searchHistory') || '[]')
    } catch {
      return []
    }
  }
  
  /**
   * Advanced search with multiple filters
   */
  static async advancedSearch(options: {
    query?: string
    categoryIds?: string[]
    priceRange?: { min: number; max: number }
    inStock?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    const {
      query,
      categoryIds,
      priceRange,
      inStock,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = options
    
    const where: any = { isActive: true }
    
    // Text search with fuzzy matching
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } }
      ]
    }
    
    // Category filtering
    if (categoryIds && categoryIds.length > 0) {
      where.productCategories = {
        some: {
          OR: categoryIds.map(categoryId => ({
            OR: [
              { category: { name: categoryId } },
              { category: { slug: categoryId } },
              { category: { slug: categoryId.toLowerCase().replace(/\s+/g, '-') } }
            ]
          }))
        }
      }
    }
    
    // Price range filtering
    if (priceRange) {
      where.price = {}
      if (priceRange.min !== undefined) where.price.gte = priceRange.min
      if (priceRange.max !== undefined) where.price.lte = priceRange.max
    }
    
    // Stock filtering
    if (inStock) {
      where.stockQuantity = { gt: 0 }
    }
    
    // Build order by
    let orderBy: any[] = []
    
    switch (sortBy) {
      case 'relevance':
        orderBy = [{ stockQuantity: 'desc' }, { isFeatured: 'desc' }, { createdAt: 'desc' }]
        break
      case 'price':
        orderBy = [{ price: sortOrder }]
        break
      case 'name':
        orderBy = [{ name: sortOrder }]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      default:
        orderBy = [{ createdAt: 'desc' }]
    }
    
    const skip = (page - 1) * limit
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          productCategories: {
            include: {
              category: true
            }
          },
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    }
  }
}