import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@googlemaps/google-maps-services-js'

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  
  if (!apiKey || !placeId) {
    return NextResponse.json({
      error: 'Missing API credentials',
      hasApiKey: !!apiKey,
      hasPlaceId: !!placeId
    })
  }
  
  const client = new Client({})
  
  try {
    console.log('🧪 Testing Google Places API call...')
    
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['reviews', 'rating', 'user_ratings_total', 'name'],
        key: apiKey,
      },
    })

    const result = response.data.result
    const reviews = result.reviews || []
    
    console.log(`📊 API Response: Found ${reviews.length} total reviews`)
    
    // Filter for 5-star reviews
    const fiveStarReviews = reviews.filter((review: any) => review.rating === 5)
    console.log(`⭐ Found ${fiveStarReviews.length} five-star reviews`)
    
    return NextResponse.json({
      success: true,
      businessName: result.name,
      totalReviews: reviews.length,
      overallRating: result.rating,
      totalRatings: result.user_ratings_total,
      fiveStarCount: fiveStarReviews.length,
      reviews: reviews.map((r: any) => ({
        author: r.author_name,
        rating: r.rating,
        time: r.relative_time_description,
        text: r.text?.substring(0, 100) + '...'
      }))
    })
    
  } catch (error: any) {
    console.error('❌ Google Places API Error:', error)
    return NextResponse.json({
      error: 'Google Places API call failed',
      details: error instanceof Error ? error.message : String(error),
      status: error.response?.status,
      statusText: error.response?.statusText
    })
  }
}