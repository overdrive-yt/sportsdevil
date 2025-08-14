import { Card, CardContent } from "@/components/ui/card"
import { Star, CheckCircle, RefreshCw } from "lucide-react"
import { memo } from "react"

export interface Review {
  id: number
  name: string
  role: string
  rating: number
  verified: boolean
  businessName: string
  timeAgo: string
  text: string
  helpful: number
}

// Authentic Google Maps reviews from Sports Devil customers  
// Real 5-star reviews from actual customers (organized newest first - used as fallback and initial display)
const testimonials = [
  {
    id: 1,
    name: "Joshua Price",
    role: "Local Guide • Cricket Enthusiast",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "a week ago",
    text: "Customer service was outstanding, great selection of bats and other great products. Will be visiting again soon.",
    helpful: 3,
  },
  {
    id: 2,
    name: "Amit Kohli",
    role: "Local Guide • Cricket Parent",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "3 weeks ago",
    text: "We bought an MRF bat for my 14 year old son and our experience with Sports Devil was superb! Jay is very knowledgable about all the equipment and ensures that the product is tailored to the players requirements. Quality and service guaranteed!",
    helpful: 15,
  },
  {
    id: 3,
    name: "Ashhwin Anbu", 
    role: "Local Guide • 43 reviews",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "4 months ago",
    text: "Ordered DSC scud lite steel helmet from them. The delivery was very fast. Great service by the seller. There was and extra sweat band thrown in too. Will totally recommend.",
    helpful: 8,
  },
  {
    id: 4,
    name: "Sehrish Shaikh",
    role: "Birmingham Local • 29 reviews",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "6 months ago",
    text: "Bought all the products the full kit. Highly recommended. Lovely bats and lots of knowledge.",
    helpful: 12,
  },
  {
    id: 5,
    name: "Sandeep John",
    role: "Birmingham Local • 67 reviews",
    image: "/placeholder.svg?height=80&width=80", 
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "a year ago",
    text: "Best place to buy cricket stuff in Birmingham. Got a bat (knocked and ready to play) along with leather ball. Jay has got in depth knowledge about cricket equipment and helps in choosing the right gear for the individual. The store has lots of variety in cricket equipment covering all the major brands.",
    helpful: 22,
  },
  {
    id: 6,
    name: "Khaled Latif",
    role: "Local Guide • Cricket Parent",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    verified: true,
    businessName: "Sports Devil Cricket Store",
    timeAgo: "2 years ago",
    text: "Fantastic service from Jay. My son lost his cricket bat and within 3 days he got a brand new bat to play with. There was great communication via WhatsApp to start with and after explaining our issue Jay fit us in at short notice to come and get a bat from him. He kindly got it ready by applying oil, scuff sheet and knocking it in as best as possible within 24hours. Would definitely recommend and use again!",
    helpful: 28,
  },
]

// Memoize individual review card for performance optimization
const ReviewCard = memo(({ review }: { review: Review }) => (
  <Card className="relative overflow-hidden bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-red-500 flex items-center justify-center text-white font-semibold text-lg">
          {review.name.charAt(0)}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base">
              {review.name}
            </h4>
            {review.verified && (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
          </div>
          
          
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < review.rating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 dark:text-gray-600'
                }`} 
              />
            ))}
            <span className="text-xs text-gray-500 ml-2">{review.timeAgo}</span>
          </div>
          
          <div className="relative">
            <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed italic">
              "{review.text}"
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
))

ReviewCard.displayName = 'ReviewCard'

// Server-side function to fetch Google reviews
async function getGoogleReviews(): Promise<{ reviews: Review[], source: string, error?: string }> {
  try {
    // For production, this will be server-side
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.sportsdevil.co.uk'
      : process.env.NEXTAUTH_URL || 'http://localhost:3001'
    
    const response = await fetch(`${baseUrl}/api/google-reviews`, {
      // Enable ISR caching for production
      next: { 
        revalidate: process.env.NODE_ENV === 'production' ? 1800 : 0 // 30 minutes in production, no cache in dev
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.reviews || !Array.isArray(data.reviews)) {
      throw new Error('Invalid response format')
    }

    return {
      reviews: data.reviews,
      source: data.source || 'api',
      error: data.error
    }
  } catch (error) {
    console.error('❌ Error fetching Google reviews:', error)
    
    // Fallback to authentic reviews if API fails
    return {
      reviews: testimonials,
      source: 'authentic',
      error: 'Failed to load live reviews, showing verified testimonials'
    }
  }
}

export async function Testimonials() {
  const { reviews, source, error } = await getGoogleReviews()
  
  // Use fetched reviews, fallback is already handled in getGoogleReviews
  const displayReviews = reviews

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">What Our Customers Say</h2>
            {source === 'api' && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <RefreshCw className="h-3 w-3" />
                <span>Live Reviews</span>
              </div>
            )}
            {source === 'authentic' && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <CheckCircle className="h-3 w-3" />
                <span>Verified Reviews</span>
              </div>
            )}
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what athletes and sports enthusiasts have to say about Sports Devil.
          </p>
        </div>

        {/* Error State - Only show if there was an error and we're showing fallback reviews */}
        {error && source === 'authentic' && (
          <div className="text-center text-blue-600 mb-8 bg-blue-50 rounded-lg p-4">
            <p>Showing verified customer testimonials. Live reviews will be available shortly.</p>
          </div>
        )}

        {/* Testimonials Grid - Server-rendered with memoized components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((review, index) => (
            <div 
              key={review.id}
              style={{ animationDelay: `${index * 200}ms` }}
              className="animate-fade-in-up"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
