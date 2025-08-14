import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface FeaturedCategory {
  id: string
  name: string
  slug: string
  description: string
  productCount: number
  featuredImage: {
    url: string
    alt: string
  } | null
  featuredProduct: {
    id: string
    name: string
    slug: string
  } | null
  filterUrl: string
}

async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  try {
    // For production, this will be server-side
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.sportsdevil.co.uk'
      : process.env.NEXTAUTH_URL || 'http://localhost:3001'
    
    const response = await fetch(`${baseUrl}/api/categories/featured`, {
      // Enable ISR caching for production
      next: { 
        revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 // 1 hour in production, no cache in dev
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Invalid response format')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error fetching featured categories:', error)
    
    // Fallback to default categories if API fails
    return [
      {
        id: 'fallback-bats',
        name: 'Cricket Bats',
        slug: 'bats',
        description: 'Browse our cricket bats collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Cricket Bats' },
        featuredProduct: null,
        filterUrl: '/products?search=cricket%20bats',
      },
      {
        id: 'fallback-gloves',
        name: 'Batting Gloves',
        slug: 'gloves',
        description: 'Browse our batting gloves collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Batting Gloves' },
        featuredProduct: null,
        filterUrl: '/products?search=batting%20gloves',
      },
      {
        id: 'fallback-pads',
        name: 'Batting Pads',
        slug: 'pads',
        description: 'Browse our batting pads collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Batting Pads' },
        featuredProduct: null,
        filterUrl: '/products?search=batting%20pads',
      },
      {
        id: 'fallback-protection',
        name: 'Thigh Pads',
        slug: 'protection',
        description: 'Browse our protective gear collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Thigh Pads' },
        featuredProduct: null,
        filterUrl: '/products?search=thigh%20pads',
      },
      {
        id: 'fallback-helmets',
        name: 'Helmets',
        slug: 'helmets',
        description: 'Browse our helmets collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Helmets' },
        featuredProduct: null,
        filterUrl: '/products?search=helmets',
      },
      {
        id: 'fallback-kit-bags',
        name: 'Kit Bags',
        slug: 'kit-bags',
        description: 'Browse our kit bags collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Kit Bags' },
        featuredProduct: null,
        filterUrl: '/products?search=kit%20bags',
      },
      {
        id: 'fallback-wicket-keeping',
        name: 'Wicket Keeping',
        slug: 'wicket-keeping',
        description: 'Browse our wicket keeping collection',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Wicket Keeping' },
        featuredProduct: null,
        filterUrl: '/products?search=wicket%20keeping',
      },
      {
        id: 'fallback-junior',
        name: 'Junior Stock',
        slug: 'junior',
        description: 'Browse our junior cricket equipment',
        productCount: 0,
        featuredImage: { url: '/placeholder.svg?height=300&width=400', alt: 'Junior Stock' },
        featuredProduct: null,
        filterUrl: '/products?search=junior',
      },
    ]
  }
}

export async function FeaturedItems() {
  const categories = await getFeaturedCategories()

  return (
    <section className="pt-8 pb-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive range of cricket equipment and gear, organized by category for easy browsing.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.filterUrl}
              className="block"
            >
              <Card
                className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={category.featuredImage?.url || "/placeholder.svg"}
                      alt={category.featuredImage?.alt || category.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-2">
                        {category.name}
                        {category.productCount > 0 && (
                          <span className="text-white/80 text-sm font-normal block">
                            {category.productCount} products
                          </span>
                        )}
                      </h3>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                        variant="outline"
                      >
                        Shop Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  )
}
