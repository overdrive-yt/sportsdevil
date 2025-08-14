// AI Recommendation Engine
// Provides intelligent product recommendations based on user behavior, product data, and purchase patterns

export interface RecommendationContext {
  userId?: string
  productId?: string
  categoryId?: string
  priceRange?: { min: number; max: number }
  previousPurchases?: string[] // Product IDs
  cartItems?: string[] // Product IDs
  viewedProducts?: string[] // Recent product IDs
  searchTerms?: string[] // Recent search queries
  sessionData?: {
    timeSpent: number
    pagesVisited: number
    interactionScore: number
  }
}

export interface RecommendedProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  categoryId: string
  slug: string
  rating: number
  reviewCount: number
  inStock: boolean
  isOnSale: boolean
  reason: string // Why this product was recommended
  confidence: number // 0-1 score for recommendation strength
  metadata?: {
    similarity?: number
    popularityScore?: number
    compatibilityScore?: number
  }
}

export interface RecommendationSet {
  title: string
  description: string
  products: RecommendedProduct[]
  algorithm: string
  confidence: number
  refreshRate: number // Minutes until stale
}

export type RecommendationType = 
  | 'recommended-items'      // "Recommended for You"
  | 'frequently-bought'      // "Frequently Bought Together"
  | 'similar-products'       // "Similar Products"
  | 'category-popular'       // "Popular in [Category]"
  | 'cross-category'         // "Customers Also Viewed"
  | 'price-alternatives'     // "Similar Price Range"
  | 'recently-viewed'        // "Recently Viewed"
  | 'trending'               // "Trending Now"

// Recommendation Strategies
export const RECOMMENDATION_STRATEGIES = {
  COLLABORATIVE_FILTERING: 'collaborative_filtering',
  CONTENT_BASED: 'content_based',
  POPULARITY_BASED: 'popularity_based',
  HYBRID: 'hybrid',
  SEMANTIC_SIMILARITY: 'semantic_similarity',
  PURCHASE_HISTORY: 'purchase_history',
  CATEGORY_AFFINITY: 'category_affinity',
  PRICE_SENSITIVITY: 'price_sensitivity'
}

// AI Recommendation Engine Class
export class RecommendationEngine {
  private static readonly CACHE_TTL = 15 * 60 * 1000 // 15 minutes
  private static cache = new Map<string, { data: RecommendationSet; timestamp: number }>()

  // Main recommendation method
  static async getRecommendations(
    type: RecommendationType,
    context: RecommendationContext,
    limit: number = 12
  ): Promise<RecommendationSet> {
    const cacheKey = this.generateCacheKey(type, context, limit)
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    let recommendations: RecommendationSet

    switch (type) {
      case 'recommended-items':
        recommendations = await this.getPersonalizedRecommendations(context, limit)
        break
      case 'frequently-bought':
        recommendations = await this.getFrequentlyBoughtTogether(context, limit)
        break
      case 'similar-products':
        recommendations = await this.getSimilarProducts(context, limit)
        break
      case 'category-popular':
        recommendations = await this.getCategoryPopular(context, limit)
        break
      case 'cross-category':
        recommendations = await this.getCrossCategoryRecommendations(context, limit)
        break
      case 'price-alternatives':
        recommendations = await this.getPriceAlternatives(context, limit)
        break
      case 'recently-viewed':
        recommendations = await this.getRecentlyViewed(context, limit)
        break
      case 'trending':
        recommendations = await this.getTrendingProducts(context, limit)
        break
      default:
        recommendations = await this.getFallbackRecommendations(context, limit)
    }

    this.cache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    })

    return recommendations
  }

  // Personalized recommendations using hybrid approach
  private static async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const products: RecommendedProduct[] = []

    // Simulate AI-powered personalization
    if (context.userId && context.previousPurchases?.length) {
      // Collaborative filtering based on similar users
      const collaborativeProducts = await this.getCollaborativeFiltering(context, Math.ceil(limit * 0.4))
      products.push(...collaborativeProducts)
    }

    if (context.viewedProducts?.length || context.searchTerms?.length) {
      // Content-based filtering
      const contentBasedProducts = await this.getContentBasedRecommendations(context, Math.ceil(limit * 0.3))
      products.push(...contentBasedProducts)
    }

    // Fill remaining with popular items
    if (products.length < limit) {
      const popularProducts = await this.getPopularProducts(context, limit - products.length)
      products.push(...popularProducts)
    }

    return {
      title: 'Recommended for You',
      description: 'Products selected based on your preferences and browsing history',
      products: products.slice(0, limit),
      algorithm: RECOMMENDATION_STRATEGIES.HYBRID,
      confidence: 0.85,
      refreshRate: 30
    }
  }

  // Frequently bought together
  private static async getFrequentlyBoughtTogether(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    // Simulate market basket analysis
    const complementaryProducts = await this.getComplementaryProducts(context, limit)

    return {
      title: 'Frequently Bought Together',
      description: 'Customers who bought this item also bought these products',
      products: complementaryProducts,
      algorithm: RECOMMENDATION_STRATEGIES.COLLABORATIVE_FILTERING,
      confidence: 0.78,
      refreshRate: 60
    }
  }

  // Similar products based on content similarity
  private static async getSimilarProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    if (!context.productId) {
      return this.getFallbackRecommendations(context, limit)
    }

    // Simulate content-based similarity
    const similarProducts = await this.getContentSimilarProducts(context.productId, limit)

    return {
      title: 'Similar Products',
      description: 'Products with similar features and specifications',
      products: similarProducts,
      algorithm: RECOMMENDATION_STRATEGIES.CONTENT_BASED,
      confidence: 0.82,
      refreshRate: 120
    }
  }

  // Popular products in category
  private static async getCategoryPopular(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const categoryName = await this.getCategoryName(context.categoryId)
    const popularProducts = await this.getCategoryBestSellers(context.categoryId, limit)

    return {
      title: `Popular in ${categoryName}`,
      description: `Top-selling products in the ${categoryName.toLowerCase()} category`,
      products: popularProducts,
      algorithm: RECOMMENDATION_STRATEGIES.POPULARITY_BASED,
      confidence: 0.75,
      refreshRate: 60
    }
  }

  // Cross-category recommendations
  private static async getCrossCategoryRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const crossCategoryProducts = await this.getCrossCategoryProducts(context, limit)

    return {
      title: 'Customers Also Viewed',
      description: 'Explore products from related categories',
      products: crossCategoryProducts,
      algorithm: RECOMMENDATION_STRATEGIES.CATEGORY_AFFINITY,
      confidence: 0.68,
      refreshRate: 45
    }
  }

  // Price-based alternatives
  private static async getPriceAlternatives(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const priceAlternatives = await this.getPriceSimilarProducts(context, limit)

    return {
      title: 'Similar Price Range',
      description: 'Alternative products at comparable prices',
      products: priceAlternatives,
      algorithm: RECOMMENDATION_STRATEGIES.PRICE_SENSITIVITY,
      confidence: 0.72,
      refreshRate: 90
    }
  }

  // Recently viewed products
  private static async getRecentlyViewed(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    if (!context.viewedProducts?.length) {
      return this.getFallbackRecommendations(context, limit)
    }

    const recentProducts = await this.getRecentProductDetails(context.viewedProducts, limit)

    return {
      title: 'Recently Viewed',
      description: 'Products you viewed recently',
      products: recentProducts,
      algorithm: 'session_based',
      confidence: 0.90,
      refreshRate: 5
    }
  }

  // Trending products
  private static async getTrendingProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const trendingProducts = await this.getCurrentTrendingProducts(limit)

    return {
      title: 'Trending Now',
      description: 'Popular products that are trending today',
      products: trendingProducts,
      algorithm: RECOMMENDATION_STRATEGIES.POPULARITY_BASED,
      confidence: 0.70,
      refreshRate: 30
    }
  }

  // Fallback recommendations
  private static async getFallbackRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationSet> {
    const fallbackProducts = await this.getPopularProducts(context, limit)

    return {
      title: 'Popular Products',
      description: 'Popular products across all categories',
      products: fallbackProducts,
      algorithm: RECOMMENDATION_STRATEGIES.POPULARITY_BASED,
      confidence: 0.60,
      refreshRate: 120
    }
  }

  // Helper methods (these would typically call actual ML models or databases)
  private static async getCollaborativeFiltering(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    // Simulate collaborative filtering results
    return this.generateMockProducts(limit, 'Users with similar preferences also liked', 0.85)
  }

  private static async getContentBasedRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    // Simulate content-based recommendations
    return this.generateMockProducts(limit, 'Based on your browsing history', 0.80)
  }

  private static async getPopularProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Popular among all customers', 0.70)
  }

  private static async getComplementaryProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Frequently bought together', 0.78)
  }

  private static async getContentSimilarProducts(
    productId: string,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Similar features and specifications', 0.82)
  }

  private static async getCategoryBestSellers(
    categoryId: string | undefined,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Best-seller in category', 0.75)
  }

  private static async getCrossCategoryProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Related category suggestion', 0.68)
  }

  private static async getPriceSimilarProducts(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Similar price point', 0.72)
  }

  private static async getRecentProductDetails(
    productIds: string[],
    limit: number
  ): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(Math.min(productIds.length, limit), 'Recently viewed', 0.90)
  }

  private static async getCurrentTrendingProducts(limit: number): Promise<RecommendedProduct[]> {
    return this.generateMockProducts(limit, 'Trending this week', 0.70)
  }

  private static async getCategoryName(categoryId: string | undefined): Promise<string> {
    // Mock category lookup
    const categories: Record<string, string> = {
      'cricket-bats': 'Cricket Bats',
      'tennis-rackets': 'Tennis Rackets',
      'football-boots': 'Football Boots',
      'cricket-helmets': 'Cricket Helmets'
    }
    return categories[categoryId || ''] || 'Sports Equipment'
  }

  // Generate mock products for demonstration
  private static generateMockProducts(limit: number, reason: string, confidence: number): RecommendedProduct[] {
    const products: RecommendedProduct[] = []
    const categories = ['Cricket Bats', 'Tennis Rackets', 'Football Boots', 'Cricket Helmets', 'Sports Bags']
    const brands = ['Professional', 'Elite', 'Premium', 'Classic', 'Expert']

    for (let i = 0; i < limit; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const price = Math.round((Math.random() * 200 + 50) * 100) / 100
      const originalPrice = Math.random() > 0.7 ? Math.round(price * 1.2 * 100) / 100 : undefined
      
      products.push({
        id: `prod-${i + 1}-${Date.now()}`,
        name: `${brand} ${category.slice(0, -1)} ${i + 1}`,
        price,
        originalPrice,
        image: `/images/products/demo-product-${(i % 5) + 1}.jpg`,
        category,
        categoryId: category.toLowerCase().replace(/\s+/g, '-'),
        slug: `${brand.toLowerCase()}-${category.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        reviewCount: Math.floor(Math.random() * 500 + 10),
        inStock: Math.random() > 0.1, // 90% in stock
        isOnSale: !!originalPrice,
        reason,
        confidence,
        metadata: {
          similarity: Math.round(Math.random() * 100) / 100,
          popularityScore: Math.round(Math.random() * 100) / 100,
          compatibilityScore: Math.round(Math.random() * 100) / 100
        }
      })
    }

    return products
  }

  private static generateCacheKey(
    type: RecommendationType,
    context: RecommendationContext,
    limit: number
  ): string {
    const contextKey = [
      context.userId,
      context.productId,
      context.categoryId,
      context.previousPurchases?.join(','),
      context.cartItems?.join(',')
    ].filter(Boolean).join('|')

    return `${type}:${limit}:${contextKey}`
  }

  // Clear cache (useful for testing or when user data changes significantly)
  static clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}