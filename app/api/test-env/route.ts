import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasPlaceId: !!placeId,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found',
    placeIdPrefix: placeId ? placeId.substring(0, 10) + '...' : 'Not found',
    nodeEnv: process.env.NODE_ENV
  })
}