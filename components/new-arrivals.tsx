"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react"
import { useAddToCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"

const newProducts = [
  {
    id: 1,
    name: "Elite Cricket Bat",
    price: 299.99,
    rating: 4.9,
    reviews: 45,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#8B4513", "#D2691E"],
    isNew: true,
    isSold: false,
  },
  {
    id: 2,
    name: "Professional Wicket Keeping Gloves",
    price: 79.99,
    rating: 4.8,
    reviews: 32,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#000000", "#ffffff"],
    isNew: true,
    isSold: true,
  },
  {
    id: 3,
    name: "Training Cones Set",
    price: 24.99,
    rating: 4.7,
    reviews: 78,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#FFA500", "#FF0000", "#00FF00"],
    isNew: true,
    isSold: false,
  },
  {
    id: 4,
    name: "Sports Water Bottle",
    price: 19.99,
    rating: 4.6,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#0066cc", "#000000", "#FF0000"],
    isNew: true,
    isSold: false,
  },
  {
    id: 5,
    name: "Cricket Helmet Pro",
    price: 129.99,
    rating: 4.8,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#000000", "#ffffff"],
    isNew: true,
    isSold: false,
  },
  {
    id: 6,
    name: "Professional Bat Grip",
    price: 15.99,
    rating: 4.7,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["#000000", "#ff0000", "#0066cc"],
    isNew: true,
    isSold: false,
  },
]

export function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const addToCartMutation = useAddToCart()

  const handleAddToCart = (product: typeof newProducts[0]) => {
    if (product.isSold) return
    
    addToCartMutation.mutate({
      productId: product.id.toString(),
      quantity: 1,
      product: {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
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
            {newProducts.map((product) => (
              <Card
                key={product.id}
                className="group min-w-[300px] hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 shadow-lg bg-white"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isSold && (
                        <Badge className="bg-gray-500 text-white">
                          SOLD OUT
                        </Badge>
                      )}
                      {!product.isSold && product.isNew && (
                        <Badge className="bg-green-500 text-white">NEW</Badge>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">£{product.price}</span>
                    </div>

                    {/* Color Options */}
                    <div className="flex items-center space-x-2 mb-4">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Add to Cart Button */}
                    {product.isSold ? (
                      <Button 
                        disabled 
                        className="w-full bg-gray-400 text-gray-600 cursor-not-allowed"
                      >
                        Request Stock Update
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 group-hover:scale-105 transition-transform duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
