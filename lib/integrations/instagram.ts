// V9.13.3: Instagram Business Integration Service
import { PlatformIntegration, SyncLog } from '@prisma/client'

export interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
  insights?: {
    impressions: number
    reach: number
    engagement: number
  }
}

export interface InstagramMedia {
  id: string
  media_url: string
  thumbnail_url?: string
  media_type: 'IMAGE' | 'VIDEO'
  caption?: string
}

export interface InstagramBusinessProfile {
  id: string
  name: string
  username: string
  profile_picture_url: string
  followers_count: number
  follows_count: number
  media_count: number
  biography?: string
  website?: string
}

export interface InstagramConfig {
  accessToken: string
  businessAccountId: string
  userId: string
  appId: string
  appSecret: string
  webhookVerifyToken: string
  permissions: string[]
  autoPost: boolean
  syncFrequency: 'real-time' | '15min' | '1hour' | '6hour' | '24hour'
}

export class InstagramIntegrationService {
  private config: InstagramConfig
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor(config: InstagramConfig) {
    this.config = config
  }

  // Authentication Methods
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )
      return response.ok
    } catch (error) {
      console.error('Instagram token validation failed:', error)
      return false
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${this.config.appId}&` +
        `client_secret=${this.config.appSecret}&` +
        `fb_exchange_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.access_token
      }
      return null
    } catch (error) {
      console.error('Instagram token refresh failed:', error)
      return null
    }
  }

  // Profile Management
  async getBusinessProfile(): Promise<InstagramBusinessProfile | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}?` +
        `fields=id,name,username,profile_picture_url,followers_count,follows_count,media_count,biography,website&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Instagram profile fetch failed:', error)
      return null
    }
  }

  async updateBusinessProfile(updates: Partial<InstagramBusinessProfile>): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updates,
            access_token: this.config.accessToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Instagram profile update failed:', error)
      return false
    }
  }

  // Content Management
  async getPosts(limit: number = 25): Promise<InstagramPost[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/media?` +
        `fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&` +
        `limit=${limit}&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.data || []
      }
      return []
    } catch (error) {
      console.error('Instagram posts fetch failed:', error)
      return []
    }
  }

  async createPost(media: InstagramMedia, caption?: string): Promise<string | null> {
    try {
      // Step 1: Create media object
      const mediaResponse = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: media.media_url,
            caption: caption || media.caption || '',
            access_token: this.config.accessToken
          })
        }
      )

      if (!mediaResponse.ok) return null

      const mediaData = await mediaResponse.json()
      const creationId = mediaData.id

      // Step 2: Publish media
      const publishResponse = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: this.config.accessToken
          })
        }
      )

      if (publishResponse.ok) {
        const publishData = await publishResponse.json()
        return publishData.id
      }
      return null
    } catch (error) {
      console.error('Instagram post creation failed:', error)
      return null
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${this.config.accessToken}`,
        { method: 'DELETE' }
      )
      return response.ok
    } catch (error) {
      console.error('Instagram post deletion failed:', error)
      return false
    }
  }

  // Analytics and Insights
  async getPostInsights(postId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}/insights?` +
        `metric=impressions,reach,engagement&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.data || []
      }
      return []
    } catch (error) {
      console.error('Instagram insights fetch failed:', error)
      return []
    }
  }

  async getAccountInsights(period: 'day' | 'week' | 'days_28' = 'day'): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/insights?` +
        `metric=impressions,reach,profile_views,website_clicks&` +
        `period=${period}&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.data || []
      }
      return []
    } catch (error) {
      console.error('Instagram account insights fetch failed:', error)
      return []
    }
  }

  // Product Tagging (Shopping)
  async createProductCatalog(catalogData: any): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.businessAccountId}/product_catalogs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...catalogData,
            access_token: this.config.accessToken
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.id
      }
      return null
    } catch (error) {
      console.error('Instagram catalog creation failed:', error)
      return null
    }
  }

  async tagProducts(postId: string, productTags: any[]): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}/product_tags`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_tags: productTags,
            access_token: this.config.accessToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Instagram product tagging failed:', error)
      return false
    }
  }

  // Webhook Management
  async setupWebhooks(callbackUrl: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.appId}/subscriptions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            object: 'instagram',
            callback_url: callbackUrl,
            fields: 'comments,mentions,story_insights',
            verify_token: this.config.webhookVerifyToken,
            access_token: this.config.accessToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Instagram webhook setup failed:', error)
      return false
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.object === 'instagram') {
        for (const entry of payload.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              await this.processWebhookChange(change)
            }
          }
        }
      }
    } catch (error) {
      console.error('Instagram webhook processing failed:', error)
    }
  }

  private async processWebhookChange(change: any): Promise<void> {
    switch (change.field) {
      case 'comments':
        // Handle new comments
        break
      case 'mentions':
        // Handle mentions
        break
      case 'story_insights':
        // Handle story insights
        break
      default:
        console.log('Unhandled Instagram webhook change:', change.field)
    }
  }

  // Sync Operations
  async syncProfile(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const profile = await this.getBusinessProfile()
      if (profile) {
        return { success: true, data: profile }
      }
      return { success: false, error: 'Failed to fetch profile' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async syncPosts(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const posts = await this.getPosts(50)
      return { success: true, data: posts }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async syncInsights(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const insights = await this.getAccountInsights('days_28')
      return { success: true, data: insights }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
      authentication: boolean
      api_connectivity: boolean
      permissions: boolean
    }
    responseTime: number
  }> {
    const startTime = Date.now()
    const checks = {
      authentication: false,
      api_connectivity: false,
      permissions: false
    }

    try {
      // Check authentication
      checks.authentication = await this.validateToken()

      // Check API connectivity
      try {
        const response = await fetch(`${this.baseUrl}/me?access_token=${this.config.accessToken}`)
        checks.api_connectivity = response.ok
      } catch {
        checks.api_connectivity = false
      }

      // Check permissions
      try {
        const profile = await this.getBusinessProfile()
        checks.permissions = profile !== null
      } catch {
        checks.permissions = false
      }

      const responseTime = Date.now() - startTime
      const healthyChecks = Object.values(checks).filter(Boolean).length
      const status = healthyChecks === 3 ? 'healthy' : healthyChecks >= 2 ? 'degraded' : 'unhealthy'

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

  getConfig(): InstagramConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<InstagramConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export factory function
export function createInstagramIntegration(config: InstagramConfig): InstagramIntegrationService {
  return new InstagramIntegrationService(config)
}

// Export default configuration
export const defaultInstagramConfig: Partial<InstagramConfig> = {
  permissions: [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement'
  ],
  autoPost: false,
  syncFrequency: '1hour'
}