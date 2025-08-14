// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// WooCommerce REST API Service for One-Time Product Migration

export interface WooCommerceConfig {
  siteUrl: string
  consumerKey: string
  consumerSecret: string
}

export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock'
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  images: Array<{
    id: number
    src: string
    name: string
    alt: string
  }>
  attributes: Array<{
    id: number
    name: string
    options: string[]
  }>
  meta_data: Array<{
    key: string
    value: any
  }>
  status: 'publish' | 'draft'
  featured: boolean
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  image: {
    src: string
    alt: string
  } | null
  count: number
}

export class WooCommerceMigrationAPI {
  private config: WooCommerceConfig
  private baseUrl: string

  constructor(config: WooCommerceConfig) {
    this.config = config
    this.baseUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-json/wc/v3`
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    // Add API credentials
    url.searchParams.append('consumer_key', this.config.consumerKey)
    url.searchParams.append('consumer_secret', this.config.consumerSecret)
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })

    console.log('🔄 Fetching:', endpoint)
    
    try {
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ WooCommerce API request failed:', error)
      throw error
    }
  }

  // Test API connectivity
  async testConnection(): Promise<{ success: boolean; message: string; siteInfo?: any }> {
    try {
      const siteInfo = await this.makeRequest('/system_status')
      return {
        success: true,
        message: 'WooCommerce API connection successful!',
        siteInfo: {
          version: siteInfo.environment?.wp_version,
          wooVersion: siteInfo.environment?.version,
          siteName: siteInfo.settings?.general?.title
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Fetch all products with pagination
  async getAllProducts(categoryFilter?: string): Promise<WooCommerceProduct[]> {
    const allProducts: WooCommerceProduct[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      console.log(`📦 Fetching products page ${page}...`)
      
      const params: any = {
        page,
        per_page: perPage,
        status: 'publish'
      }
      
      // Add category filter if specified
      if (categoryFilter) {
        params.category = categoryFilter
      }
      
      const products = await this.makeRequest('/products', params)
      
      if (products.length === 0) break
      
      allProducts.push(...products)
      
      if (products.length < perPage) break
      page++
    }
    
    console.log(`✅ Fetched ${allProducts.length} total products`)
    return allProducts
  }

  // Fetch products by category name with strict filtering
  async getProductsByCategory(categoryName: string): Promise<WooCommerceProduct[]> {
    console.log(`🧤 Searching for products in category: ${categoryName}`)
    
    // First get all categories to find the ID
    const categories = await this.getAllCategories()
    
    let targetCategories: WooCommerceCategory[] = []
    
    // Special handling for wicket keeping products - comprehensive search
    if (categoryName.toLowerCase() === 'wicket keeping') {
      targetCategories = categories.filter(cat => {
        const name = cat.name.toLowerCase()
        const slug = cat.slug.toLowerCase()
        return (
          name.includes('wicket keeping') ||
          name.includes('wicket-keeping') ||
          name.includes('wicketkeeping') ||
          name.includes('keeper') ||
          name.includes('wk') ||
          slug.includes('wicket-keeping') ||
          slug.includes('wicket_keeping') ||
          slug.includes('wicketkeeping') ||
          slug.includes('keeper') ||
          slug.includes('wk')
        )
      })
    } else {
      // For other categories, use partial matching
      targetCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        cat.slug.toLowerCase().includes(categoryName.toLowerCase())
      )
    }
    
    if (targetCategories.length === 0) {
      console.log(`❌ No categories found matching: ${categoryName}`)
      return []
    }
    
    console.log(`✅ Found ${targetCategories.length} matching categories:`, 
      targetCategories.map(c => c.name).join(', '))
    
    const allProducts: WooCommerceProduct[] = []
    
    // Get products from each matching category
    for (const category of targetCategories) {
      const products = await this.getAllProducts(category.id.toString())
      allProducts.push(...products)
    }
    
    // For wicket keeping, apply additional name filtering to ensure only WK products
    let filteredProducts = allProducts
    if (categoryName.toLowerCase() === 'wicket keeping') {
      filteredProducts = allProducts.filter(product => {
        const name = product.name.toLowerCase()
        // Must contain wicket keeping related terms
        const wicketKeepingTerms = [
          'wicket keeping',
          'wicket-keeping', 
          'wicketkeeping',
          'wk ',
          'keeper',
          'keeping',
          'wicket glove',
          'wicket pad'
        ]
        
        const hasWicketKeepingTerm = wicketKeepingTerms.some(term => name.includes(term))
        
        // Also check for specific product types we expect
        const isExpectedProduct = (
          (name.includes('glove') && (name.includes('keeping') || name.includes('wicket') || name.includes('wk'))) ||
          (name.includes('pad') && (name.includes('keeping') || name.includes('wicket') || name.includes('wk'))) ||
          (name.includes('inner') && name.includes('glove'))
        )
        
        // Exclude non-wicket keeping items that might be miscategorized
        const excludeTerms = ['bat', 'helmet', 'thigh', 'elbow', 'chest', 'abdomen']
        const hasExcludeTerm = excludeTerms.some(term => name.includes(term))
        
        return (hasWicketKeepingTerm || isExpectedProduct) && !hasExcludeTerm
      })
      
      console.log(`🧤 Filtered to ${filteredProducts.length} wicket keeping products:`)
      
      // Age category breakdown
      const juniorProducts = filteredProducts.filter(p => p.name.toLowerCase().includes('junior'))
      const mensProducts = filteredProducts.filter(p => !p.name.toLowerCase().includes('junior'))
      
      console.log(`👨 Age breakdown: ${mensProducts.length} Mens, ${juniorProducts.length} Junior`)
      
      if (mensProducts.length > 0) {
        console.log(`  📋 Mens Products:`)
        mensProducts.forEach(product => {
          console.log(`    - ${product.name}`)
        })
      }
      
      if (juniorProducts.length > 0) {
        console.log(`  📋 Junior Products:`)
        juniorProducts.forEach(product => {
          console.log(`    - ${product.name}`)
        })
      }
    }
    
    return filteredProducts
  }

  // Get ALL products for images only (no content filtering)
  async getProductsImagesOnly(): Promise<WooCommerceProduct[]> {
    console.log(`📸 Fetching ALL products for IMAGE EXTRACTION ONLY...`)
    console.log(`🎯 Focus: Extract all images - no product content filtering applied`)
    console.log(`📋 Note: WK/cricket ball exclusion handled by local database matching`)
    
    // Get ALL products including WK and cricket balls for their images
    const allProducts = await this.getAllProducts()
    
    console.log(`✅ Retrieved ${allProducts.length} total products for image extraction`)
    console.log(`📊 Images will be matched to local database products (which excludes WK/cricket balls)`)
    
    return allProducts
  }

  // Get products excluding wicket keeping and cricket balls
  async getProductsExcludingWKAndBalls(): Promise<WooCommerceProduct[]> {
    console.log(`🚫 Fetching ALL products EXCEPT wicket keeping & cricket balls...`)
    
    // First get all products
    const allProducts = await this.getAllProducts()
    
    // Apply exclusion filters (inverse of wicket keeping filter)
    const filteredProducts = allProducts.filter(product => {
      const name = product.name.toLowerCase()
      const description = product.description?.toLowerCase() || ''
      const shortDescription = product.short_description?.toLowerCase() || ''
      
      // Exclude wicket keeping terms
      const wicketKeepingTerms = [
        'wicket keeping',
        'wicket-keeping', 
        'wicketkeeping',
        'wk ',
        'keeper',
        'keeping',
        'wicket glove',
        'wicket pad'
      ]
      
      const hasWicketKeepingTerm = wicketKeepingTerms.some(term => 
        name.includes(term) || description.includes(term) || shortDescription.includes(term)
      )
      
      // Exclude specific wicket keeping products
      const isWicketKeepingProduct = (
        (name.includes('glove') && (name.includes('keeping') || name.includes('wicket') || name.includes('wk'))) ||
        (name.includes('pad') && (name.includes('keeping') || name.includes('wicket') || name.includes('wk'))) ||
        (name.includes('inner') && name.includes('glove'))
      )
      
      // Exclude cricket ball terms
      const cricketBallTerms = [
        'cricket ball',
        'cricket-ball',
        'ball cricket',
        'ball, cricket',
        'leather ball',
        'match ball',
        'test ball',
        'red ball',
        'white ball'
      ]
      
      const hasCricketBallTerm = cricketBallTerms.some(term => 
        name.includes(term) || description.includes(term) || shortDescription.includes(term)
      )
      
      // Check categories for exclusion
      const hasExcludedCategory = product.categories?.some(cat => {
        const catName = cat.name.toLowerCase()
        const catSlug = cat.slug.toLowerCase()
        return (
          catName.includes('wicket keeping') ||
          catName.includes('wicket-keeping') ||
          catName.includes('keeper') ||
          catName.includes('cricket ball') ||
          catName.includes('ball') ||
          catSlug.includes('wicket-keeping') ||
          catSlug.includes('wicket_keeping') ||
          catSlug.includes('keeper') ||
          catSlug.includes('cricket-ball') ||
          catSlug.includes('ball')
        )
      })
      
      // Product is EXCLUDED if it matches any exclusion criteria
      const shouldExclude = hasWicketKeepingTerm || isWicketKeepingProduct || hasCricketBallTerm || hasExcludedCategory
      
      // Log excluded products for debugging
      if (shouldExclude) {
        console.log(`🚫 EXCLUDING: ${product.name}`)
        if (hasWicketKeepingTerm) console.log(`   Reason: Wicket keeping terms`)
        if (isWicketKeepingProduct) console.log(`   Reason: Wicket keeping product type`)
        if (hasCricketBallTerm) console.log(`   Reason: Cricket ball terms`)
        if (hasExcludedCategory) console.log(`   Reason: Excluded category`)
      }
      
      return !shouldExclude // Return products that are NOT excluded
    })
    
    console.log(`✅ Filtered to ${filteredProducts.length} products (excluded ${allProducts.length - filteredProducts.length} WK & cricket ball items)`)
    
    // Category breakdown of included products
    const categoryBreakdown: Record<string, number> = {}
    filteredProducts.forEach(product => {
      product.categories?.forEach(cat => {
        categoryBreakdown[cat.name] = (categoryBreakdown[cat.name] || 0) + 1
      })
    })
    
    console.log(`📊 Included product categories:`)
    Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} products`)
      })
    
    return filteredProducts
  }

  // Search products by keyword
  async searchProducts(search: string): Promise<WooCommerceProduct[]> {
    const allProducts: WooCommerceProduct[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      console.log(`🔍 Searching products page ${page} for: ${search}`)
      
      const products = await this.makeRequest('/products', {
        page,
        per_page: perPage,
        status: 'publish',
        search: search
      })
      
      if (products.length === 0) break
      
      allProducts.push(...products)
      
      if (products.length < perPage) break
      page++
    }
    
    return allProducts
  }

  // Fetch all categories
  async getAllCategories(): Promise<WooCommerceCategory[]> {
    const allCategories: WooCommerceCategory[] = []
    let page = 1
    const perPage = 100
    
    while (true) {
      console.log(`📁 Fetching categories page ${page}...`)
      
      const categories = await this.makeRequest('/products/categories', {
        page,
        per_page: perPage,
        hide_empty: false
      })
      
      if (categories.length === 0) break
      
      allCategories.push(...categories)
      
      if (categories.length < perPage) break
      page++
    }
    
    console.log(`✅ Fetched ${allCategories.length} total categories`)
    return allCategories
  }

  // Get single product with full details
  async getProduct(productId: number): Promise<WooCommerceProduct> {
    return await this.makeRequest(`/products/${productId}`)
  }

  // Get products count for progress tracking
  async getProductsCount(): Promise<number> {
    const response = await this.makeRequest('/products', {
      page: 1,
      per_page: 1,
      status: 'publish'
    })
    
    // WooCommerce sends total count in headers, but we'll estimate from pagination
    const totalEstimate = await this.getAllProducts()
    return totalEstimate.length
  }
}

// Data transformation utilities
export class WooCommerceTransformer {
  // Transform WooCommerce product to Sports Devil format
  static transformProduct(wcProduct: WooCommerceProduct) {
    return {
      name: wcProduct.name,
      slug: wcProduct.slug,
      description: wcProduct.description,
      shortDescription: wcProduct.short_description,
      price: parseFloat(wcProduct.regular_price || wcProduct.price || '0'),
      originalPrice: wcProduct.sale_price ? parseFloat(wcProduct.regular_price || '0') : null,
      sku: wcProduct.sku || `WC-${wcProduct.id}`,
      stockQuantity: wcProduct.stock_quantity || 0,
      isActive: wcProduct.status === 'publish',
      isFeatured: wcProduct.featured,
      weight: wcProduct.weight ? parseFloat(wcProduct.weight) : null,
      dimensions: wcProduct.dimensions ? 
        `${wcProduct.dimensions.length}x${wcProduct.dimensions.width}x${wcProduct.dimensions.height}` : null,
      // Keep WooCommerce ID for reference
      wcId: wcProduct.id,
      wcPermalink: wcProduct.permalink
    }
  }

  // Transform WooCommerce category to Sports Devil format
  static transformCategory(wcCategory: WooCommerceCategory, parentMapping: Map<number, string>) {
    return {
      name: wcCategory.name,
      slug: wcCategory.slug,
      description: wcCategory.description,
      parentId: wcCategory.parent ? parentMapping.get(wcCategory.parent) : null,
      isActive: true,
      // Keep WooCommerce ID for reference
      wcId: wcCategory.id
    }
  }

  // Extract product images
  static extractImages(wcProduct: WooCommerceProduct) {
    return wcProduct.images.map((image, index) => ({
      url: image.src,
      alt: image.alt || wcProduct.name,
      caption: image.name,
      isPrimary: index === 0,
      sortOrder: index,
      wcImageId: image.id
    }))
  }

  // Extract product attributes
  static extractAttributes(wcProduct: WooCommerceProduct) {
    return wcProduct.attributes.map(attr => ({
      name: attr.name,
      options: attr.options,
      wcAttributeId: attr.id
    }))
  }
}