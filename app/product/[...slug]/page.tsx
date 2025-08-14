"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight, Filter, Grid, List, SortAsc, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  originalPrice?: number
  sku: string
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  images: {
    id: string
    url: string
    alt?: string
    isPrimary: boolean
  }[]
  productCategories: {
    category: {
      id: string
      name: string
      slug: string
      fullPath?: string
    }
    isPrimary: boolean
  }[]
}

interface ProductPageData {
  type: 'single' | 'category' | 'listing'
  product?: Product
  products?: Product[]
  category?: {
    id: string
    name: string
    slug: string
    description?: string
    fullPath?: string
    children?: any[]
  }
  breadcrumbs: {
    name: string
    href: string
  }[]
  meta: {
    total: number
    page: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function DynamicProductPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ProductPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slug = Array.isArray(params.slug) ? params.slug : [params.slug]
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const sort = searchParams.get('sort') || 'name'
  const filter = searchParams.get('filter') || ''
  const view = searchParams.get('view') || 'grid'

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Build query string
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort,
          ...(filter && { filter })
        })

        // Make API call to unified product endpoint
        const response = await fetch(`/api/products/dynamic/${slug.join('/')}?${queryParams}`)
        const result = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error(result.error || 'Failed to load product data')
        }

        setData(result)
      } catch (err) {
        console.error('Dynamic product page error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, page, limit, sort, filter])

  if (loading) {
    return <ProductPageSkeleton />
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested page could not be found.'}</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            {data.breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {index === data.breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="text-blue-600 hover:text-blue-800">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Single Product View */}
        {data.type === 'single' && data.product && (
          <SingleProductView product={data.product} />
        )}

        {/* Category/Listing View */}
        {(data.type === 'category' || data.type === 'listing') && (
          <ProductListingView 
            products={data.products || []}
            category={data.category}
            meta={data.meta}
            currentSort={sort}
            currentView={view}
          />
        )}
      </div>
    </div>
  )
}

function SingleProductView({ product }: { product: Product }) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={primaryImage?.url || '/images/placeholder-product.jpg'}
              alt={primaryImage?.alt || product.name}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <div key={image.id} className="aspect-square relative rounded border overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.productCategories[0] && (
            <div>
              <Link 
                href={`/product/${product.productCategories[0].category.slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {product.productCategories[0].category.name}
              </Link>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">£{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xl text-gray-500 line-through">£{product.originalPrice!.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          {product.shortDescription && (
            <p className="text-gray-600">{product.shortDescription}</p>
          )}

          {/* Add to Cart */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full"
              disabled={product.stockQuantity === 0}
            >
              {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            <Button variant="outline" size="lg" className="w-full">
              Add to Wishlist
            </Button>
          </div>

          {/* Product Details */}
          <div className="pt-6 border-t space-y-2">
            <h3 className="font-semibold text-gray-900">Product Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">SKU:</span> {product.sku}</p>
              {product.productCategories[0] && (
                <p><span className="font-medium">Category:</span> {product.productCategories[0].category.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t bg-gray-50">
          <div className="py-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
            <div className="prose max-w-none text-gray-600">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductListingView({ 
  products, 
  category, 
  meta, 
  currentSort, 
  currentView 
}: { 
  products: Product[]
  category?: ProductPageData['category']
  meta: ProductPageData['meta']
  currentSort: string
  currentView: string
}) {
  return (
    <div className="space-y-6">
      {/* Category Header */}
      {category && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{meta.total} products</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <select className="text-sm border rounded px-3 py-1">
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid gap-4 ${
        currentView === 'grid' 
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view={currentView} />
        ))}
      </div>

      {/* Pagination */}
      {meta.total > meta.limit && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {meta.hasPrevPage && (
              <Button variant="outline" size="sm">
                Previous
              </Button>
            )}
            <span className="text-sm text-gray-600">
              Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
            </span>
            {meta.hasNextPage && (
              <Button variant="outline" size="sm">
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, view }: { product: Product; view: string }) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  if (view === 'list') {
    return (
      <Link href={`/product/${product.slug}`}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={primaryImage?.url || '/images/placeholder-product.jpg'}
                alt={primaryImage?.alt || product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.shortDescription}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold text-gray-900">£{product.price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">£{product.originalPrice!.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={primaryImage?.url || '/images/placeholder-product.jpg'}
            alt={primaryImage?.alt || product.name}
            fill
            className="object-cover"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">£{product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">£{product.originalPrice!.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full" />
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}