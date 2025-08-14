/**
 * SEO optimization utilities for Sports Devil Cricket Equipment
 * Handles metadata generation, structured data, and Core Web Vitals optimization
 */

import { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  twitterImage?: string
  canonicalUrl?: string
  structuredData?: any
  noIndex?: boolean
}

export interface ProductSEO {
  id: string
  name: string
  description: string
  price: number
  category: string
  brand?: string
  sku?: string
  images: string[]
  inStock: boolean
  rating?: number
  reviewCount?: number
}

export interface CategorySEO {
  name: string
  description: string
  slug: string
  productCount: number
  image?: string
}

/**
 * Generate comprehensive metadata for Sports Devil pages
 */
export class SEOManager {
  private baseUrl = 'https://sportsdevil.co.uk'
  private siteName = 'Sports Devil Cricket'
  private businessName = 'Sports Devil'
  private businessAddress = '309 Kingstanding Rd, Birmingham B44 9TH'
  private businessPhone = '07897813165'

  // Homepage SEO
  generateHomepageSEO(): Metadata {
    return {
      title: 'Sports Devil - Premium Cricket Equipment | Birmingham Cricket Store',
      description: 'Sports Devil Birmingham - Your premier cricket equipment specialists. Professional cricket bats, protective gear, and accessories. Visit us at 309 Kingstanding Rd, Birmingham B44 9TH or call 07897813165.',
      keywords: [
        'cricket equipment Birmingham',
        'cricket bats Birmingham',
        'cricket gear UK',
        'professional cricket equipment',
        'Sports Devil Birmingham',
        'cricket store Kingstanding',
        'English willow cricket bats',
        'cricket protective gear',
        'batting pads Birmingham',
        'cricket helmets UK',
      ],
      openGraph: {
        title: 'Sports Devil - Premium Cricket Equipment | Birmingham Cricket Store',
        description: 'Birmingham\'s premier cricket equipment specialists. Professional bats, protective gear, and accessories.',
        type: 'website',
        locale: 'en_GB',
        url: this.baseUrl,
        siteName: this.siteName,
        images: [
          {
            url: `${this.baseUrl}/images/sports-devil-cricket-store.jpg`,
            width: 1200,
            height: 630,
            alt: 'Sports Devil Cricket Equipment Store - Birmingham',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Sports Devil - Premium Cricket Equipment',
        description: 'Birmingham\'s premier cricket equipment specialists',
        images: [`${this.baseUrl}/images/sports-devil-twitter-card.jpg`],
      },
      alternates: {
        canonical: this.baseUrl,
      },
    }
  }

  // Product page SEO
  generateProductSEO(product: ProductSEO): Metadata {
    const productTitle = `${product.name} | ${product.category} | Sports Devil Cricket`
    const productDescription = `Buy ${product.name} at Sports Devil Birmingham. ${product.description} ${product.inStock ? 'In stock' : 'Available to order'}. Price: £${product.price}. Call 07897813165 or visit our Birmingham store.`

    return {
      title: productTitle,
      description: productDescription,
      keywords: [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        'cricket equipment Birmingham',
        product.brand?.toLowerCase(),
        'sports devil',
        'cricket gear UK',
        product.sku,
      ].filter(Boolean) as string[],
      openGraph: {
        title: productTitle,
        description: productDescription,
        type: 'website',
        locale: 'en_GB',
        url: `${this.baseUrl}/products/${product.id}`,
        siteName: this.siteName,
        images: product.images.map(image => ({
          url: image,
          width: 800,
          height: 600,
          alt: `${product.name} - ${product.category}`,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title: productTitle,
        description: productDescription,
        images: [product.images[0]],
      },
    }
  }

  // Category page SEO
  generateCategorySEO(category: CategorySEO): Metadata {
    const categoryTitle = `${category.name} | Cricket Equipment | Sports Devil Birmingham`
    const categoryDescription = `Shop ${category.name.toLowerCase()} at Sports Devil Birmingham. ${category.description} ${category.productCount} products available. Premium cricket equipment at 309 Kingstanding Rd, Birmingham B44 9TH.`

    return {
      title: categoryTitle,
      description: categoryDescription,
      keywords: [
        category.name.toLowerCase(),
        'cricket equipment Birmingham',
        'sports devil',
        'cricket gear',
        'professional cricket equipment',
        'Birmingham cricket store',
      ],
      openGraph: {
        title: categoryTitle,
        description: categoryDescription,
        type: 'website',
        locale: 'en_GB',
        url: `${this.baseUrl}/categories/${category.slug}`,
        siteName: this.siteName,
        images: category.image ? [
          {
            url: category.image,
            width: 1200,
            height: 630,
            alt: `${category.name} - Sports Devil Cricket Equipment`,
          },
        ] : undefined,
      },
    }
  }

  // Generate structured data for products
  generateProductStructuredData(product: ProductSEO) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Sports Devil',
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'GBP',
        availability: product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: this.businessName,
          url: this.baseUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: '309 Kingstanding Rd',
            addressLocality: 'Birmingham',
            postalCode: 'B44 9TH',
            addressCountry: 'GB',
          },
          telephone: this.businessPhone,
        },
      },
      ...(product.rating && product.reviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
      }),
    }
  }

  // Generate breadcrumb structured data
  generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.baseUrl}${item.url}`,
      })),
    }
  }

  // Generate organization structured data
  generateOrganizationStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsGoodsStore',
      name: this.businessName,
      description: 'Premium cricket equipment specialists in Birmingham',
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/sports-devil-logo.png`,
      image: `${this.baseUrl}/images/sports-devil-store.jpg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '309 Kingstanding Rd',
        addressLocality: 'Birmingham',
        postalCode: 'B44 9TH',
        addressCountry: 'GB',
      },
      telephone: `+44${this.businessPhone.replace(/^0/, '')}`,
      email: 'info@sportsdevil.co.uk',
      openingHours: [
        'Mo-Sa 09:00-18:00',
        'Su 10:00-16:00',
      ],
      priceRange: '£5-£500',
      paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Online Payment'],
      currenciesAccepted: 'GBP',
      areaServed: {
        '@type': 'City',
        name: 'Birmingham',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Cricket Equipment Catalog',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Cricket Bats',
              category: 'Sports Equipment',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Protective Gear',
              category: 'Sports Equipment',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Product',
              name: 'Cricket Accessories',
              category: 'Sports Equipment',
            },
          },
        ],
      },
      sameAs: [
        'https://www.facebook.com/sportsdevil1',
        'https://www.instagram.com/sportsdevil1',
        'https://www.tiktok.com/@sportsdevil1',
      ],
    }
  }

  // Generate FAQ structured data for cricket equipment
  generateCricketEquipmentFAQ() {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What cricket equipment do you sell at Sports Devil Birmingham?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sports Devil specializes in premium cricket equipment including professional cricket bats, batting pads, gloves, helmets, cricket balls, and accessories. We stock leading brands and cater to all skill levels from junior to professional.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where is Sports Devil cricket store located?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sports Devil is located at 309 Kingstanding Rd, Birmingham B44 9TH. We are open Monday-Saturday 9am-6pm and Sunday 10am-4pm. You can also call us on 07897813165.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer cricket bat repairs and maintenance?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Sports Devil offers professional cricket bat repairs, re-gripping, and maintenance services. We can restore your cricket bat to optimal playing condition.',
          },
        },
        {
          '@type': 'Question',
          name: 'What payment methods do you accept?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We accept cash, all major credit and debit cards, and secure online payments through our website. We also offer flexible payment options for larger purchases.',
          },
        },
      ],
    }
  }
}

/**
 * Core Web Vitals optimization utilities
 */
export class WebVitalsOptimizer {
  private static thresholds = {
    LCP: 2500, // Largest Contentful Paint - Good: ≤2.5s
    FID: 100,  // First Input Delay - Good: ≤100ms
    CLS: 0.1,  // Cumulative Layout Shift - Good: ≤0.1
  }

  // Optimize images for better LCP
  static getOptimizedImageProps(
    src: string, 
    alt: string, 
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  ) {
    return {
      src,
      alt,
      priority,
      sizes,
      quality: 85,
      style: { width: '100%', height: 'auto' },
      placeholder: 'blur' as const,
      blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    }
  }

  // Preload critical resources for cricket pages
  static preloadCriticalResources() {
    if (typeof window === 'undefined') return

    const criticalResources = [
      // Critical CSS (loaded via CSS-in-JS)
      { href: '/fonts/GeistVF.woff2', as: 'font', type: 'font/woff2' },
      { href: '/fonts/GeistMonoVF.woff2', as: 'font', type: 'font/woff2' },
      // Critical images
      { href: '/images/sports-devil-logo.webp', as: 'image', type: 'image/webp' },
      { href: '/images/cricket-hero-background.webp', as: 'image', type: 'image/webp' },
    ]

    criticalResources.forEach(({ href, as, type }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      if (type) link.type = type
      if (as === 'font') link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }

  // Optimize for CLS by reserving space for dynamic content
  static reserveSpace(width: number, height: number) {
    return {
      width,
      height,
      display: 'block',
      aspectRatio: `${width} / ${height}`,
    }
  }

  // Optimize FID by deferring non-critical JavaScript
  static deferNonCriticalJS() {
    if (typeof window === 'undefined') return

    // Defer analytics and marketing scripts
    const deferredScripts = [
      'https://www.googletagmanager.com/gtag/js',
      'https://connect.facebook.net/en_US/fbevents.js',
    ]

    deferredScripts.forEach(src => {
      const script = document.createElement('script')
      script.src = src
      script.defer = true
      document.body.appendChild(script)
    })
  }
}

/**
 * Cricket equipment specific SEO utilities
 */
export class CricketSEOUtils {
  private static cricketTerms = {
    bats: ['cricket bats', 'willow bats', 'English willow', 'Kashmir willow', 'professional bats'],
    pads: ['batting pads', 'leg pads', 'cricket protection', 'thigh pads'],
    gloves: ['batting gloves', 'wicket keeping gloves', 'cricket gloves', 'leather gloves'],
    helmets: ['cricket helmets', 'batting helmets', 'protective helmets', 'grilles'],
    balls: ['cricket balls', 'leather balls', 'practice balls', 'white balls', 'red balls'],
    accessories: ['cricket accessories', 'cricket bags', 'stumps', 'bails', 'sight screens'],
  }

  // Generate cricket-specific keywords
  static generateCricketKeywords(category: string, productName: string): string[] {
    const baseKeywords = [
      productName.toLowerCase(),
      `${productName.toLowerCase()} Birmingham`,
      `buy ${productName.toLowerCase()}`,
      `${productName.toLowerCase()} UK`,
      'sports devil',
      'cricket equipment Birmingham',
    ]

    const categoryTerms = this.cricketTerms[category as keyof typeof this.cricketTerms] || []
    const categoryKeywords = categoryTerms.flatMap(term => [
      term,
      `${term} Birmingham`,
      `buy ${term}`,
      `professional ${term}`,
    ])

    return [...baseKeywords, ...categoryKeywords]
  }

  // Generate local SEO keywords for Birmingham
  static generateLocalKeywords(productType: string): string[] {
    const birminghamAreas = [
      'Birmingham',
      'Kingstanding',
      'Perry Barr',
      'Great Barr',
      'Handsworth',
      'Erdington',
      'Sutton Coldfield',
    ]

    return birminghamAreas.flatMap(area => [
      `${productType} ${area}`,
      `cricket equipment ${area}`,
      `cricket store ${area}`,
    ])
  }

  // Generate seasonal keywords for cricket
  static generateSeasonalKeywords(): string[] {
    return [
      'cricket season 2025',
      'cricket equipment spring',
      'pre-season cricket gear',
      'cricket season preparation',
      'summer cricket equipment',
      'winter cricket training',
      'indoor cricket gear',
      'cricket season essentials',
    ]
  }
}

// Export instances
export const seoManager = new SEOManager()
export const webVitalsOptimizer = WebVitalsOptimizer
export const cricketSEOUtils = CricketSEOUtils

export default {
  SEOManager,
  WebVitalsOptimizer,
  CricketSEOUtils,
  seoManager,
  webVitalsOptimizer,
  cricketSEOUtils,
}