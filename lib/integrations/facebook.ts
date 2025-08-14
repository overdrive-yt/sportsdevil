// V9.13.3: Facebook Business Integration Service
import { PlatformIntegration, SyncLog } from '@prisma/client'

export interface FacebookPage {
  id: string
  name: string
  category: string
  about?: string
  website?: string
  phone?: string
  location?: {
    street?: string
    city?: string
    country?: string
    zip?: string
  }
  cover?: {
    source: string
  }
  picture?: {
    data: {
      url: string
    }
  }
  fan_count?: number
  followers_count?: number
  checkins?: number
  were_here_count?: number
}

export interface FacebookPost {
  id: string
  message?: string
  story?: string
  link?: string
  picture?: string
  type: 'link' | 'status' | 'photo' | 'video' | 'offer'
  created_time: string
  updated_time: string
  likes?: {
    summary: {
      total_count: number
    }
  }
  comments?: {
    summary: {
      total_count: number
    }
  }
  shares?: {
    count: number
  }
  insights?: {
    impressions: number
    reach: number
    engagement: number
  }
}

export interface FacebookEvent {
  id: string
  name: string
  description?: string
  start_time: string
  end_time?: string
  place?: {
    name: string
    location: {
      city: string
      country: string
      latitude: number
      longitude: number
    }
  }
  attending_count?: number
  interested_count?: number
  maybe_count?: number
  cover?: {
    source: string
  }
}

export interface FacebookConfig {
  accessToken: string
  pageId: string
  appId: string
  appSecret: string
  userId: string
  permissions: string[]
  webhookVerifyToken: string
  autoPost: boolean
  syncFrequency: 'real-time' | '15min' | '1hour' | '6hour' | '24hour'
  enableEvents: boolean
  enableMessaging: boolean
}

export class FacebookIntegrationService {
  private config: FacebookConfig
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor(config: FacebookConfig) {
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
      console.error('Facebook token validation failed:', error)
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
      console.error('Facebook token refresh failed:', error)
      return null
    }
  }

  async getPageAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}?` +
        `fields=access_token&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.access_token
      }
      return null
    } catch (error) {
      console.error('Facebook page token fetch failed:', error)
      return null
    }
  }

  // Page Management
  async getPageInfo(): Promise<FacebookPage | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}?` +
        `fields=id,name,category,about,website,phone,location,cover,picture,fan_count,followers_count,checkins,were_here_count&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Facebook page info fetch failed:', error)
      return null
    }
  }

  async updatePageInfo(updates: Partial<FacebookPage>): Promise<boolean> {
    try {
      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return false

      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updates,
            access_token: pageToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Facebook page update failed:', error)
      return false
    }
  }

  // Content Management
  async getPosts(limit: number = 25): Promise<FacebookPost[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/posts?` +
        `fields=id,message,story,link,picture,type,created_time,updated_time,likes.summary(true),comments.summary(true),shares&` +
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
      console.error('Facebook posts fetch failed:', error)
      return []
    }
  }

  async createPost(content: {
    message?: string
    link?: string
    picture?: string
    name?: string
    caption?: string
    description?: string
    scheduled_publish_time?: number
  }): Promise<string | null> {
    try {
      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return null

      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...content,
            access_token: pageToken
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.id
      }
      return null
    } catch (error) {
      console.error('Facebook post creation failed:', error)
      return null
    }
  }

  async updatePost(postId: string, updates: { message?: string }): Promise<boolean> {
    try {
      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return false

      const response = await fetch(
        `${this.baseUrl}/${postId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updates,
            access_token: pageToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Facebook post update failed:', error)
      return false
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return false

      const response = await fetch(
        `${this.baseUrl}/${postId}?access_token=${pageToken}`,
        { method: 'DELETE' }
      )
      return response.ok
    } catch (error) {
      console.error('Facebook post deletion failed:', error)
      return false
    }
  }

  // Event Management
  async getEvents(limit: number = 25): Promise<FacebookEvent[]> {
    try {
      if (!this.config.enableEvents) return []

      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/events?` +
        `fields=id,name,description,start_time,end_time,place,attending_count,interested_count,maybe_count,cover&` +
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
      console.error('Facebook events fetch failed:', error)
      return []
    }
  }

  async createEvent(eventData: {
    name: string
    description?: string
    start_time: string
    end_time?: string
    location?: string
  }): Promise<string | null> {
    try {
      if (!this.config.enableEvents) return null

      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return null

      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...eventData,
            access_token: pageToken
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        return data.id
      }
      return null
    } catch (error) {
      console.error('Facebook event creation failed:', error)
      return null
    }
  }

  // Analytics and Insights
  async getPageInsights(metrics: string[] = ['page_views', 'page_fans', 'page_engaged_users']): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/insights?` +
        `metric=${metrics.join(',')}&` +
        `period=days_28&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.data || []
      }
      return []
    } catch (error) {
      console.error('Facebook page insights fetch failed:', error)
      return []
    }
  }

  async getPostInsights(postId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}/insights?` +
        `metric=post_impressions,post_reach,post_engaged_users,post_clicks&` +
        `access_token=${this.config.accessToken}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        return data.data || []
      }
      return []
    } catch (error) {
      console.error('Facebook post insights fetch failed:', error)
      return []
    }
  }

  // Messaging (if enabled)
  async getMessages(limit: number = 25): Promise<any[]> {
    try {
      if (!this.config.enableMessaging) return []

      const response = await fetch(
        `${this.baseUrl}/${this.config.pageId}/conversations?` +
        `fields=participants,messages{message,created_time,from}&` +
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
      console.error('Facebook messages fetch failed:', error)
      return []
    }
  }

  async sendMessage(recipientId: string, message: string): Promise<boolean> {
    try {
      if (!this.config.enableMessaging) return false

      const pageToken = await this.getPageAccessToken()
      if (!pageToken) return false

      const response = await fetch(
        `${this.baseUrl}/me/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message },
            access_token: pageToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Facebook message send failed:', error)
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
            object: 'page',
            callback_url: callbackUrl,
            fields: 'feed,messages,messaging_postbacks,messaging_optins',
            verify_token: this.config.webhookVerifyToken,
            access_token: this.config.accessToken
          })
        }
      )
      return response.ok
    } catch (error) {
      console.error('Facebook webhook setup failed:', error)
      return false
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.object === 'page') {
        for (const entry of payload.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              await this.processWebhookChange(change)
            }
          }
          if (entry.messaging) {
            for (const message of entry.messaging) {
              await this.processWebhookMessage(message)
            }
          }
        }
      }
    } catch (error) {
      console.error('Facebook webhook processing failed:', error)
    }
  }

  private async processWebhookChange(change: any): Promise<void> {
    switch (change.field) {
      case 'feed':
        // Handle feed changes (new posts, comments, etc.)
        break
      case 'live_videos':
        // Handle live video events
        break
      default:
        console.log('Unhandled Facebook webhook change:', change.field)
    }
  }

  private async processWebhookMessage(message: any): Promise<void> {
    if (message.message) {
      // Handle incoming message
      console.log('New Facebook message:', message.message.text)
    } else if (message.postback) {
      // Handle postback (button clicks, etc.)
      console.log('Facebook postback:', message.postback.payload)
    }
  }

  // Sync Operations
  async syncPage(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const page = await this.getPageInfo()
      if (page) {
        return { success: true, data: page }
      }
      return { success: false, error: 'Failed to fetch page info' }
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

  async syncEvents(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const events = await this.getEvents(25)
      return { success: true, data: events }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async syncInsights(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const insights = await this.getPageInsights()
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
      page_access: boolean
      permissions: boolean
    }
    responseTime: number
  }> {
    const startTime = Date.now()
    const checks = {
      authentication: false,
      api_connectivity: false,
      page_access: false,
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

      // Check page access
      try {
        const page = await this.getPageInfo()
        checks.page_access = page !== null
      } catch {
        checks.page_access = false
      }

      // Check permissions
      try {
        const pageToken = await this.getPageAccessToken()
        checks.permissions = pageToken !== null
      } catch {
        checks.permissions = false
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

  getConfig(): FacebookConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<FacebookConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export factory function
export function createFacebookIntegration(config: FacebookConfig): FacebookIntegrationService {
  return new FacebookIntegrationService(config)
}

// Export default configuration
export const defaultFacebookConfig: Partial<FacebookConfig> = {
  permissions: [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'pages_manage_metadata',
    'pages_read_user_content',
    'pages_messaging'
  ],
  autoPost: false,
  syncFrequency: '1hour',
  enableEvents: true,
  enableMessaging: false
}