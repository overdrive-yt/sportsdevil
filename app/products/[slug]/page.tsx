import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductClient } from '@/components/product-client'
import { ProductStructuredData } from '@/components/seo/structured-data'
import { ProductBreadcrumb } from '@/components/seo/breadcrumb'
import { apiClient } from '@/lib/api-client'

// Environment-aware base URL helper
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001'
  }
  return 'https://sportsdevil.co.uk'
}

const baseUrl = getBaseUrl()

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const productData = await apiClient.getProduct(slug)
    const product = productData.data

    if (!product) {
      return {
        title: 'Product Not Found | Sports Devil',
        description: 'The product you are looking for could not be found.',
      }
    }

    const price = parseFloat(String((product as any).price || 0))
    const formattedPrice = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price)

    return {
      title: `${(product as any).name} - ${formattedPrice} | Sports Devil`,
      description: (product as any).shortDescription || (product as any).description,
      keywords: [
        (product as any).name,
        (product as any).category?.name,
        'sports equipment',
        'sports gear',
        'sports devil',
        ...((product as any).tags || [])
      ].join(', '),
      openGraph: {
        title: `${(product as any).name} | Sports Devil`,
        description: (product as any).shortDescription || (product as any).description,
        images: (product as any).images?.map((img: any) => ({
          url: img.url,
          alt: img.alt || (product as any).name,
        })) || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${(product as any).name} | Sports Devil`,
        description: (product as any).shortDescription || (product as any).description,
        images: (product as any).images?.[0]?.url ? [(product as any).images[0].url] : undefined,
      },
      alternates: {
        canonical: `${baseUrl}/products/${slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Product Not Found | Sports Devil',
      description: 'The product you are looking for could not be found.',
    }
  }
}

async function getProduct(slug: string) {
  try {
    const productData = await apiClient.getProduct(slug)
    return productData.data
  } catch (error) {
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const productData = {
    id: (product as any).id || (product as any).slug,
    name: (product as any).name,
    description: (product as any).description,
    price: parseFloat((product as any).price || 0),
    originalPrice: (product as any).originalPrice ? parseFloat((product as any).originalPrice) : undefined,
    stockQuantity: (product as any).stockQuantity || 0,
    sku: (product as any).sku,
    images: (product as any).images || [],
    category: (product as any).category
  }

  const categoryName = productData.category?.name
  const categorySlug = productData.category?.slug

  return (
    <>
      <ProductStructuredData product={productData} />
      
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProductBreadcrumb
            productName={productData.name}
            categoryName={categoryName}
            categorySlug={categorySlug}
          />
          <ProductClient product={product} />
        </main>
        <Footer />
      </div>
    </>
  )
}