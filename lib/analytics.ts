// Simple analytics tracking utility
// This would be replaced with Google Analytics, Mixpanel, or similar in production

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
}

interface PageViewEvent {
  page: string
  title: string
  referrer?: string
  userId?: string
  sessionId?: string
}

interface EcommerceEvent {
  event: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout'
  currency: string
  value: number
  items: {
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }[]
  transaction_id?: string
}

class Analytics {
  private isEnabled: boolean
  private sessionId: string

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Track page views
  trackPageView(data: PageViewEvent) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', 'Page View', data)
      return
    }

    // In production, this would send to your analytics service
    this.sendEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      properties: {
        ...data,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }
    })
  }

  // Track custom events
  trackEvent(data: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', data.event, data)
      return
    }

    this.sendEvent({
      ...data,
      properties: {
        ...data.properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }
    })
  }

  // Track ecommerce events
  trackEcommerce(data: EcommerceEvent) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', 'Ecommerce', data.event, data)
      return
    }

    this.sendEvent({
      event: data.event,
      category: 'ecommerce',
      action: data.event,
      value: data.value,
      properties: {
        ...data,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }
    })
  }

  // Track product views
  trackProductView(product: {
    id: string
    name: string
    category: string
    price: number
    sku?: string
  }) {
    this.trackEcommerce({
      event: 'view_item',
      currency: 'GBP',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: 1,
        price: product.price,
      }]
    })

    this.trackEvent({
      event: 'product_view',
      category: 'products',
      action: 'view',
      label: product.name,
      value: product.price,
      properties: {
        productId: product.id,
        productSku: product.sku,
        productCategory: product.category,
      }
    })
  }

  // Track add to cart
  trackAddToCart(product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }) {
    this.trackEcommerce({
      event: 'add_to_cart',
      currency: 'GBP',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
      }]
    })
  }

  // Track search
  trackSearch(searchTerm: string, resultsCount: number) {
    this.trackEvent({
      event: 'search',
      category: 'search',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
      properties: {
        searchTerm,
        resultsCount,
      }
    })
  }

  // Track user registration
  trackRegistration(method: string = 'email') {
    this.trackEvent({
      event: 'sign_up',
      category: 'user',
      action: 'register',
      label: method,
      properties: {
        method,
      }
    })
  }

  // Track user login
  trackLogin(method: string = 'email') {
    this.trackEvent({
      event: 'login',
      category: 'user',
      action: 'login',
      label: method,
      properties: {
        method,
      }
    })
  }

  // Track purchases
  trackPurchase(order: {
    id: string
    value: number
    currency: string
    items: {
      id: string
      name: string
      category: string
      quantity: number
      price: number
    }[]
  }) {
    this.trackEcommerce({
      event: 'purchase',
      currency: order.currency,
      value: order.value,
      transaction_id: order.id,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
      }))
    })
  }

  private async sendEvent(data: any) {
    try {
      // In production, send to your analytics service
      // For now, we'll just log and optionally send to a local endpoint
      
      if (typeof window !== 'undefined') {
        // Could send to Google Analytics, Mixpanel, etc.
        // gtag('event', data.event, { ... })
        
        // Or send to your own analytics endpoint
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).catch(error => {
          console.warn('Analytics tracking failed:', error)
        })
      }
    } catch (error) {
      console.warn('Analytics error:', error)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Helper hooks for React components
export function usePageView(page: string, title: string) {
  if (typeof window !== 'undefined') {
    analytics.trackPageView({
      page,
      title,
      referrer: document.referrer,
    })
  }
}

export function useProductView(product: {
  id: string
  name: string
  category: string
  price: number
  sku?: string
}) {
  if (typeof window !== 'undefined') {
    analytics.trackProductView(product)
  }
}