'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { X, ShoppingBag } from 'lucide-react'
import { useRecentlyViewedStore } from '../stores/recently-viewed-store'
import { formatPriceSimple } from '../lib/utils'

interface RecentlyViewedProps {
  currentProductId?: string
  limit?: number
  showTitle?: boolean
  className?: string
}

export function RecentlyViewed({ 
  currentProductId, 
  limit = 5, 
  showTitle = true,
  className = ''
}: RecentlyViewedProps) {
  const { items, removeProduct, clearAll, getRecentProducts } = useRecentlyViewedStore()
  
  // Filter out current product if specified
  const recentProducts = getRecentProducts(limit + 1)
    .filter(product => product.id !== currentProductId)
    .slice(0, limit)

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Recently Viewed</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 px-3 text-xs"
          >
            Clear All
          </Button>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="space-y-3">
          {recentProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-3 group">
              <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                <div className="w-12 h-12 bg-muted rounded-md overflow-hidden relative">
                  <Image
                    src={product.images?.[0]?.url || '/placeholder.svg?height=48&width=48'}
                    alt={product.images?.[0]?.alt || product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/products/${product.slug}`}
                  className="block"
                >
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-medium">
                    {formatPriceSimple(product.price)}
                  </p>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(product.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        {recentProducts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-3 w-3" />
                Browse All Products
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for sidebars
export function RecentlyViewedCompact({ currentProductId, limit = 3 }: RecentlyViewedProps) {
  const { getRecentProducts } = useRecentlyViewedStore()
  
  const recentProducts = getRecentProducts(limit + 1)
    .filter(product => product.id !== currentProductId)
    .slice(0, limit)

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Recently Viewed</h3>
      <div className="space-y-2">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-8 h-8 bg-muted rounded overflow-hidden relative flex-shrink-0">
              <Image
                src={product.images?.[0]?.url || '/placeholder.svg?height=32&width=32'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPriceSimple(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}