'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Eye } from 'lucide-react'
import { useAddToCart } from '@/hooks/use-cart'
import { WishlistHeartCompact } from '@/components/wishlist-heart'

interface Product {
  id: string
  name: string
  slug: string
  price: string
  originalPrice?: string
  stockQuantity: number
  isFeatured: boolean
  isNew: boolean
  primaryImage?: {
    url: string
    alt: string
  }
  category?: {
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCartMutation = useAddToCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stockQuantity <= 0) return

    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1,
      product: product,
    })
  }

  const isOnSale = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price)
  const isOutOfStock = product.stockQuantity <= 0

  return (
    <Card className={`flex flex-col h-full group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <div className="aspect-square relative bg-gray-100">
            {product.primaryImage ? (
              <Image
                src={product.primaryImage.url}
                alt={product.primaryImage.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt={`${product.name} placeholder`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge variant="secondary" className="bg-green-500 text-white">
              New
            </Badge>
          )}
          {isOnSale && product.originalPrice && (
            <Badge variant="destructive">
              {Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)}% OFF
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Heart - Always visible */}
        <WishlistHeartCompact productId={product.id} />

        {/* Quick Actions */}
        <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" asChild>
              <Link href={`/products/${product.slug}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View product</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-4">
        {/* Top section - Category + Product Name */}
        <div className="space-y-2">
          {product.category && (
            <Link 
              href={`/categories/${product.category.slug}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {product.category.name}
            </Link>
          )}
          
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Bottom section - Price + Stock (anchored to bottom) */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatPrice(parseFloat(product.price))}
            </span>
            {isOnSale && product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(parseFloat(product.originalPrice))}
              </span>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            inc. VAT
          </p>

          {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
            <p className="text-xs text-orange-600">
              Only {product.stockQuantity} left in stock
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addToCartMutation.isPending}
          className="w-full"
          size="sm"
        >
          {addToCartMutation.isPending ? (
            'Adding...'
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
}