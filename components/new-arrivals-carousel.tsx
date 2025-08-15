"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react"
import { useAddToCart } from "../hooks/use-cart"
import { formatPrice, hasDiscount, calculateDiscountPercentage } from "../lib/utils/price-formatting"

interface NewArrivalProduct {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  primaryImage: {
    url: string
    alt: string | null
  } | null
  category: {
    name: string
    slug: string
  } | null
  newStatus: {
    isNew: boolean
    isRecentlyCreated: boolean
    daysSinceCreated: number
    shouldAutoExpire: boolean
    createdAt: string
    isManuallyMarked: boolean
  }
}

interface NewArrivalsResponse {
  success: boolean
  data: NewArrivalProduct[]
  meta: {
    total: number
    period: string
    autoExpiredCount: number
    breakdown: {
      recentlyCreated: number
      manuallyMarked: number
    }
  }
}

export function NewArrivalsCarousel() {
  const [products, setProducts] = useState<NewArrivalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<NewArrivalsResponse['meta'] | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const addToCartMutation = useAddToCart()

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        console.log('🔄 Fetching new arrivals...')
        const response = await fetch('/api/analytics/new-arrivals?limit=8')
        const data: NewArrivalsResponse = await response.json()
        
        if (data.success) {
          setProducts(data.data)
          setMeta(data.meta)
          console.log('✅ New arrivals loaded:', data.data.length, 'products')
        } else {
          throw new Error(data.error || 'Failed to fetch new arrivals')
        }
      } catch (err) {
        console.error('❌ Error fetching new arrivals:', err)
        setError(err instanceof Error ? err.message : 'Failed to load new arrivals')
      } finally {
        setLoading(false)
      }
    }

    fetchNewArrivals()
  }, [])

  const handleAddToCart = (product: NewArrivalProduct) => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.primaryImage?.url || '/placeholder.svg',
      }
    })
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320
      const newScrollLeft =
        direction === "left" ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            </div>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[300px] bg-white rounded-lg shadow-lg border p-0 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-lg mb-4"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">New Arrivals</h2>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600">No new arrivals available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">New Arrivals</h2>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="hover:bg-blue-50 hover:border-blue-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="hover:bg-blue-50 hover:border-blue-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
          >
            {products.map((product) => {
              const discount = calculateDiscountPercentage(product.originalPrice, product.price)
              
              return (
                <Card
                  key={product.id}
                  className="group min-w-[300px] hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 shadow-lg bg-white"
                >
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.primaryImage?.url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.newStatus.isNew && (
                          <Badge className="bg-green-500 text-white">NEW</Badge>
                        )}
                        {discount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {Math.round(discount)}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating - placeholder for now */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          4.7 (0)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                        {hasDiscount(product.originalPrice, product.price) && (
                          <span className="text-lg text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 group-hover:scale-105 transition-transform duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}