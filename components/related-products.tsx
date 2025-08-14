'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/product-card'
import { useRelatedProducts } from '@/hooks/use-recommendations'
import { formatPriceSimple } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RelatedProductsProps {
  productId: string
  limit?: number
  title?: string
  showViewAll?: boolean
  categorySlug?: string
}

export function RelatedProducts({ 
  productId, 
  limit = 5, 
  title = "You might also like",
  showViewAll = true,
  categorySlug
}: RelatedProductsProps) {
  const { data: recommendationsData, isLoading, error } = useRelatedProducts(productId, limit)

  if (error) {
    return null // Silently fail for recommendations
  }

  const products = (recommendationsData as any)?.data || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {showViewAll && (
              <Skeleton className="h-4 w-16" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {showViewAll && categorySlug && (
            <Link 
              href={`/categories/${categorySlug}`}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {products.map((product: any) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for sidebars
export function RelatedProductsCompact({ productId, limit = 3 }: RelatedProductsProps) {
  const { data: recommendationsData, isLoading } = useRelatedProducts(productId, limit)

  const products = (recommendationsData as any)?.data || []

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Related Products</h3>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="w-16 h-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Related Products</h3>
      <div className="space-y-3">
        {products.map((product: any) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-16 h-16 bg-muted rounded overflow-hidden relative flex-shrink-0">
              {product.images?.[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatPriceSimple(product.price)}
              </p>
              {product.category && (
                <p className="text-xs text-muted-foreground">
                  {product.category.name}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}