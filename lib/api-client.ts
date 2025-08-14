interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  details?: any
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Products
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    featured?: boolean
    new?: boolean
    inStock?: boolean
    sort?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request(`/api/products?${searchParams.toString()}`)
  }

  async getProduct(slug: string) {
    return this.request(`/api/products/${slug}`)
  }


  async getNewProducts(limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.request(`/api/products/new${params}`)
  }

  async searchProducts(query: string, params?: {
    page?: number
    limit?: number
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    sort?: string
  }) {
    const searchParams = new URLSearchParams({ q: query })
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    return this.request(`/api/products/search?${searchParams.toString()}`)
  }

  // Categories
  async getCategories(includeInactive = false, hierarchy = false) {
    const params = new URLSearchParams()
    if (includeInactive) params.append('includeInactive', 'true')
    if (hierarchy) params.append('hierarchy', 'true')
    
    return this.request(`/api/categories?${params.toString()}`)
  }

  async getCategory(slug: string, includeProducts = false) {
    const params = includeProducts ? '?includeProducts=true' : ''
    return this.request(`/api/categories/${slug}${params}`)
  }

  // Search
  async globalSearch(query: string, type: 'all' | 'products' | 'categories' = 'all', limit?: number) {
    const params = new URLSearchParams({ q: query, type })
    if (limit) params.append('limit', limit.toString())
    
    return this.request(`/api/search?${params.toString()}`)
  }

  async getSearchSuggestions(query: string, limit?: number) {
    const params = new URLSearchParams({ q: query })
    if (limit) params.append('limit', limit.toString())
    
    return this.request(`/api/search/suggestions?${params.toString()}`)
  }

  async getFilters(categoryId?: string) {
    const params = categoryId ? `?categoryId=${categoryId}` : ''
    return this.request(`/api/filters${params}`)
  }

  // Cart (requires authentication)
  async getCart() {
    return this.request('/api/cart')
  }

  async getCartSummary() {
    return this.request('/api/cart/summary')
  }

  async addToCart(item: {
    productId: string
    quantity: number
    selectedColor?: string
    selectedSize?: string
  }) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeCartItem(itemId: string) {
    return this.request(`/api/cart/${itemId}`, {
      method: 'DELETE',
    })
  }

  async clearCart() {
    return this.request('/api/cart', {
      method: 'DELETE',
    })
  }

  async mergeCart(guestCartItems: any[]) {
    return this.request('/api/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestCartItems }),
    })
  }

  // User Profile (requires authentication)
  async getUserProfile() {
    return this.request('/api/user/profile')
  }

  async updateUserProfile(updates: {
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    return this.request('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserOrders(page = 1, limit = 10) {
    return this.request(`/api/user/orders?page=${page}&limit=${limit}`)
  }

  async getUserOrder(orderId: string) {
    return this.request(`/api/user/orders/${orderId}`)
  }

  // Orders (requires authentication)
  async createOrder(orderData: {
    shippingAddress: any
    billingAddress: any
    paymentMethod: string
    notes?: string
  }) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getOrder(orderId: string) {
    return this.request(`/api/orders/${orderId}`)
  }

  async cancelOrder(orderId: string, reason?: string) {
    return this.request(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Auth
  async register(userData: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }
}

export const apiClient = new ApiClient()
export type { ApiResponse }