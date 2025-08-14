'use client'

import { useState, useEffect } from 'react'

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

export interface ReviewsResponse {
  reviews: Review[]
  source: 'api' | 'authentic' | 'fallback'
  cached: boolean
  timestamp: number
  error?: string
}

export function useGoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string>('loading')

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/google-reviews', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ReviewsResponse = await response.json()
        
        setReviews(data.reviews)
        setSource(data.source)
        
        if (data.error) {
          setError(data.error)
        }
        
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
        setError('Failed to load reviews')
        
        // Fallback to default authentic reviews (organized newest first)
        const fallbackReviews: Review[] = [
          {
            id: 1,
            name: "Joshua Price",
            role: "Local Guide • Cricket Enthusiast",
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
            rating: 5,
            verified: true,
            businessName: "Sports Devil Cricket Store",
            timeAgo: "2 years ago",
            text: "Fantastic service from Jay. My son lost his cricket bat and within 3 days he got a brand new bat to play with. There was great communication via WhatsApp to start with and after explaining our issue Jay fit us in at short notice to come and get a bat from him. He kindly got it ready by applying oil, scuff sheet and knocking it in as best as possible within 24hours. Would definitely recommend and use again!",
            helpful: 28,
          },
        ]
        
        setReviews(fallbackReviews)
        setSource('fallback')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return {
    reviews,
    loading,
    error,
    source,
    refetch: () => {
      setLoading(true)
      // Re-trigger the effect by updating a dependency
      fetchReviews()
    }
  }
}

// Helper function for components that want to fetch reviews manually
async function fetchReviews(): Promise<ReviewsResponse> {
  const response = await fetch('/api/google-reviews')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}