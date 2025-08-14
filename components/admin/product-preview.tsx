'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Info } from 'lucide-react'

interface ProductPreviewProps {
  product: any
}

// V9.11.3: Live Product Preview Component
export default function ProductPreview({ product }: ProductPreviewProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="aspect-square relative bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images.find((img: any) => img.isPrimary)?.url || product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Info className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">No image uploaded</p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-2">
          {product.isNew && (
            <Badge className="bg-blue-600">New</Badge>
          )}
          {hasDiscount && (
            <Badge className="bg-red-600">{discountPercentage}% OFF</Badge>
          )}
          {product.stockQuantity === 0 && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
        )}

        {/* Name */}
        <h3 className="font-semibold line-clamp-2">
          {product.name || 'Product Name'}
        </h3>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold">
            £{product.price ? product.price.toFixed(2) : '0.00'}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              £{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Key Attributes */}
        {product.categoryAttributes && Object.keys(product.categoryAttributes).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(product.categoryAttributes)
              .slice(0, 3)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {String(value)}
                </Badge>
              ))}
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center justify-between text-sm">
          <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : 'Out of stock'}
          </span>
          {product.sku && (
            <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full" 
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  )
}