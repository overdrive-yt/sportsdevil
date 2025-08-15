'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '../../../hooks/use-auth-store'
import { WishlistHeart } from '../../../components/wishlist-heart'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import { Heart, ShoppingCart, Trash2, Package, Star } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { formatPriceSimple } from '../../../lib/utils'
import { WishlistWithItems, WishlistItemWithProduct } from '../../../lib/services/wishlist.service'

export function WishlistContent() {
  const { user, isAuthenticated } = useCurrentUser()
  const [wishlist, setWishlist] = useState<WishlistWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWishlist() {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/wishlist')
        const data = await response.json()

        if (data.success) {
          setWishlist(data.wishlist)
        } else {
          setError(data.error || 'Failed to load wishlist')
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        setError('Failed to load wishlist')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [isAuthenticated])

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        // Update local state
        setWishlist(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.product.id !== productId),
          itemCount: prev.itemCount - 1
        } : null)
        toast.success('Item removed from wishlist')
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      toast.error('Failed to remove item from wishlist')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create an account to save your favorite products and access them from anywhere.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Unable to load wishlist</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!wishlist || wishlist.itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Save products you're interested in by clicking the heart icon on any product page.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-2">
              {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {wishlist.itemCount} items
          </Badge>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.items.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            onRemove={() => handleRemoveItem(item.product.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-12 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/products">
              <Package className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Cart
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function WishlistItemCard({ 
  item, 
  onRemove 
}: { 
  item: WishlistItemWithProduct
  onRemove: () => void
}) {
  const [isRemoving, setIsRemoving] = useState(false)
  
  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove()
    } finally {
      setIsRemoving(false)
    }
  }

  const isOnSale = item.product.originalPrice && item.product.originalPrice > item.product.price
  const discount = isOnSale && item.product.originalPrice
    ? Math.round((1 - item.product.price / item.product.originalPrice) * 100)
    : 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 relative">
      {/* Quick Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleRemove}
        disabled={isRemoving}
        title="Remove from wishlist"
      >
        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
      </Button>

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square">
          <Link href={`/products/${item.product.slug}`}>
            {item.product.images.length > 0 ? (
              <Image
                src={item.product.images[0].url}
                alt={item.product.images[0].alt || item.product.name}
                fill
                className="object-cover rounded-t-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-t-lg flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </Link>
          
          {/* Sale Badge */}
          {isOnSale && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
              {discount}% OFF
            </Badge>
          )}
          
          {/* Stock Status */}
          {item.product.stockQuantity === 0 && (
            <Badge variant="destructive" className="absolute bottom-3 left-3">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <Link href={`/products/${item.product.slug}`}>
            <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
              {item.product.name}
            </h3>
          </Link>

          {/* Category */}
          {item.product.productCategories.length > 0 && (
            <p className="text-sm text-muted-foreground mb-3">
              {item.product.productCategories[0].category.name}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-foreground">
              {formatPriceSimple(item.product.price)}
            </span>
            {isOnSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPriceSimple(item.product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-muted-foreground mb-4 italic">
              {item.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              disabled={item.product.stockQuantity === 0}
              asChild
            >
              <Link href={`/products/${item.product.slug}`}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Link>
            </Button>
            
            <WishlistHeart
              productId={item.product.id}
              size="sm"
              variant="outline"
            />
          </div>

          {/* Added Date */}
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Added {new Date(item.addedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}