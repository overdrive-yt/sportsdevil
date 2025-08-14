/**
 * Social media integration for Sports Devil Cricket Equipment
 * Handles Instagram feed, social sharing, user-generated content, and reviews
 */

import { z } from 'zod'

export interface InstagramPost {
  id: string
  caption?: string
  media_url: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  permalink: string
  timestamp: string
  username?: string
  like_count?: number
  comments_count?: number
  children?: InstagramPost[]
}

export interface SocialShare {
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'linkedin'
  url: string
  title: string
  description?: string
  image?: string
  hashtags?: string[]
}

export interface UserGeneratedContent {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: 'review' | 'photo' | 'video' | 'story'
  content: string
  mediaUrl?: string
  productId?: string
  rating?: number
  isApproved: boolean
  isPublished: boolean
  hashtags: string[]
  mentions: string[]
  createdAt: Date
  approvedAt?: Date
  publishedAt?: Date
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  content: string
  images: string[]
  verified: boolean
  helpful: number
  notHelpful: number
  isApproved: boolean
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SocialMetrics {
  platform: string
  followers: number
  engagement: number
  posts: number
  reach?: number
  impressions?: number
  lastUpdated: Date
}

/**
 * Instagram feed manager for Sports Devil
 */
export class InstagramManager {
  private accessToken: string | undefined
  private businessAccountId: string | undefined

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  }

  async getInstagramFeed(limit: number = 12): Promise<InstagramPost[]> {
    try {
      if (!this.accessToken || !this.businessAccountId) {
        console.warn('Instagram API credentials not configured, using fallback data')
        return this.getFallbackInstagramData(limit)
      }

      // Instagram Basic Display API call
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,permalink,timestamp,username&limit=${limit}&access_token=${this.accessToken}`
      )

      if (!response.ok) {
        console.error('Instagram API error:', response.status, response.statusText)
        return this.getFallbackInstagramData(limit)
      }

      const data = await response.json()
      
      if (data.error) {
        console.error('Instagram API error:', data.error)
        return this.getFallbackInstagramData(limit)
      }

      return data.data || []

    } catch (error) {
      console.error('Error fetching Instagram feed:', error)
      return this.getFallbackInstagramData(limit)
    }
  }

  private getFallbackInstagramData(limit: number): InstagramPost[] {
    // Fallback data for when Instagram API is not available
    const fallbackPosts: InstagramPost[] = [
      {
        id: 'fallback-1',
        caption: '🏏 New cricket bats just arrived! Professional English Willow bats perfect for the upcoming season. Visit our Birmingham store! #CricketEquipment #SportsDevil #Birmingham',
        media_url: '/images/products/cricket/balls/sg-red-test-match-balls/sg-red-test-match-balls-main.png',
        media_type: 'IMAGE',
        permalink: 'https://instagram.com/p/fallback1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        username: 'sportsdevil1',
        like_count: 45,
        comments_count: 8
      },
      {
        id: 'fallback-2',
        caption: '⚡ Speed and precision! Check out this customer showing off their batting technique with our premium gear. What\'s your best cricket shot? #CricketAction #CustomerSpotlight',
        media_url: '/images/products/cricket/balls/sg-white-match-balls/sg-white-match-balls-main.png',
        media_type: 'IMAGE',
        permalink: 'https://instagram.com/p/fallback2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        username: 'sportsdevil1',
        like_count: 32,
        comments_count: 12
      },
      {
        id: 'fallback-3',
        caption: '🛡️ Safety first! Our complete protective gear collection keeps you safe on the pitch. Pads, gloves, helmets - we\'ve got you covered! #CricketSafety #ProtectiveGear',
        media_url: '/images/products/cricket/balls/grasshopper-beamer-leather-red-cricket-ball-youth-pack-of-1/grasshopper-beamer-leather-red-cricket-ball---youth---pack-of-1-main.jpeg',
        media_type: 'IMAGE',
        permalink: 'https://instagram.com/p/fallback3',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        username: 'sportsdevil1',
        like_count: 28,
        comments_count: 5
      },
      {
        id: 'fallback-4',
        caption: '🏆 Match day ready! Perfect weather for cricket in Birmingham. Get your gear from Sports Devil and dominate the pitch! #MatchDay #Birmingham #Cricket',
        media_url: '/images/products/cricket/balls/sg-everlast-leather-red-cricket-ball-pack-of-1/sg-everlast-leather-red-cricket-ball---pack-of-1-main.png',
        media_type: 'IMAGE',
        permalink: 'https://instagram.com/p/fallback4',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        username: 'sportsdevil1',
        like_count: 51,
        comments_count: 15
      }
    ]

    return fallbackPosts.slice(0, limit)
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        return false
      }

      // Instagram token refresh
      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`
      )

      const data = await response.json()
      
      if (data.access_token) {
        this.accessToken = data.access_token
        console.log('Instagram access token refreshed')
        return true
      }

      return false

    } catch (error) {
      console.error('Error refreshing Instagram token:', error)
      return false
    }
  }

  async getPostInsights(postId: string): Promise<any> {
    try {
      if (!this.accessToken) {
        return null
      }

      const response = await fetch(
        `https://graph.instagram.com/${postId}/insights?metric=impressions,reach,engagement&access_token=${this.accessToken}`
      )

      const data = await response.json()
      return data.data || null

    } catch (error) {
      console.error('Error getting post insights:', error)
      return null
    }
  }
}

/**
 * Social sharing utilities for Sports Devil
 */
export class SocialShareManager {
  
  static generateShareUrls(shareData: SocialShare): Record<string, string> {
    const { platform, url, title, description, image, hashtags } = shareData
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || '')
    const encodedImage = image ? encodeURIComponent(image) : ''
    const hashtagString = hashtags ? hashtags.map(tag => `#${tag}`).join(' ') : ''
    const encodedHashtags = encodeURIComponent(hashtagString)

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${encodedHashtags ? '%20' + encodedHashtags : ''}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
    }

    return shareUrls
  }

  static generateProductShareData(product: {
    id: string
    name: string
    price: number
    image: string
    description: string
  }): SocialShare {
    const url = `https://sportsdevil.co.uk/products/${product.id}`
    
    return {
      platform: 'facebook', // Default, can be changed
      url,
      title: `${product.name} - Sports Devil Cricket Equipment`,
      description: `${product.description} Available for £${product.price.toFixed(2)} at Sports Devil Birmingham.`,
      image: product.image,
      hashtags: ['cricket', 'sportsdevil', 'birmingham', 'cricketequipment']
    }
  }

  static generateOfferShareData(offer: {
    title: string
    description: string
    discount: string
    image?: string
  }): SocialShare {
    const url = 'https://sportsdevil.co.uk/offers'
    
    return {
      platform: 'facebook',
      url,
      title: `${offer.title} - Sports Devil`,
      description: `${offer.description} Save ${offer.discount} on cricket equipment!`,
      image: offer.image,
      hashtags: ['cricketdeals', 'sportsdevil', 'birmingham', 'cricketequipment', 'sale']
    }
  }

  static trackShareEvent(platform: string, contentType: string, contentId: string): void {
    // Log share event for analytics
    console.log('Social share event:', {
      platform,
      contentType,
      contentId,
      timestamp: new Date().toISOString(),
    })

    // In a real implementation, send to analytics service
    // analytics.track('social_share', { platform, contentType, contentId })
  }
}

/**
 * User-generated content manager
 */
export class UserGeneratedContentManager {
  
  static async submitContent(contentData: {
    userId: string
    userName: string
    userEmail: string
    type: UserGeneratedContent['type']
    content: string
    mediaUrl?: string
    productId?: string
    rating?: number
    hashtags?: string[]
  }): Promise<UserGeneratedContent> {
    try {
      const ugcContent: UserGeneratedContent = {
        id: `ugc-${Date.now()}`,
        userId: contentData.userId,
        userName: contentData.userName,
        userEmail: contentData.userEmail,
        type: contentData.type,
        content: contentData.content,
        mediaUrl: contentData.mediaUrl,
        productId: contentData.productId,
        rating: contentData.rating,
        isApproved: false,
        isPublished: false,
        hashtags: contentData.hashtags || [],
        mentions: this.extractMentions(contentData.content),
        createdAt: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.userGeneratedContent.create({ data: ugcContent })

      console.log('UGC content submitted:', ugcContent)
      return ugcContent

    } catch (error) {
      console.error('Error submitting UGC content:', error)
      throw error
    }
  }

  static async approveContent(contentId: string, approvedBy: string): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.userGeneratedContent.update({
      //   where: { id: contentId },
      //   data: {
      //     isApproved: true,
      //     approvedAt: new Date(),
      //     approvedBy
      //   }
      // })

      console.log('UGC content approved:', { contentId, approvedBy })
      return true

    } catch (error) {
      console.error('Error approving UGC content:', error)
      throw error
    }
  }

  static async publishContent(contentId: string): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.userGeneratedContent.update({
      //   where: { id: contentId },
      //   data: {
      //     isPublished: true,
      //     publishedAt: new Date()
      //   }
      // })

      console.log('UGC content published:', { contentId })
      return true

    } catch (error) {
      console.error('Error publishing UGC content:', error)
      throw error
    }
  }

  static async getPublishedContent(filters?: {
    type?: UserGeneratedContent['type']
    productId?: string
    limit?: number
  }): Promise<UserGeneratedContent[]> {
    try {
      // In a real implementation, query database
      // const content = await prisma.userGeneratedContent.findMany({
      //   where: {
      //     isPublished: true,
      //     type: filters?.type,
      //     productId: filters?.productId
      //   },
      //   take: filters?.limit || 20,
      //   orderBy: { publishedAt: 'desc' }
      // })

      // Mock data for demonstration
      return []

    } catch (error) {
      console.error('Error getting published UGC content:', error)
      return []
    }
  }

  private static extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  private static extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g
    const hashtags: string[] = []
    let match

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1])
    }

    return hashtags
  }
}

/**
 * Product review system
 */
export class ProductReviewManager {
  
  static async submitReview(reviewData: {
    productId: string
    userId: string
    userName: string
    rating: number
    title: string
    content: string
    images?: string[]
    verified?: boolean
  }): Promise<ProductReview> {
    try {
      const review: ProductReview = {
        id: `review-${Date.now()}`,
        productId: reviewData.productId,
        userId: reviewData.userId,
        userName: reviewData.userName,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        images: reviewData.images || [],
        verified: reviewData.verified || false,
        helpful: 0,
        notHelpful: 0,
        isApproved: false,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.productReview.create({ data: review })

      console.log('Product review submitted:', review)
      
      // Auto-approve if from verified purchase
      if (review.verified) {
        await this.approveReview(review.id, 'system')
      }

      return review

    } catch (error) {
      console.error('Error submitting product review:', error)
      throw error
    }
  }

  static async approveReview(reviewId: string, approvedBy: string): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.productReview.update({
      //   where: { id: reviewId },
      //   data: {
      //     isApproved: true,
      //     isPublished: true,
      //     updatedAt: new Date()
      //   }
      // })

      console.log('Product review approved:', { reviewId, approvedBy })
      return true

    } catch (error) {
      console.error('Error approving product review:', error)
      throw error
    }
  }

  static async getProductReviews(productId: string, options?: {
    limit?: number
    offset?: number
    sortBy?: 'date' | 'rating' | 'helpful'
  }): Promise<{ reviews: ProductReview[], total: number, averageRating: number }> {
    try {
      // In a real implementation, query database
      // const reviews = await prisma.productReview.findMany({
      //   where: {
      //     productId,
      //     isPublished: true
      //   },
      //   take: options?.limit || 10,
      //   skip: options?.offset || 0,
      //   orderBy: this.getReviewSortOrder(options?.sortBy)
      // })

      // Mock data
      const mockReviews: ProductReview[] = [
        {
          id: 'review-1',
          productId,
          userId: 'user-1',
          userName: 'Cricket Fan',
          rating: 5,
          title: 'Excellent cricket bat!',
          content: 'This bat has improved my game significantly. Great balance and feels amazing to use.',
          images: [],
          verified: true,
          helpful: 8,
          notHelpful: 1,
          isApproved: true,
          isPublished: true,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        }
      ]

      const total = mockReviews.length
      const averageRating = total > 0 
        ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / total 
        : 0

      return { 
        reviews: mockReviews, 
        total, 
        averageRating: Math.round(averageRating * 10) / 10 
      }

    } catch (error) {
      console.error('Error getting product reviews:', error)
      return { reviews: [], total: 0, averageRating: 0 }
    }
  }

  static async markReviewHelpful(reviewId: string, helpful: boolean): Promise<boolean> {
    try {
      // In a real implementation, update database
      // await prisma.productReview.update({
      //   where: { id: reviewId },
      //   data: {
      //     helpful: helpful ? { increment: 1 } : undefined,
      //     notHelpful: !helpful ? { increment: 1 } : undefined,
      //     updatedAt: new Date()
      //   }
      // })

      console.log('Review marked as helpful:', { reviewId, helpful })
      return true

    } catch (error) {
      console.error('Error marking review helpful:', error)
      throw error
    }
  }

  private static getReviewSortOrder(sortBy?: string) {
    switch (sortBy) {
      case 'rating':
        return { rating: 'desc' as const }
      case 'helpful':
        return { helpful: 'desc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  }
}

/**
 * Social media metrics tracker
 */
export class SocialMetricsTracker {
  
  static async updateMetrics(platform: string, metrics: Partial<SocialMetrics>): Promise<SocialMetrics> {
    try {
      const socialMetrics: SocialMetrics = {
        platform,
        followers: metrics.followers || 0,
        engagement: metrics.engagement || 0,
        posts: metrics.posts || 0,
        reach: metrics.reach,
        impressions: metrics.impressions,
        lastUpdated: new Date(),
      }

      // In a real implementation, save to database
      // await prisma.socialMetrics.upsert({
      //   where: { platform },
      //   create: socialMetrics,
      //   update: socialMetrics
      // })

      console.log('Social metrics updated:', socialMetrics)
      return socialMetrics

    } catch (error) {
      console.error('Error updating social metrics:', error)
      throw error
    }
  }

  static async getAllMetrics(): Promise<SocialMetrics[]> {
    try {
      // In a real implementation, query database
      // const metrics = await prisma.socialMetrics.findMany({
      //   orderBy: { lastUpdated: 'desc' }
      // })

      // Mock data
      const mockMetrics: SocialMetrics[] = [
        {
          platform: 'instagram',
          followers: 1250,
          engagement: 4.2,
          posts: 45,
          reach: 8500,
          impressions: 12300,
          lastUpdated: new Date(),
        },
        {
          platform: 'facebook',
          followers: 890,
          engagement: 3.8,
          posts: 32,
          reach: 5200,
          impressions: 7800,
          lastUpdated: new Date(),
        }
      ]

      return mockMetrics

    } catch (error) {
      console.error('Error getting social metrics:', error)
      return []
    }
  }
}

// Export singleton instances
export const instagramManager = new InstagramManager()
export const socialShareManager = SocialShareManager
export const ugcManager = UserGeneratedContentManager
export const reviewManager = ProductReviewManager
export const metricsTracker = SocialMetricsTracker

export default {
  InstagramManager,
  SocialShareManager,
  UserGeneratedContentManager,
  ProductReviewManager,
  SocialMetricsTracker,
  instagramManager,
  socialShareManager,
  ugcManager,
  reviewManager,
  metricsTracker,
}