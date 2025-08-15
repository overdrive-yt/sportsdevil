import { MetadataRoute } from 'next'
import { prisma } from '../lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sportsdevil.co.uk'

  // Static pages with cricket equipment focus
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // Cricket equipment specific pages
    {
      url: `${baseUrl}/cricket-bats`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/batting-equipment`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/protective-gear`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cricket-accessories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  try {
    // Dynamic product pages from database
    const productPages: MetadataRoute.Sitemap = []
    const categoryPages: MetadataRoute.Sitemap = []

    try {
      // Fetch active products for sitemap
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
          productCategories: {
            select: { 
              category: {
                select: { name: true }
              }
            }
          }
        },
        take: 1000, // Limit for sitemap performance
      })

      products.forEach(product => {
        productPages.push({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })
      })

      // Fetch categories for sitemap
      const categories = await prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true,
        }
      })

      categories.forEach(category => {
        categoryPages.push({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      })

    } catch (dbError) {
      console.warn('Database not available for sitemap generation, using static pages only')
      
      // Fallback cricket equipment pages if database is unavailable
      const fallbackPages: MetadataRoute.Sitemap = [
        {
          url: `${baseUrl}/products/professional-cricket-bat`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/products/batting-gloves-premium`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/products/cricket-helmet-safety`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/products/batting-pads-professional`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/categories/cricket-bats`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/categories/batting-gloves`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/categories/helmets`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/categories/batting-pads`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ]
      
      return [...staticPages, ...fallbackPages]
    }

    return [...staticPages, ...productPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}