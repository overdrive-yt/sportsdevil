// V9.13.3: Google Services Integration (Maps, My Business, Analytics)
import { PlatformIntegration, SyncLog } from '@prisma/client'

export interface GoogleMapsPlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
  rating?: number
  user_ratings_total?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  opening_hours?: {
    open_now: boolean
    periods: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
    weekday_text: string[]
  }
  formatted_phone_number?: string
  website?: string
}

export interface GoogleMyBusinessLocation {
  name: string
  locationName: string
  primaryPhone?: string
  website?: string
  categories: Array<{
    categoryId: string
    displayName: string
  }>
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  latlng?: {
    latitude: number
    longitude: number
  }
  openInfo?: {
    status: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED'
    canReopen: boolean
  }
  serviceArea?: {
    businessType: 'CUSTOMER_LOCATION_ONLY' | 'CUSTOMER_AND_BUSINESS_LOCATION'
    radius?: {
      low: number
      high: number
    }
  }
  attributes?: Array<{
    attributeId: string
    valueType: 'BOOL' | 'ENUM' | 'URL' | 'REPEATED_ENUM'
    values: any[]
  }>
}

export interface GoogleMyBusinessReview {
  name: string
  reviewId: string
  reviewer: {
    displayName: string
    profilePhotoUrl?: string
  }
  starRating: number
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: {
    comment: string
    updateTime: string
  }
}

export interface GoogleAnalyticsData {
  dimensionHeaders: Array<{ name: string }>
  metricHeaders: Array<{ name: string; type: string }>
  rows: Array<{
    dimensionValues: Array<{ value: string }>
    metricValues: Array<{ value: string }>
  }>
  totals: Array<{
    metricValues: Array<{ value: string }>
  }>
  maximums: Array<{
    metricValues: Array<{ value: string }>
  }>
  minimums: Array<{
    metricValues: Array<{ value: string }>
  }>
}

export interface GoogleConfig {
  credentials: {
    client_id: string
    client_secret: string
    refresh_token: string
    access_token: string
  }
  maps: {
    apiKey: string
    placeId?: string
    enableGeocoding: boolean
    enableDirections: boolean
  }
  myBusiness: {
    accountId: string
    locationId: string
    enableReviews: boolean
    enablePosts: boolean
    autoReplyToReviews: boolean
  }
  analytics: {
    propertyId: string
    enableEcommerce: boolean
    enableCustomEvents: boolean
  }
  syncFrequency: 'real-time' | '15min' | '1hour' | '6hour' | '24hour'
  enableWebhooks: boolean
}

export class GoogleIntegrationService {
  private config: GoogleConfig
  private mapsBaseUrl = 'https://maps.googleapis.com/maps/api'
  private myBusinessBaseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1'
  private analyticsBaseUrl = 'https://analyticsdata.googleapis.com/v1beta'

  constructor(config: GoogleConfig) {
    this.config = config
  }

  // Authentication Methods
  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.credentials.client_id,
          client_secret: this.config.credentials.client_secret,
          refresh_token: this.config.credentials.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      if (response.ok) {
        const data = await response.json()
        this.config.credentials.access_token = data.access_token
        return data.access_token
      }
      return null
    } catch (error) {
      console.error('Google token refresh failed:', error)
      return null
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${this.config.credentials.access_token}`
      )
      return response.ok
    } catch (error) {
      console.error('Google token validation failed:', error)
      return false
    }
  }

  // Google Maps Integration
  async getPlaceDetails(placeId?: string): Promise<GoogleMapsPlace | null> {
    try {
      const targetPlaceId = placeId || this.config.maps.placeId
      if (!targetPlaceId) return null

      const response = await fetch(
        `${this.mapsBaseUrl}/place/details/json?` +
        `place_id=${targetPlaceId}&` +
        `fields=place_id,name,formatted_address,geometry,types,rating,user_ratings_total,photos,opening_hours,formatted_phone_number,website&` +
        `key=${this.config.maps.apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        return data.result
      }
      return null
    } catch (error) {
      console.error('Google Maps place details fetch failed:', error)
      return null
    }
  }

  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<GoogleMapsPlace[]> {
    try {
      let url = `${this.mapsBaseUrl}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.config.maps.apiKey}`
      
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=50000`
      }

      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        return data.results || []
      }
      return []
    } catch (error) {
      console.error('Google Maps place search failed:', error)
      return []
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      if (!this.config.maps.enableGeocoding) return null

      const response = await fetch(
        `${this.mapsBaseUrl}/geocode/json?` +
        `address=${encodeURIComponent(address)}&` +
        `key=${this.config.maps.apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          return data.results[0].geometry.location
        }
      }
      return null
    } catch (error) {
      console.error('Google Maps geocoding failed:', error)
      return null
    }
  }

  async getDirections(
    origin: string,
    destination: string,
    travelMode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<any | null> {
    try {
      if (!this.config.maps.enableDirections) return null

      const response = await fetch(
        `${this.mapsBaseUrl}/directions/json?` +
        `origin=${encodeURIComponent(origin)}&` +
        `destination=${encodeURIComponent(destination)}&` +
        `mode=${travelMode}&` +
        `key=${this.config.maps.apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        return data.routes || []
      }
      return null
    } catch (error) {
      console.error('Google Maps directions failed:', error)
      return null
    }
  }

  // Google My Business Integration
  async getMyBusinessLocation(): Promise<GoogleMyBusinessLocation | null> {
    try {
      const response = await fetch(
        `${this.myBusinessBaseUrl}/accounts/${this.config.myBusiness.accountId}/locations/${this.config.myBusiness.locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Google My Business location fetch failed:', error)
      return null
    }
  }

  async updateMyBusinessLocation(updates: Partial<GoogleMyBusinessLocation>): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.myBusinessBaseUrl}/accounts/${this.config.myBusiness.accountId}/locations/${this.config.myBusiness.locationId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      )
      return response.ok
    } catch (error) {
      console.error('Google My Business location update failed:', error)
      return false
    }
  }

  async getMyBusinessReviews(): Promise<GoogleMyBusinessReview[]> {
    try {
      if (!this.config.myBusiness.enableReviews) return []

      const response = await fetch(
        `${this.myBusinessBaseUrl}/accounts/${this.config.myBusiness.accountId}/locations/${this.config.myBusiness.locationId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.reviews || []
      }
      return []
    } catch (error) {
      console.error('Google My Business reviews fetch failed:', error)
      return []
    }
  }

  async replyToReview(reviewName: string, replyText: string): Promise<boolean> {
    try {
      if (!this.config.myBusiness.enableReviews) return false

      const response = await fetch(
        `${this.myBusinessBaseUrl}/${reviewName}/reply`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: replyText
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Google My Business review reply failed:', error)
      return false
    }
  }

  async createMyBusinessPost(postData: {
    languageCode: string
    summary: string
    media?: Array<{
      mediaFormat: 'PHOTO' | 'VIDEO'
      sourceUrl: string
    }>
    callToAction?: {
      actionType: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP'
      url?: string
    }
    event?: {
      title: string
      schedule: {
        startDate: { year: number; month: number; day: number }
        endDate?: { year: number; month: number; day: number }
        startTime?: { hours: number; minutes: number }
        endTime?: { hours: number; minutes: number }
      }
    }
  }): Promise<string | null> {
    try {
      if (!this.config.myBusiness.enablePosts) return null

      const response = await fetch(
        `${this.myBusinessBaseUrl}/accounts/${this.config.myBusiness.accountId}/locations/${this.config.myBusiness.locationId}/localPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.name
      }
      return null
    } catch (error) {
      console.error('Google My Business post creation failed:', error)
      return null
    }
  }

  // Google Analytics Integration
  async getAnalyticsData(request: {
    dateRanges: Array<{ startDate: string; endDate: string }>
    dimensions?: Array<{ name: string }>
    metrics: Array<{ name: string }>
    orderBys?: Array<{
      dimension?: { dimensionName: string }
      metric?: { metricName: string }
      desc?: boolean
    }>
    limit?: number
  }): Promise<GoogleAnalyticsData | null> {
    try {
      const response = await fetch(
        `${this.analyticsBaseUrl}/properties/${this.config.analytics.propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.credentials.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        }
      )

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Google Analytics data fetch failed:', error)
      return null
    }
  }

  async getWebsiteTraffic(days: number = 30): Promise<any> {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    return this.getAnalyticsData({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'pageviews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }]
    })
  }

  async getEcommerceData(days: number = 30): Promise<any> {
    if (!this.config.analytics.enableEcommerce) return null

    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    return this.getAnalyticsData({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'purchaseRevenue' },
        { name: 'totalPurchasers' },
        { name: 'purchases' },
        { name: 'ecommercePurchases' },
        { name: 'itemsPurchased' }
      ]
    })
  }

  async trackCustomEvent(eventName: string, parameters: Record<string, any> = {}): Promise<boolean> {
    try {
      if (!this.config.analytics.enableCustomEvents) return false

      // This would typically be handled client-side via gtag
      // Here we're just logging for server-side tracking setup
      console.log('Custom event tracked:', { eventName, parameters })
      return true
    } catch (error) {
      console.error('Google Analytics custom event tracking failed:', error)
      return false
    }
  }

  // Sync Operations
  async syncMapsData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const place = await this.getPlaceDetails()
      if (place) {
        return { success: true, data: place }
      }
      return { success: false, error: 'Failed to fetch place data' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async syncMyBusinessData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [location, reviews] = await Promise.all([
        this.getMyBusinessLocation(),
        this.getMyBusinessReviews()
      ])

      return {
        success: true,
        data: { location, reviews }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async syncAnalyticsData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [traffic, ecommerce] = await Promise.all([
        this.getWebsiteTraffic(30),
        this.getEcommerceData(30)
      ])

      return {
        success: true,
        data: { traffic, ecommerce }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
      authentication: boolean
      maps_api: boolean
      my_business_api: boolean
      analytics_api: boolean
    }
    responseTime: number
  }> {
    const startTime = Date.now()
    const checks = {
      authentication: false,
      maps_api: false,
      my_business_api: false,
      analytics_api: false
    }

    try {
      // Check authentication
      checks.authentication = await this.validateToken()

      // Check Maps API
      try {
        const place = await this.getPlaceDetails()
        checks.maps_api = place !== null
      } catch {
        checks.maps_api = false
      }

      // Check My Business API
      try {
        const location = await this.getMyBusinessLocation()
        checks.my_business_api = location !== null
      } catch {
        checks.my_business_api = false
      }

      // Check Analytics API
      try {
        const traffic = await this.getWebsiteTraffic(1)
        checks.analytics_api = traffic !== null
      } catch {
        checks.analytics_api = false
      }

      const responseTime = Date.now() - startTime
      const healthyChecks = Object.values(checks).filter(Boolean).length
      const status = healthyChecks === 4 ? 'healthy' : healthyChecks >= 2 ? 'degraded' : 'unhealthy'

      return { status, checks, responseTime }
    } catch (error) {
      return {
        status: 'unhealthy',
        checks,
        responseTime: Date.now() - startTime
      }
    }
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    const health = await this.healthCheck()
    return health.status !== 'unhealthy'
  }

  getConfig(): GoogleConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<GoogleConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export factory function
export function createGoogleIntegration(config: GoogleConfig): GoogleIntegrationService {
  return new GoogleIntegrationService(config)
}

// Export default configuration
export const defaultGoogleConfig: Partial<GoogleConfig> = {
  maps: {
    apiKey: '',
    enableGeocoding: true,
    enableDirections: true
  },
  myBusiness: {
    accountId: '',
    locationId: '',
    enableReviews: true,
    enablePosts: true,
    autoReplyToReviews: false
  },
  analytics: {
    propertyId: '',
    enableEcommerce: true,
    enableCustomEvents: true
  },
  syncFrequency: '6hour',
  enableWebhooks: false
}