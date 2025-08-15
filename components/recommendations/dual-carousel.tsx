"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { 
  ChevronLeft, 
  ChevronRight, 
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Zap,
  Brain,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react'
import {
  RecommendationEngine,
  type RecommendationContext,
  type RecommendationType,
  type RecommendationSet
} from '../../lib/ai/recommendations'

interface DualCarouselProps {
  primaryType: RecommendationType
  secondaryType: RecommendationType
  context: RecommendationContext
  itemsPerView?: number
  autoScroll?: boolean
  showRefresh?: boolean
  className?: string
}

interface CarouselState {
  currentIndex: number
  isLoading: boolean
  recommendations: RecommendationSet | null
}

export function DualCarousel({
  primaryType,
  secondaryType,
  context,
  itemsPerView = 4,
  autoScroll = false,
  showRefresh = false,
  className = ''
}: DualCarouselProps) {
  const [primaryCarousel, setPrimaryCarousel] = useState<CarouselState>({
    currentIndex: 0,
    isLoading: true,
    recommendations: null
  })

  const [secondaryCarousel, setSecondaryCarousel] = useState<CarouselState>({
    currentIndex: 0,
    isLoading: true,
    recommendations: null
  })

  // Load recommendations
  useEffect(() => {
    loadRecommendations()
  }, [primaryType, secondaryType, context])

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll) return

    const interval = setInterval(() => {
      if (primaryCarousel.recommendations?.products.length) {
        const maxIndex = Math.max(0, primaryCarousel.recommendations.products.length - itemsPerView)
        setPrimaryCarousel(prev => ({
          ...prev,
          currentIndex: prev.currentIndex >= maxIndex ? 0 : prev.currentIndex + 1
        }))
      }
    }, 5000) // Auto-scroll every 5 seconds

    return () => clearInterval(interval)
  }, [autoScroll, itemsPerView, primaryCarousel.recommendations])

  const loadRecommendations = async () => {
    try {
      setPrimaryCarousel(prev => ({ ...prev, isLoading: true }))
      setSecondaryCarousel(prev => ({ ...prev, isLoading: true }))

      const [primary, secondary] = await Promise.all([
        RecommendationEngine.getRecommendations(primaryType, context, 12),
        RecommendationEngine.getRecommendations(secondaryType, context, 12)
      ])

      setPrimaryCarousel(prev => ({
        ...prev,
        recommendations: primary,
        isLoading: false
      }))

      setSecondaryCarousel(prev => ({
        ...prev,
        recommendations: secondary,
        isLoading: false
      }))
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      setPrimaryCarousel(prev => ({ ...prev, isLoading: false }))
      setSecondaryCarousel(prev => ({ ...prev, isLoading: false }))
    }
  }

  const scroll = (carousel: 'primary' | 'secondary', direction: 'left' | 'right') => {
    const setState = carousel === 'primary' ? setPrimaryCarousel : setSecondaryCarousel
    const currentCarousel = carousel === 'primary' ? primaryCarousel : secondaryCarousel
    
    if (!currentCarousel.recommendations?.products.length) return

    const maxIndex = Math.max(0, currentCarousel.recommendations.products.length - itemsPerView)
    
    setState(prev => ({
      ...prev,
      currentIndex: direction === 'left' 
        ? Math.max(0, prev.currentIndex - 1)
        : Math.min(maxIndex, prev.currentIndex + 1)
    }))
  }

  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case 'recommended-items': return <Brain className="h-4 w-4" />
      case 'frequently-bought': return <Users className="h-4 w-4" />
      case 'similar-products': return <Eye className="h-4 w-4" />
      case 'trending': return <TrendingUp className="h-4 w-4" />
      case 'category-popular': return <Star className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number, originalPrice?: number) => {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-green-600">£{price.toFixed(2)}</span>
        {originalPrice && originalPrice > price && (
          <span className="text-xs text-gray-500 line-through">
            £{originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  const renderCarousel = (
    carousel: CarouselState,
    carouselType: 'primary' | 'secondary',
    type: RecommendationType
  ) => {
    if (carousel.isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square">
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (!carousel.recommendations?.products.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No recommendations available</p>
        </div>
      )
    }

    const visibleProducts = carousel.recommendations.products.slice(
      carousel.currentIndex,
      carousel.currentIndex + itemsPerView
    )

    const canScrollLeft = carousel.currentIndex > 0
    const canScrollRight = carousel.currentIndex < carousel.recommendations.products.length - itemsPerView

    return (
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full w-8 h-8 p-0 shadow-lg ${!canScrollLeft ? 'opacity-50' : ''}`}
            onClick={() => scroll(carouselType, 'left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full w-8 h-8 p-0 shadow-lg ${!canScrollRight ? 'opacity-50' : ''}`}
            onClick={() => scroll(carouselType, 'right')}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          {visibleProducts.map((product, index) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{product.name}</span>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isOnSale && (
                    <Badge className="bg-red-500 text-white text-xs">
                      Sale
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="secondary" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-1">
                    <Button variant="secondary" size="sm" className="w-8 h-8 p-0">
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button variant="secondary" size="sm" className="w-8 h-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  {formatPrice(product.price, product.originalPrice)}
                </div>

                {/* Recommendation Reason */}
                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                    {getRecommendationIcon(type)}
                    <span className="truncate">{product.reason}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!product.inStock}
                  variant={product.inStock ? "default" : "secondary"}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ 
            length: Math.ceil(carousel.recommendations.products.length / itemsPerView) 
          }).map((_, index) => {
            const isActive = Math.floor(carousel.currentIndex / itemsPerView) === index
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Primary Carousel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getRecommendationIcon(primaryType)}
              {primaryCarousel.recommendations?.title || 'Loading...'}
              {primaryCarousel.recommendations && (
                <Badge variant="outline" className="text-xs">
                  AI Powered
                </Badge>
              )}
            </CardTitle>
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRecommendations}
                disabled={primaryCarousel.isLoading || secondaryCarousel.isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${
                  (primaryCarousel.isLoading || secondaryCarousel.isLoading) ? 'animate-spin' : ''
                }`} />
              </Button>
            )}
          </div>
          {primaryCarousel.recommendations?.description && (
            <p className="text-sm text-gray-600">
              {primaryCarousel.recommendations.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {renderCarousel(primaryCarousel, 'primary', primaryType)}
        </CardContent>
      </Card>

      {/* Secondary Carousel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRecommendationIcon(secondaryType)}
            {secondaryCarousel.recommendations?.title || 'Loading...'}
            {secondaryCarousel.recommendations && (
              <Badge variant="secondary" className="text-xs">
                Confidence: {Math.round(secondaryCarousel.recommendations.confidence * 100)}%
              </Badge>
            )}
          </CardTitle>
          {secondaryCarousel.recommendations?.description && (
            <p className="text-sm text-gray-600">
              {secondaryCarousel.recommendations.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {renderCarousel(secondaryCarousel, 'secondary', secondaryType)}
        </CardContent>
      </Card>
    </div>
  )
}