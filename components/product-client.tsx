'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useAddToCart } from '../hooks/use-cart'
import { useRecentlyViewedStore } from '../stores/recently-viewed-store'
import { analytics } from '../lib/analytics'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Minus,
  Plus,
  ZoomIn
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog'
import { RecentlyViewed } from './recently-viewed'
import { ReviewList } from './review-list'
import { ReviewForm } from './review-form'
import { RelatedProducts } from './related-products'
import { ProductImage } from './product-image'

interface ProductClientProps {
  product: any
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const addToCartMutation = useAddToCart()
  const { addProduct } = useRecentlyViewedStore()

  // Track this product as recently viewed and for analytics
  useEffect(() => {
    if (product) {
      // Add to recently viewed
      addProduct({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        category: product.category,
      })

      // Track product view for analytics
      analytics.trackProductView({
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Unknown',
        price: parseFloat(product.price),
        sku: product.sku,
      })
    }
  }, [product, addProduct])

  const handleAddToCart = () => {
    if (!product) return

    // Track add to cart for analytics
    analytics.trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.category?.name || 'Unknown',
      price: parseFloat(product.price),
      quantity,
    })

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      selectedColor,
      selectedSize,
      product,
    })
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(price))
  }

  const isOnSale = product?.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price)
  const isOutOfStock = product?.stockQuantity <= 0

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border group cursor-pointer">
            <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
              <DialogTrigger asChild>
                <div className="relative w-full h-full">
                  <ProductImage
                    src={product.images?.[selectedImageIndex]?.url || '/placeholder.svg?height=600&width=600'}
                    alt={product.images?.[selectedImageIndex]?.alt || product.name}
                    width={600}
                    height={600}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <ProductImage
                    src={product.images?.[selectedImageIndex]?.url || '/placeholder.svg?height=800&width=800'}
                    alt={product.images?.[selectedImageIndex]?.alt || product.name}
                    width={800}
                    height={800}
                    fill
                    className="object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>

            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-green-500">
                New
              </Badge>
            )}
            {isOnSale && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Sale
              </Badge>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 aspect-square w-20 border rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 ${
                    selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <ProductImage
                    src={image.url}
                    alt={image.alt}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">{product.shortDescription}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {isOnSale && product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            inc. VAT • Free shipping on orders over £100
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : product.stockQuantity <= 3 ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Only {product.stockQuantity} left in stock
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ✓ In Stock
              </Badge>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Color:</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((color: string) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Size:</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size: string) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity:</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 border rounded text-center min-w-[60px]">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={quantity >= product.stockQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCartMutation.isPending}
              className="flex-1"
              size="lg"
            >
              {addToCartMutation.isPending ? (
                'Adding...'
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Free shipping over £100</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>2 year warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span>30 day returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-sm">SKU:</span>
                      <span className="ml-2 text-sm">{product.sku}</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-sm">Category:</span>
                      <span className="ml-2 text-sm">{product.category?.name}</span>
                    </div>
                    {product.colors && product.colors.length > 0 && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <span className="font-medium text-sm">Available Colors:</span>
                        <span className="ml-2 text-sm">{product.colors.join(', ')}</span>
                      </div>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <span className="font-medium text-sm">Available Sizes:</span>
                        <span className="ml-2 text-sm">{product.sizes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {showReviewForm && (
                <ReviewForm
                  productId={product.id}
                  productName={product.name}
                  onSuccess={() => setShowReviewForm(false)}
                />
              )}
              
              <ReviewList
                productId={product.id}
                showWriteReview={!showReviewForm}
                onWriteReviewClick={() => setShowReviewForm(true)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <RelatedProducts
          productId={product.id}
          limit={5}
          title="You might also like"
          categorySlug={product.category?.slug}
        />
      </div>

      {/* Recently Viewed Products */}
      <div className="mt-8">
        <RecentlyViewed 
          currentProductId={product.id} 
          limit={5}
          showTitle={true}
        />
      </div>
    </>
  )
}