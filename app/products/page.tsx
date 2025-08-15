import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { ProductsClient } from '../../components/products-client'
import { Skeleton } from '../../components/ui/skeleton'
import { BreadcrumbStructuredData } from '../../components/seo/structured-data'

// Environment-aware base URL helper
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3001'
  }
  return 'https://www.sportsdevil.co.uk'
}

const baseUrl = getBaseUrl()

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category as string | undefined
  const search = params.search as string | undefined
  
  // Category-specific metadata
  const categoryMetadata: Record<string, { title: string; description: string; keywords: string[] }> = {
    'Bats': {
      title: 'Premium Cricket Bats | Professional English Willow Bats',
      description: 'Discover our extensive collection of professional cricket bats including English willow, Kashmir willow, and junior bats from top brands like Gray Nicolls, New Balance, and CEAT.',
      keywords: ['cricket bats', 'english willow bats', 'kashmir willow', 'gray nicolls bats', 'new balance cricket bats', 'ceat cricket bats', 'professional cricket bats', 'junior cricket bats']
    },
    'Gloves': {
      title: 'Cricket Batting Gloves & Wicket Keeping Gloves | Sports Devil',
      description: 'Professional cricket gloves for batting and wicket keeping. Premium quality gloves from leading brands for maximum protection and comfort.',
      keywords: ['cricket gloves', 'batting gloves', 'wicket keeping gloves', 'cricket protective gear', 'professional cricket gloves']
    },
    'Protection': {
      title: 'Cricket Helmets & Protective Gear | Sports Devil Birmingham',
      description: 'Essential cricket protection including helmets, pads, thigh guards, and chest guards. Professional safety equipment for all cricket players.',
      keywords: ['cricket helmets', 'cricket pads', 'protective gear', 'thigh guards', 'cricket safety equipment', 'chest guards']
    },
    'Balls': {
      title: 'Cricket Balls | Match & Practice Cricket Balls',
      description: 'Professional cricket balls for matches and practice. Premium leather cricket balls suitable for all levels of play.',
      keywords: ['cricket balls', 'match cricket balls', 'practice balls', 'leather cricket balls', 'professional cricket balls']
    },
    'Accessories': {
      title: 'Cricket Accessories & Equipment | Sports Devil',
      description: 'Complete range of cricket accessories including kit bags, stumps, grip cones, and training equipment.',
      keywords: ['cricket accessories', 'kit bags', 'cricket stumps', 'training equipment', 'cricket gear']
    }
  }

  // Generate metadata based on category or search
  if (category && categoryMetadata[category]) {
    const meta = categoryMetadata[category]
    return {
      title: `${meta.title} | Sports Devil`,
      description: meta.description,
      keywords: meta.keywords.join(', '),
      openGraph: {
        title: `${meta.title} | Sports Devil`,
        description: meta.description,
        type: 'website',
        url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
        siteName: 'Sports Devil',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${meta.title} | Sports Devil`,
        description: meta.description,
      },
      alternates: {
        canonical: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
      },
    }
  }

  if (search) {
    return {
      title: `Search: ${search} | Cricket Equipment | Sports Devil`,
      description: `Search results for "${search}" in our cricket equipment collection. Find professional cricket gear and accessories.`,
      keywords: [search, 'cricket equipment', 'sports devil', 'cricket gear search'].join(', '),
      openGraph: {
        title: `Search: ${search} | Sports Devil`,
        description: `Search results for "${search}" in our cricket equipment collection.`,
        type: 'website',
        url: `${baseUrl}/products?search=${encodeURIComponent(search)}`,
      },
      robots: {
        index: false, // Don't index search result pages
        follow: true,
      },
    }
  }

  // Default metadata for general products page
  return {
    title: 'Premium Cricket Equipment & Gear | Sports Devil',
    description: 'Browse our complete collection of premium cricket equipment including bats, gloves, pads, helmets and more. Professional quality gear for all skill levels.',
    keywords: [
      'cricket equipment',
      'cricket bats',
      'cricket gloves',
      'cricket pads',
      'cricket helmets',
      'sports gear',
      'cricket accessories',
      'professional cricket equipment',
      'sports devil'
    ].join(', '),
    openGraph: {
      title: 'Premium Cricket Equipment & Gear | Sports Devil',
      description: 'Browse our complete collection of premium cricket equipment including bats, gloves, pads, helmets and more.',
      type: 'website',
      url: `${baseUrl}/products`,
      siteName: 'Sports Devil',
      images: [
        {
          url: `${baseUrl}/images/products-banner.jpg`,
          width: 1200,
          height: 630,
          alt: 'Premium Cricket Equipment Collection',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Premium Cricket Equipment & Gear | Sports Devil',
      description: 'Browse our complete collection of premium cricket equipment.',
    },
    alternates: {
      canonical: `${baseUrl}/products`,
    },
  }
}

function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-10 w-80 mb-6" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Suspense fallback={<ProductsLoading />}>
          <ProductsClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}