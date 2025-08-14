import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/checkout/',
          '/cart/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/checkout/',
          '/cart/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://sportsdevil.co.uk/sitemap.xml',
  }
}