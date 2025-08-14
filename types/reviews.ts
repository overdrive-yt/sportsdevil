// TypeScript interfaces for Google Maps Reviews integration

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
  image?: string
}

export interface GooglePlacesReview {
  author_name: string
  author_url?: string
  language?: string
  original_language?: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
  translated?: boolean
}

export interface GooglePlacesResponse {
  result: {
    reviews?: GooglePlacesReview[]
    rating?: number
    user_ratings_total?: number
  }
  status: string
}

export interface ReviewsApiResponse {
  reviews: Review[]
  source: 'api' | 'authentic' | 'fallback'
  cached: boolean
  timestamp: number
  error?: string
}

export interface CachedReviews {
  reviews: Review[]
  timestamp: number
  source: 'api' | 'authentic' | 'fallback'
}

// Sports Devil specific review data
export interface SportsDevilReview extends Review {
  businessName: 'Sports Devil Cricket Store'
  verified: true
  rating: 5 // Only 5-star reviews
}