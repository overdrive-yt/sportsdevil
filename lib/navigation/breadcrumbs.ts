// Breadcrumb Navigation System
// Provides intelligent breadcrumb generation for dynamic routing and category hierarchies

export interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
  icon?: string
  metadata?: Record<string, any>
}

export interface BreadcrumbConfig {
  showHome?: boolean
  homeLabel?: string
  homeHref?: string
  separator?: string
  maxItems?: number
  showIcons?: boolean
  clickable?: boolean
}

export interface CategoryHierarchy {
  id: string
  name: string
  slug: string
  parentId?: string
  level: number
  children?: CategoryHierarchy[]
}

// Category hierarchy data (in a real app, this would come from a database)
export const CATEGORY_HIERARCHY: CategoryHierarchy[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    slug: 'cricket',
    level: 0,
    children: [
      {
        id: 'cricket-bats',
        name: 'Cricket Bats',
        slug: 'cricket-bats',
        parentId: 'cricket',
        level: 1,
        children: [
          { id: 'english-willow', name: 'English Willow', slug: 'english-willow', parentId: 'cricket-bats', level: 2 },
          { id: 'kashmir-willow', name: 'Kashmir Willow', slug: 'kashmir-willow', parentId: 'cricket-bats', level: 2 },
          { id: 'junior-bats', name: 'Junior Bats', slug: 'junior-bats', parentId: 'cricket-bats', level: 2 }
        ]
      },
      {
        id: 'cricket-balls',
        name: 'Cricket Balls',
        slug: 'cricket-balls',
        parentId: 'cricket',
        level: 1,
        children: [
          { id: 'leather-balls', name: 'Leather Balls', slug: 'leather-balls', parentId: 'cricket-balls', level: 2 },
          { id: 'practice-balls', name: 'Practice Balls', slug: 'practice-balls', parentId: 'cricket-balls', level: 2 }
        ]
      },
      {
        id: 'cricket-protective',
        name: 'Protective Gear',
        slug: 'cricket-protective',
        parentId: 'cricket',
        level: 1,
        children: [
          { id: 'cricket-helmets', name: 'Helmets', slug: 'cricket-helmets', parentId: 'cricket-protective', level: 2 },
          { id: 'cricket-pads', name: 'Pads', slug: 'cricket-pads', parentId: 'cricket-protective', level: 2 },
          { id: 'cricket-gloves', name: 'Gloves', slug: 'cricket-gloves', parentId: 'cricket-protective', level: 2 }
        ]
      }
    ]
  },
  {
    id: 'tennis',
    name: 'Tennis',
    slug: 'tennis',
    level: 0,
    children: [
      {
        id: 'tennis-rackets',
        name: 'Tennis Rackets',
        slug: 'tennis-rackets',
        parentId: 'tennis',
        level: 1,
        children: [
          { id: 'professional-rackets', name: 'Professional', slug: 'professional-rackets', parentId: 'tennis-rackets', level: 2 },
          { id: 'junior-tennis', name: 'Junior Rackets', slug: 'junior-tennis', parentId: 'tennis-rackets', level: 2 }
        ]
      },
      {
        id: 'tennis-balls',
        name: 'Tennis Balls',
        slug: 'tennis-balls',
        parentId: 'tennis',
        level: 1
      },
      {
        id: 'tennis-strings',
        name: 'Tennis Strings',
        slug: 'tennis-strings',
        parentId: 'tennis',
        level: 1
      }
    ]
  },
  {
    id: 'football',
    name: 'Football',
    slug: 'football',
    level: 0,
    children: [
      {
        id: 'football-boots',
        name: 'Football Boots',
        slug: 'football-boots',
        parentId: 'football',
        level: 1,
        children: [
          { id: 'firm-ground', name: 'Firm Ground (FG)', slug: 'firm-ground', parentId: 'football-boots', level: 2 },
          { id: 'soft-ground', name: 'Soft Ground (SG)', slug: 'soft-ground', parentId: 'football-boots', level: 2 },
          { id: 'artificial-grass', name: 'Artificial Grass (AG)', slug: 'artificial-grass', parentId: 'football-boots', level: 2 }
        ]
      },
      {
        id: 'footballs',
        name: 'Footballs',
        slug: 'footballs',
        parentId: 'football',
        level: 1
      }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness',
    slug: 'fitness',
    level: 0,
    children: [
      { id: 'gym-equipment', name: 'Gym Equipment', slug: 'gym-equipment', parentId: 'fitness', level: 1 },
      { id: 'weights', name: 'Weights', slug: 'weights', parentId: 'fitness', level: 1 },
      { id: 'cardio', name: 'Cardio Equipment', slug: 'cardio', parentId: 'fitness', level: 1 }
    ]
  }
]

export class BreadcrumbGenerator {
  private static categoryMap: Map<string, CategoryHierarchy>
  
  // Initialize category map for fast lookups
  static {
    this.categoryMap = new Map()
    this.buildCategoryMap(CATEGORY_HIERARCHY)
  }

  private static buildCategoryMap(categories: CategoryHierarchy[]) {
    categories.forEach(category => {
      this.categoryMap.set(category.slug, category)
      this.categoryMap.set(category.id, category)
      if (category.children) {
        this.buildCategoryMap(category.children)
      }
    })
  }

  // Main breadcrumb generation method
  static generateBreadcrumbs(
    currentPath: string,
    config: BreadcrumbConfig = {}
  ): BreadcrumbItem[] {
    const {
      showHome = true,
      homeLabel = 'Home',
      homeHref = '/',
      maxItems = 5,
      showIcons = false
    } = config

    const breadcrumbs: BreadcrumbItem[] = []

    // Add home breadcrumb
    if (showHome) {
      breadcrumbs.push({
        label: homeLabel,
        href: homeHref,
        icon: showIcons ? 'home' : undefined
      })
    }

    // Parse the current path
    const pathSegments = this.parsePathSegments(currentPath)
    const pathBreadcrumbs = this.buildPathBreadcrumbs(pathSegments, showIcons)
    
    breadcrumbs.push(...pathBreadcrumbs)

    // Limit the number of items if specified
    if (maxItems && breadcrumbs.length > maxItems) {
      // Keep home, add ellipsis, and show last few items
      const keptItems = Math.max(2, maxItems - 2) // Reserve space for home and ellipsis
      const trimmed = [
        breadcrumbs[0], // Home
        { label: '...', href: '#', isCurrent: false }, // Ellipsis
        ...breadcrumbs.slice(-keptItems + 1) // Last few items
      ]
      return trimmed
    }

    // Mark the last item as current
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isCurrent = true
    }

    return breadcrumbs
  }

  // Generate breadcrumbs for category hierarchy
  static generateCategoryBreadcrumbs(
    categorySlug: string,
    config: BreadcrumbConfig = {}
  ): BreadcrumbItem[] {
    const {
      showHome = true,
      homeLabel = 'Home',
      homeHref = '/',
      showIcons = false
    } = config

    const breadcrumbs: BreadcrumbItem[] = []

    // Add home breadcrumb
    if (showHome) {
      breadcrumbs.push({
        label: homeLabel,
        href: homeHref,
        icon: showIcons ? 'home' : undefined
      })
    }

    // Build category hierarchy path
    const categoryPath = this.buildCategoryPath(categorySlug)
    
    categoryPath.forEach((category, index) => {
      const isLast = index === categoryPath.length - 1
      breadcrumbs.push({
        label: category.name,
        href: `/category/${category.slug}`,
        isCurrent: isLast,
        icon: showIcons ? this.getCategoryIcon(category.slug) : undefined,
        metadata: {
          categoryId: category.id,
          level: category.level
        }
      })
    })

    return breadcrumbs
  }

  // Generate breadcrumbs for product pages
  static generateProductBreadcrumbs(
    productSlug: string,
    productName: string,
    categorySlug?: string,
    config: BreadcrumbConfig = {}
  ): BreadcrumbItem[] {
    const { showIcons = false } = config
    let breadcrumbs: BreadcrumbItem[] = []

    // Start with category breadcrumbs if available
    if (categorySlug) {
      breadcrumbs = this.generateCategoryBreadcrumbs(categorySlug, {
        ...config,
        // Don't mark category as current since product is current
        showHome: config.showHome
      })
      // Remove current flag from category
      breadcrumbs.forEach(item => { item.isCurrent = false })
    } else {
      // Just add home if no category
      if (config.showHome !== false) {
        breadcrumbs.push({
          label: config.homeLabel || 'Home',
          href: config.homeHref || '/',
          icon: showIcons ? 'home' : undefined
        })
      }
    }

    // Add the product
    breadcrumbs.push({
      label: productName,
      href: `/product/${productSlug}`,
      isCurrent: true,
      icon: showIcons ? 'package' : undefined,
      metadata: {
        type: 'product',
        slug: productSlug
      }
    })

    return breadcrumbs
  }

  // Generate breadcrumbs for search results
  static generateSearchBreadcrumbs(
    searchTerm: string,
    categorySlug?: string,
    config: BreadcrumbConfig = {}
  ): BreadcrumbItem[] {
    const { showIcons = false } = config
    let breadcrumbs: BreadcrumbItem[] = []

    // Add home
    if (config.showHome !== false) {
      breadcrumbs.push({
        label: config.homeLabel || 'Home',
        href: config.homeHref || '/',
        icon: showIcons ? 'home' : undefined
      })
    }

    // Add category if provided
    if (categorySlug) {
      const category = this.categoryMap.get(categorySlug)
      if (category) {
        breadcrumbs.push({
          label: category.name,
          href: `/category/${category.slug}`,
          icon: showIcons ? this.getCategoryIcon(category.slug) : undefined
        })
      }
    }

    // Add search
    breadcrumbs.push({
      label: `Search: "${searchTerm}"`,
      href: `/search?q=${encodeURIComponent(searchTerm)}${categorySlug ? `&category=${categorySlug}` : ''}`,
      isCurrent: true,
      icon: showIcons ? 'search' : undefined,
      metadata: {
        type: 'search',
        term: searchTerm,
        category: categorySlug
      }
    })

    return breadcrumbs
  }

  // Parse URL path segments
  private static parsePathSegments(path: string): string[] {
    return path
      .replace(/^\//, '') // Remove leading slash
      .replace(/\/$/, '') // Remove trailing slash
      .split('/')
      .filter(segment => segment.length > 0)
  }

  // Build breadcrumbs from path segments
  private static buildPathBreadcrumbs(segments: string[], showIcons: boolean): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Try to get a friendly name for the segment
      const friendlyName = this.getFriendlySegmentName(segment, segments, index)
      
      breadcrumbs.push({
        label: friendlyName,
        href: currentPath,
        icon: showIcons ? this.getSegmentIcon(segment, index) : undefined,
        metadata: {
          segment,
          index,
          originalPath: currentPath
        }
      })
    })

    return breadcrumbs
  }

  // Build category path from leaf to root
  private static buildCategoryPath(categorySlug: string): CategoryHierarchy[] {
    const path: CategoryHierarchy[] = []
    let currentCategory = this.categoryMap.get(categorySlug)

    while (currentCategory) {
      path.unshift(currentCategory)
      if (currentCategory.parentId) {
        currentCategory = this.categoryMap.get(currentCategory.parentId)
      } else {
        break
      }
    }

    return path
  }

  // Get friendly name for path segment
  private static getFriendlySegmentName(segment: string, allSegments: string[], index: number): string {
    // Check if this is a category
    const category = this.categoryMap.get(segment)
    if (category) {
      return category.name
    }

    // Handle special routes
    const routeMap: Record<string, string> = {
      'products': 'Products',
      'product': 'Product',
      'category': 'Category',
      'search': 'Search',
      'cart': 'Shopping Cart',
      'checkout': 'Checkout',
      'account': 'My Account',
      'orders': 'Orders',
      'wishlist': 'Wishlist',
      'about': 'About Us',
      'contact': 'Contact',
      'blog': 'Blog',
      'sale': 'Sale'
    }

    if (routeMap[segment]) {
      return routeMap[segment]
    }

    // Convert kebab-case or snake_case to title case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase())
  }

  // Get icon for segment
  private static getSegmentIcon(segment: string, index: number): string | undefined {
    const iconMap: Record<string, string> = {
      'products': 'package',
      'product': 'package',
      'category': 'folder',
      'search': 'search',
      'cart': 'shopping-cart',
      'checkout': 'credit-card',
      'account': 'user',
      'orders': 'clipboard-list',
      'wishlist': 'heart',
      'blog': 'book-open',
      'sale': 'percent'
    }

    return iconMap[segment] || (index === 0 ? 'folder' : undefined)
  }

  // Get category icon
  private static getCategoryIcon(categorySlug: string): string {
    const iconMap: Record<string, string> = {
      'cricket': 'cricket-bat',
      'cricket-bats': 'cricket-bat',
      'cricket-balls': 'circle',
      'cricket-protective': 'shield',
      'tennis': 'tennis',
      'tennis-rackets': 'tennis',
      'football': 'football',
      'football-boots': 'shoe',
      'fitness': 'dumbbell',
      'gym-equipment': 'dumbbell',
      'weights': 'weight',
      'cardio': 'heart'
    }

    return iconMap[categorySlug] || 'folder'
  }

  // Get all available categories (useful for admin/debugging)
  static getAllCategories(): CategoryHierarchy[] {
    return CATEGORY_HIERARCHY
  }

  // Find category by ID or slug
  static findCategory(identifier: string): CategoryHierarchy | undefined {
    return this.categoryMap.get(identifier)
  }

  // Get category children
  static getCategoryChildren(categorySlug: string): CategoryHierarchy[] {
    const category = this.categoryMap.get(categorySlug)
    return category?.children || []
  }

  // Get category parents (breadcrumb path)
  static getCategoryParents(categorySlug: string): CategoryHierarchy[] {
    const path = this.buildCategoryPath(categorySlug)
    return path.slice(0, -1) // Exclude the category itself
  }
}