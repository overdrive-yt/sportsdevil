'use client'

import Script from 'next/script'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  stockQuantity: number
  sku?: string
  images?: Array<{ url: string; alt?: string }>
  category?: { name: string }
  brand?: string
}

interface ProductStructuredDataProps {
  product: Product
}

interface ProductListStructuredDataProps {
  products: Product[]
  category?: string
  totalProducts?: number
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[]
}

/**
 * Product structured data for individual product pages
 */
export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url) || [],
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Sports Devil'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'GBP',
      availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      seller: {
        '@type': 'Organization',
        name: 'Sports Devil',
        url: 'https://sportsdevil.co.uk'
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'GB',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail'
      }
    },
    category: product.category?.name,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Sport',
        value: 'Cricket'
      }
    ]
  }

  // Add aggregated rating if we had reviews data
  // aggregateRating: {
  //   '@type': 'AggregateRating',
  //   ratingValue: averageRating,
  //   reviewCount: reviewCount
  // }

  return (
    <Script
      id="product-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/**
 * Product list structured data for category and search pages
 */
export function ProductListStructuredData({ products, category, totalProducts }: ProductListStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category ? `${category} - Cricket Equipment` : 'Cricket Equipment Collection',
    description: category 
      ? `Professional ${category.toLowerCase()} for cricket players of all levels`
      : 'Complete collection of professional cricket equipment and accessories',
    numberOfItems: totalProducts || products.length,
    itemListElement: products.slice(0, 20).map((product, index) => ({ // Limit to first 20 for performance
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.[0]?.url,
        url: `https://sportsdevil.co.uk/products/${product.id}`, // Assuming slug is same as ID
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'GBP',
          availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }
    }))
  }

  return (
    <Script
      id="product-list-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/**
 * Breadcrumb structured data for navigation
 */
export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/**
 * FAQ structured data for product pages
 */
interface FAQItem {
  question: string
  answer: string
}

interface FAQStructuredDataProps {
  faqs: FAQItem[]
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/**
 * Organization structured data (for contact/about pages)
 */
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://sportsdevil.co.uk/#organization',
    name: 'Sports Devil',
    alternateName: 'Sports Devil Cricket Equipment',
    description: 'Premium cricket equipment specialists in Birmingham, UK. Professional cricket bats, protective gear, and accessories.',
    url: 'https://sportsdevil.co.uk',
    logo: 'https://sportsdevil.co.uk/images/sports-devil-logo.png',
    image: 'https://sportsdevil.co.uk/images/sports-devil-store.jpg',
    telephone: '+447897813165',
    email: 'info@sportsdevil.co.uk',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '309 Kingstanding Rd',
      addressLocality: 'Birmingham',
      postalCode: 'B44 9TH',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.5357,
      longitude: -1.9103
    },
    openingHours: [
      'Mo-Sa 09:00-18:00',
      'Su 10:00-16:00'
    ],
    priceRange: '£5-£500',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Online Payment', 'Bank Transfer'],
    currenciesAccepted: 'GBP',
    areaServed: ['Birmingham', 'West Midlands', 'United Kingdom'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Cricket Equipment',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Cricket Bats',
            category: 'Cricket Equipment'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Cricket Protective Gear',
            category: 'Sports Safety Equipment'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Cricket Accessories',
            category: 'Sports Equipment'
          }
        }
      ]
    },
    sameAs: [
      'https://www.facebook.com/sportsdevil1',
      'https://www.instagram.com/sportsdevil1',
      'https://www.tiktok.com/@sportsdevil1'
    ]
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

/**
 * Website structured data for homepage
 */
export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://sportsdevil.co.uk/#website',
    name: 'Sports Devil',
    alternateName: 'Sports Devil Cricket Equipment',
    url: 'https://sportsdevil.co.uk',
    description: 'Premium cricket equipment specialists in Birmingham, UK',
    publisher: {
      '@id': 'https://sportsdevil.co.uk/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://sportsdevil.co.uk/products?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}