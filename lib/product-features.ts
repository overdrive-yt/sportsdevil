/**
 * Advanced product features for Sports Devil Cricket Equipment
 * Handles recommendations, wishlists, comparisons, and cricket equipment guides
 */

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  sku: string
  category: string
  subcategory?: string
  brand: string
  images: string[]
  inStock: boolean
  stockLevel: number
  rating: number
  reviewCount: number
  features: string[]
  specifications: Record<string, string>
  tags: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  materials?: string[]
  suitableFor?: string[] // e.g., ['professional', 'amateur', 'junior']
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product?: Product
  addedAt: Date
  notifyWhenAvailable: boolean
  targetPrice?: number
}

export interface ProductComparison {
  products: Product[]
  comparisonFields: string[]
}

export interface CricketGuide {
  id: string
  title: string
  slug: string
  category: 'buying-guide' | 'how-to' | 'maintenance' | 'rules'
  content: string
  relatedProducts: string[]
  tags: string[]
  author: string
  publishedAt: Date
  updatedAt: Date
}

/**
 * Product recommendation engine for Sports Devil
 */
export class ProductRecommendationEngine {
  
  // Collaborative filtering - recommend based on what similar customers bought
  static async getCollaborativeRecommendations(userId: string, limit: number = 6): Promise<Product[]> {
    try {
      // In a real implementation, this would analyze user purchase history
      // and find similar customers to recommend products
      
      // Mock implementation - would be replaced with actual algorithm
      const mockRecommendations: Product[] = [
        {
          id: 'rec-1',
          name: 'Professional English Willow Cricket Bat',
          slug: 'professional-english-willow-cricket-bat',
          description: 'Premium cricket bat made from finest English willow',
          price: 89.99,
          originalPrice: 119.99,
          sku: 'BAT-ENG-001',
          category: 'cricket-bats',
          subcategory: 'professional-bats',
          brand: 'Sports Devil Pro',
          images: ['/images/cricket-bat-professional.jpg'],
          inStock: true,
          stockLevel: 12,
          rating: 4.8,
          reviewCount: 24,
          features: ['English Willow', 'Professional Grade', 'Hand Crafted'],
          specifications: {
            'Weight': '2lb 8oz - 2lb 12oz',
            'Handle': 'Cane Handle',
            'Blade': 'English Willow',
            'Grip': 'Chevron Grip'
          },
          tags: ['professional', 'english-willow', 'premium'],
          weight: 1.25,
          suitableFor: ['professional', 'amateur'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return mockRecommendations.slice(0, limit)

    } catch (error) {
      console.error('Error getting collaborative recommendations:', error)
      return []
    }
  }

  // Content-based filtering - recommend similar products
  static async getContentBasedRecommendations(productId: string, limit: number = 6): Promise<Product[]> {
    try {
      // In a real implementation, this would analyze product features,
      // categories, tags, and specifications to find similar products
      
      // Mock implementation
      const mockSimilarProducts: Product[] = [
        {
          id: 'similar-1',
          name: 'Kashmir Willow Cricket Bat',
          slug: 'kashmir-willow-cricket-bat',
          description: 'Quality cricket bat made from Kashmir willow',
          price: 49.99,
          sku: 'BAT-KAS-001',
          category: 'cricket-bats',
          subcategory: 'amateur-bats',
          brand: 'Sports Devil',
          images: ['/images/cricket-bat-kashmir.jpg'],
          inStock: true,
          stockLevel: 8,
          rating: 4.3,
          reviewCount: 15,
          features: ['Kashmir Willow', 'Good Balance', 'Affordable'],
          specifications: {
            'Weight': '2lb 6oz - 2lb 10oz',
            'Handle': 'Cane Handle',
            'Blade': 'Kashmir Willow',
            'Grip': 'Standard Grip'
          },
          tags: ['amateur', 'kashmir-willow', 'affordable'],
          weight: 1.15,
          suitableFor: ['amateur', 'junior'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return mockSimilarProducts.slice(0, limit)

    } catch (error) {
      console.error('Error getting content-based recommendations:', error)
      return []
    }
  }

  // Category-based recommendations
  static async getCategoryRecommendations(category: string, excludeProductId?: string, limit: number = 6): Promise<Product[]> {
    try {
      // Mock implementation - would query database for popular products in category
      const mockCategoryProducts: Product[] = [
        {
          id: 'cat-1',
          name: 'Premium Batting Pads',
          slug: 'premium-batting-pads',
          description: 'Professional grade batting pads with superior protection',
          price: 69.99,
          sku: 'PAD-PREM-001',
          category: 'protective-gear',
          subcategory: 'batting-pads',
          brand: 'Sports Devil Pro',
          images: ['/images/batting-pads-premium.jpg'],
          inStock: true,
          stockLevel: 15,
          rating: 4.6,
          reviewCount: 18,
          features: ['Lightweight', 'Maximum Protection', 'Comfortable Fit'],
          specifications: {
            'Size': 'Adult',
            'Material': 'High-density foam',
            'Straps': 'Adjustable velcro',
            'Weight': '850g'
          },
          tags: ['professional', 'protection', 'lightweight'],
          weight: 0.85,
          suitableFor: ['professional', 'amateur'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return mockCategoryProducts
        .filter(p => p.id !== excludeProductId)
        .slice(0, limit)

    } catch (error) {
      console.error('Error getting category recommendations:', error)
      return []
    }
  }

  // Recently viewed products
  static async getRecentlyViewedRecommendations(userId: string, limit: number = 6): Promise<Product[]> {
    try {
      // In a real implementation, track user viewing history
      // For now, return empty array
      return []

    } catch (error) {
      console.error('Error getting recently viewed recommendations:', error)
      return []
    }
  }

  // Trending products
  static async getTrendingProducts(category?: string, limit: number = 6): Promise<Product[]> {
    try {
      // Mock trending products based on view count, purchases, etc.
      const mockTrendingProducts: Product[] = [
        {
          id: 'trend-1',
          name: 'Pro Series Batting Gloves',
          slug: 'pro-series-batting-gloves',
          description: 'Professional batting gloves with superior grip and comfort',
          price: 29.99,
          sku: 'GLOVE-PRO-001',
          category: 'protective-gear',
          subcategory: 'batting-gloves',
          brand: 'Sports Devil Pro',
          images: ['/images/batting-gloves-pro.jpg'],
          inStock: true,
          stockLevel: 22,
          rating: 4.7,
          reviewCount: 31,
          features: ['Enhanced Grip', 'Breathable', 'Flexible'],
          specifications: {
            'Material': 'Premium leather',
            'Palm': 'Reinforced leather',
            'Closure': 'Velcro strap',
            'Sizes': 'Youth to Adult'
          },
          tags: ['professional', 'comfort', 'grip'],
          weight: 0.15,
          suitableFor: ['professional', 'amateur', 'junior'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return category 
        ? mockTrendingProducts.filter(p => p.category === category).slice(0, limit)
        : mockTrendingProducts.slice(0, limit)

    } catch (error) {
      console.error('Error getting trending products:', error)
      return []
    }
  }

  // Comprehensive recommendation system
  static async getRecommendations(options: {
    userId?: string
    productId?: string
    category?: string
    type?: 'collaborative' | 'content-based' | 'category' | 'trending' | 'mixed'
    limit?: number
  }): Promise<{ type: string; products: Product[] }[]> {
    const { userId, productId, category, type = 'mixed', limit = 6 } = options
    const recommendations: { type: string; products: Product[] }[] = []

    try {
      if (type === 'mixed' || type === 'collaborative') {
        if (userId) {
          const collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit)
          if (collaborativeRecs.length > 0) {
            recommendations.push({ type: 'collaborative', products: collaborativeRecs })
          }
        }
      }

      if (type === 'mixed' || type === 'content-based') {
        if (productId) {
          const contentRecs = await this.getContentBasedRecommendations(productId, limit)
          if (contentRecs.length > 0) {
            recommendations.push({ type: 'content-based', products: contentRecs })
          }
        }
      }

      if (type === 'mixed' || type === 'category') {
        if (category) {
          const categoryRecs = await this.getCategoryRecommendations(category, productId, limit)
          if (categoryRecs.length > 0) {
            recommendations.push({ type: 'category', products: categoryRecs })
          }
        }
      }

      if (type === 'mixed' || type === 'trending') {
        const trendingRecs = await this.getTrendingProducts(category, limit)
        if (trendingRecs.length > 0) {
          recommendations.push({ type: 'trending', products: trendingRecs })
        }
      }

      return recommendations

    } catch (error) {
      console.error('Error getting mixed recommendations:', error)
      return []
    }
  }
}

/**
 * Wishlist management for Sports Devil customers
 */
export class WishlistManager {
  
  static async addToWishlist(userId: string, productId: string, options?: {
    notifyWhenAvailable?: boolean
    targetPrice?: number
  }): Promise<WishlistItem> {
    try {
      const wishlistItem: WishlistItem = {
        id: `wishlist-${Date.now()}`,
        userId,
        productId,
        addedAt: new Date(),
        notifyWhenAvailable: options?.notifyWhenAvailable || false,
        targetPrice: options?.targetPrice,
      }

      // In a real implementation, save to database
      // await prisma.wishlistItem.create({ data: wishlistItem })

      console.log('Added to wishlist:', wishlistItem)
      return wishlistItem

    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      // In a real implementation, delete from database
      // await prisma.wishlistItem.deleteMany({
      //   where: { userId, productId }
      // })

      console.log('Removed from wishlist:', { userId, productId })
      return true

    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      // In a real implementation, fetch from database with product details
      // const wishlistItems = await prisma.wishlistItem.findMany({
      //   where: { userId },
      //   include: { product: true },
      //   orderBy: { addedAt: 'desc' }
      // })

      // Mock implementation
      const mockWishlistItems: WishlistItem[] = []
      return mockWishlistItems

    } catch (error) {
      console.error('Error getting user wishlist:', error)
      throw error
    }
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      // In a real implementation, check database
      // const exists = await prisma.wishlistItem.findFirst({
      //   where: { userId, productId }
      // })
      // return !!exists

      return false

    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  }

  static async getWishlistCount(userId: string): Promise<number> {
    try {
      // In a real implementation, count from database
      // const count = await prisma.wishlistItem.count({
      //   where: { userId }
      // })
      // return count

      return 0

    } catch (error) {
      console.error('Error getting wishlist count:', error)
      return 0
    }
  }
}

/**
 * Product comparison system for cricket equipment
 */
export class ProductComparison {
  
  static async compareProducts(productIds: string[]): Promise<ProductComparison> {
    try {
      if (productIds.length < 2 || productIds.length > 4) {
        throw new Error('Can compare 2-4 products at a time')
      }

      // In a real implementation, fetch products from database
      // const products = await prisma.product.findMany({
      //   where: { id: { in: productIds } }
      // })

      // Mock products for comparison
      const mockProducts: Product[] = productIds.map((id, index) => ({
        id,
        name: `Cricket Bat ${index + 1}`,
        slug: `cricket-bat-${index + 1}`,
        description: `Description for cricket bat ${index + 1}`,
        price: 59.99 + (index * 20),
        sku: `BAT-${index + 1}-001`,
        category: 'cricket-bats',
        brand: 'Sports Devil',
        images: [`/images/cricket-bat-${index + 1}.jpg`],
        inStock: true,
        stockLevel: 10 - index,
        rating: 4.5 - (index * 0.1),
        reviewCount: 20 - (index * 3),
        features: [`Feature ${index + 1}A`, `Feature ${index + 1}B`],
        specifications: {
          'Weight': `${2.4 + (index * 0.1)}lb`,
          'Material': index === 0 ? 'English Willow' : 'Kashmir Willow',
          'Handle': 'Cane Handle',
          'Grip': 'Standard Grip'
        },
        tags: ['cricket', 'bat'],
        weight: 1.1 + (index * 0.05),
        suitableFor: ['amateur'],
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      // Determine comparison fields based on product category
      const comparisonFields = this.getComparisonFields(mockProducts[0].category)

      return {
        products: mockProducts,
        comparisonFields
      }

    } catch (error) {
      console.error('Error comparing products:', error)
      throw error
    }
  }

  private static getComparisonFields(category: string): string[] {
    const fieldMappings: Record<string, string[]> = {
      'cricket-bats': [
        'price',
        'weight',
        'Material',
        'Handle',
        'Grip',
        'rating',
        'reviewCount',
        'inStock',
        'brand'
      ],
      'protective-gear': [
        'price',
        'weight',
        'Size',
        'Material',
        'Protection Level',
        'rating',
        'reviewCount',
        'inStock',
        'brand'
      ],
      'cricket-balls': [
        'price',
        'Type',
        'Material',
        'Color',
        'Competition Level',
        'rating',
        'reviewCount',
        'inStock',
        'brand'
      ],
      default: [
        'price',
        'rating',
        'reviewCount',
        'inStock',
        'brand'
      ]
    }

    return fieldMappings[category] || fieldMappings.default
  }

  static formatComparisonData(comparison: ProductComparison): any {
    const formatted = {
      products: comparison.products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0],
        price: p.price,
        originalPrice: p.originalPrice,
        rating: p.rating,
        reviewCount: p.reviewCount,
        inStock: p.inStock
      })),
      comparisons: {} as Record<string, string[]>
    }

    // Build comparison matrix
    for (const field of comparison.comparisonFields) {
      formatted.comparisons[field] = comparison.products.map(product => {
        if (field === 'price') return `£${product.price.toFixed(2)}`
        if (field === 'weight') return product.weight ? `${product.weight}kg` : 'N/A'
        if (field === 'rating') return `${product.rating}/5 (${product.reviewCount} reviews)`
        if (field === 'inStock') return product.inStock ? 'In Stock' : 'Out of Stock'
        if (field === 'brand') return product.brand
        
        // Check specifications
        return product.specifications[field] || 'N/A'
      })
    }

    return formatted
  }
}

/**
 * Cricket equipment guides and buying advice
 */
export class CricketGuideManager {
  
  private static guides: CricketGuide[] = [
    {
      id: 'bat-buying-guide',
      title: 'Complete Cricket Bat Buying Guide',
      slug: 'cricket-bat-buying-guide',
      category: 'buying-guide',
      content: `
        <h2>Choosing the Right Cricket Bat</h2>
        <p>Selecting the perfect cricket bat is crucial for your performance on the field. Here's everything you need to know:</p>
        
        <h3>Willow Types</h3>
        <ul>
          <li><strong>English Willow:</strong> Premium choice for professional players</li>
          <li><strong>Kashmir Willow:</strong> Great value option for amateur players</li>
        </ul>
        
        <h3>Weight Considerations</h3>
        <p>Cricket bats typically range from 2lb 6oz to 3lb. Choose based on your strength and playing style:</p>
        <ul>
          <li><strong>Light (2lb 6oz - 2lb 9oz):</strong> Better bat speed and control</li>
          <li><strong>Medium (2lb 10oz - 2lb 12oz):</strong> Balanced power and control</li>
          <li><strong>Heavy (2lb 13oz+):</strong> Maximum power for strong players</li>
        </ul>
        
        <h3>Grip and Handle</h3>
        <p>The grip affects feel and control. Consider:</p>
        <ul>
          <li>Grip thickness (thin, medium, thick)</li>
          <li>Handle type (cane or rubber)</li>
          <li>Replacement needs</li>
        </ul>
        
        <h3>Budget Guidelines</h3>
        <ul>
          <li><strong>Beginner:</strong> £30-60 (Kashmir willow)</li>
          <li><strong>Club Player:</strong> £60-120 (High-grade Kashmir or entry English)</li>
          <li><strong>Serious Amateur:</strong> £120-250 (Quality English willow)</li>
          <li><strong>Professional:</strong> £250+ (Premium English willow)</li>
        </ul>
      `,
      relatedProducts: ['bat-eng-001', 'bat-kas-001', 'bat-pro-001'],
      tags: ['cricket-bats', 'buying-guide', 'beginner'],
      author: 'Sports Devil Experts',
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'protective-gear-guide',
      title: 'Essential Cricket Protective Gear Guide',
      slug: 'cricket-protective-gear-guide',
      category: 'buying-guide',
      content: `
        <h2>Cricket Protective Equipment Essentials</h2>
        <p>Safety should never be compromised on the cricket field. Here's your complete guide to protective gear:</p>
        
        <h3>Batting Pads</h3>
        <ul>
          <li><strong>Traditional Pads:</strong> Classic design with cane inserts</li>
          <li><strong>Modern Pads:</strong> Lightweight with advanced materials</li>
          <li><strong>Wicket Keeping Pads:</strong> Specialized for keepers</li>
        </ul>
        
        <h3>Batting Gloves</h3>
        <p>Key features to consider:</p>
        <ul>
          <li>Palm material (leather vs. synthetic)</li>
          <li>Finger protection level</li>
          <li>Ventilation and comfort</li>
          <li>Wrist protection</li>
        </ul>
        
        <h3>Helmets</h3>
        <p>Modern cricket helmets must meet safety standards:</p>
        <ul>
          <li>BS 7928:2013 certification</li>
          <li>Proper fit and comfort</li>
          <li>Grille protection</li>
          <li>Ventilation system</li>
        </ul>
        
        <h3>Additional Protection</h3>
        <ul>
          <li><strong>Thigh Pads:</strong> Extra protection for fast bowling</li>
          <li><strong>Arm Guards:</strong> Shield against short balls</li>
          <li><strong>Chest Guards:</strong> Body protection</li>
          <li><strong>Abdominal Guards:</strong> Essential protection</li>
        </ul>
      `,
      relatedProducts: ['pad-bat-001', 'glove-bat-001', 'helmet-001'],
      tags: ['protective-gear', 'safety', 'buying-guide'],
      author: 'Sports Devil Safety Team',
      publishedAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]

  static async getGuide(slug: string): Promise<CricketGuide | null> {
    try {
      const guide = this.guides.find(g => g.slug === slug)
      return guide || null

    } catch (error) {
      console.error('Error getting guide:', error)
      return null
    }
  }

  static async getGuidesByCategory(category: CricketGuide['category']): Promise<CricketGuide[]> {
    try {
      return this.guides.filter(g => g.category === category)

    } catch (error) {
      console.error('Error getting guides by category:', error)
      return []
    }
  }

  static async getAllGuides(): Promise<CricketGuide[]> {
    try {
      return this.guides

    } catch (error) {
      console.error('Error getting all guides:', error)
      return []
    }
  }

  static async getRelatedGuides(productId: string): Promise<CricketGuide[]> {
    try {
      return this.guides.filter(g => g.relatedProducts.includes(productId))

    } catch (error) {
      console.error('Error getting related guides:', error)
      return []
    }
  }

  static async searchGuides(query: string): Promise<CricketGuide[]> {
    try {
      const lowercaseQuery = query.toLowerCase()
      return this.guides.filter(g => 
        g.title.toLowerCase().includes(lowercaseQuery) ||
        g.content.toLowerCase().includes(lowercaseQuery) ||
        g.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      )

    } catch (error) {
      console.error('Error searching guides:', error)
      return []
    }
  }
}

// Export singleton instances
export const productRecommendationEngine = ProductRecommendationEngine
export const wishlistManager = WishlistManager
export const productComparison = ProductComparison
export const cricketGuideManager = CricketGuideManager

export default {
  ProductRecommendationEngine,
  WishlistManager,
  ProductComparison,
  CricketGuideManager,
  productRecommendationEngine,
  wishlistManager,
  productComparison,
  cricketGuideManager,
}