// V9.11.5 Phase 3: Xepos POS System Integration
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface XeposConfig {
  storeId: string
  apiEndpoint: string
  username: string
  password: string
  environment: 'production' | 'sandbox'
  accessToken?: string
  sessionId?: string
}

export interface XeposProduct {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  cost: number
  stock_quantity: number
  category_id: string
  description?: string
  status: 'active' | 'inactive'
  supplier_id?: string
  tax_rate: number
  created_at: string
  updated_at: string
}

export interface XeposSale {
  id: string
  sale_number: string
  customer_id?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  staff_id: string
  staff_name: string
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  subtotal: number
  tax_total: number
  discount_total: number
  total: number
  payment_method: string
  items: Array<{
    product_id: string
    sku: string
    name: string
    quantity: number
    price: number
    discount: number
  }>
  created_at: string
  updated_at: string
}

export interface XeposCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  total_spent: number
  visit_count: number
  created_at: string
  updated_at: string
}

export interface XeposInventoryItem {
  product_id: string
  sku: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_level: number
  reorder_quantity: number
  location: string
  last_updated: string
}

// Xepos API Service
export class XeposService {
  private config: XeposConfig
  private baseUrl: string

  constructor(config: XeposConfig) {
    this.config = config
    this.baseUrl = config.apiEndpoint.replace(/\/$/, '') // Remove trailing slash
  }

  // Authentication Methods
  async authenticate(): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const authData = {
        username: this.config.username,
        password: this.config.password,
        store_id: this.config.storeId
      }

      const response = await this.makeApiCall('POST', '/auth/login', authData)
      
      if (response.success) {
        this.config.sessionId = response.session_id
        this.config.accessToken = response.access_token
        
        return {
          success: true,
          sessionId: response.session_id
        }
      } else {
        return {
          success: false,
          error: response.error || 'Authentication failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Xepos authentication failed: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  async logout(): Promise<void> {
    if (this.config.sessionId) {
      await this.makeApiCall('POST', '/auth/logout', {})
      this.config.sessionId = undefined
      this.config.accessToken = undefined
    }
  }

  // Product Management Methods
  async getProducts(limit = 100, offset = 0): Promise<XeposProduct[]> {
    const response = await this.makeApiCall('GET', `/products?limit=${limit}&offset=${offset}`)
    return response.products || []
  }

  async getProduct(productId: string): Promise<XeposProduct | null> {
    const response = await this.makeApiCall('GET', `/products/${productId}`)
    return response.product || null
  }

  async createProduct(productData: Partial<XeposProduct>): Promise<XeposProduct> {
    const response = await this.makeApiCall('POST', '/products', productData)
    return response.product
  }

  async updateProduct(productId: string, updates: Partial<XeposProduct>): Promise<XeposProduct> {
    const response = await this.makeApiCall('PUT', `/products/${productId}`, updates)
    return response.product
  }

  async syncProductToXepos(localProduct: any): Promise<XeposProduct> {
    const xeposProduct: Partial<XeposProduct> = {
      name: localProduct.name,
      sku: localProduct.sku,
      price: Number(localProduct.price),
      stock_quantity: localProduct.stockQuantity,
      description: localProduct.description,
      status: localProduct.isActive ? 'active' : 'inactive',
      category_id: this.mapCategoryToXepos(localProduct.productCategories?.[0]?.category?.name),
      tax_rate: 0.20 // 20% VAT for UK
    }

    // Check if product already exists in Xepos
    const existingProducts = await this.getProducts()
    const existingProduct = existingProducts.find(p => p.sku === localProduct.sku)

    if (existingProduct) {
      return await this.updateProduct(existingProduct.id, xeposProduct)
    } else {
      return await this.createProduct(xeposProduct)
    }
  }

  // Inventory Management Methods
  async getInventory(): Promise<XeposInventoryItem[]> {
    const response = await this.makeApiCall('GET', '/inventory')
    return response.inventory || []
  }

  async updateStock(productId: string, quantity: number, location = 'main'): Promise<void> {
    await this.makeApiCall('PUT', `/inventory/${productId}`, {
      quantity,
      location,
      reason: 'Online sync adjustment'
    })
  }

  async getStockLevels(): Promise<Array<{productId: string, stock: number}>> {
    const inventory = await this.getInventory()
    return inventory.map(item => ({
      productId: item.product_id,
      stock: item.available_stock
    }))
  }

  async syncInventoryFromXepos(): Promise<Array<{productId: string, xeposStock: number, localStock: number}>> {
    const inventory = await this.getInventory()
    const syncResults = []

    for (const item of inventory) {
      // Find local product mapping
      const productMapping = await prisma.productMapping.findFirst({
        where: {
          externalId: item.product_id,
          platform: { platform: 'XEPOS' }
        },
        include: { product: true }
      })

      if (productMapping) {
        const currentLocalStock = productMapping.product.stockQuantity
        
        // Update local stock if different
        if (currentLocalStock !== item.available_stock) {
          await prisma.product.update({
            where: { id: productMapping.productId },
            data: { stockQuantity: item.available_stock }
          })
        }

        syncResults.push({
          productId: productMapping.productId,
          xeposStock: item.available_stock,
          localStock: currentLocalStock
        })
      }
    }

    return syncResults
  }

  // Sales/Order Management Methods
  async getSales(since?: Date, limit = 100): Promise<XeposSale[]> {
    let endpoint = `/sales?limit=${limit}`
    if (since) {
      endpoint += `&since=${since.toISOString()}`
    }
    
    const response = await this.makeApiCall('GET', endpoint)
    return response.sales || []
  }

  async getSale(saleId: string): Promise<XeposSale | null> {
    const response = await this.makeApiCall('GET', `/sales/${saleId}`)
    return response.sale || null
  }

  async syncSalesFromXepos(since?: Date): Promise<XeposSale[]> {
    const sales = await this.getSales(since)
    const newSales = []

    for (const sale of sales) {
      // Check if sale already exists in our system
      const existingMapping = await prisma.orderMapping.findFirst({
        where: {
          externalId: sale.id,
          platform: { platform: 'XEPOS' }
        }
      })

      if (!existingMapping) {
        await this.createLocalOrderFromXeposSale(sale)
        newSales.push(sale)
      }
    }

    return newSales
  }

  // Customer Management Methods
  async getCustomers(limit = 100, offset = 0): Promise<XeposCustomer[]> {
    const response = await this.makeApiCall('GET', `/customers?limit=${limit}&offset=${offset}`)
    return response.customers || []
  }

  async getCustomer(customerId: string): Promise<XeposCustomer | null> {
    const response = await this.makeApiCall('GET', `/customers/${customerId}`)
    return response.customer || null
  }

  async syncCustomerToXepos(localUser: any): Promise<XeposCustomer> {
    const xeposCustomer = {
      name: localUser.name,
      email: localUser.email,
      phone: localUser.phone,
      address: localUser.address,
      city: localUser.city,
      postal_code: localUser.postalCode,
      country: localUser.country || 'UK'
    }

    const response = await this.makeApiCall('POST', '/customers', xeposCustomer)
    return response.customer
  }

  async syncCustomersFromXepos(): Promise<XeposCustomer[]> {
    const customers = await this.getCustomers()
    const newCustomers = []

    for (const customer of customers) {
      // Check if customer already exists locally
      const existingUser = await prisma.user.findUnique({
        where: { email: customer.email }
      })

      if (!existingUser && customer.email) {
        await prisma.user.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            postalCode: customer.postal_code,
            country: customer.country || 'UK',
            totalSpent: customer.total_spent
          }
        })
        newCustomers.push(customer)
      }
    }

    return newCustomers
  }

  // Staff and Store Management
  async getStaffMembers(): Promise<Array<{id: string, name: string, role: string, active: boolean}>> {
    const response = await this.makeApiCall('GET', '/staff')
    return response.staff || []
  }

  async getStoreStatus(): Promise<{
    is_open: boolean
    current_shift: string
    total_sales_today: number
    transaction_count_today: number
    cash_in_drawer: number
  }> {
    const response = await this.makeApiCall('GET', '/store/status')
    return response.status
  }

  async getCashFlowData(period = 'today'): Promise<{
    total_sales: number
    cash_sales: number
    card_sales: number
    refunds: number
    net_total: number
  }> {
    const response = await this.makeApiCall('GET', `/reports/cashflow?period=${period}`)
    return response.cashflow
  }

  // Helper Methods
  private async makeApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}/api/v1${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'W3SportsDevil-Integration/1.0'
    }

    if (this.config.sessionId) {
      headers['X-Session-Id'] = this.config.sessionId
    }

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`
    }

    // Mock API response for development
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return this.generateMockResponse(endpoint, method, data)
  }

  private async createLocalOrderFromXeposSale(sale: XeposSale): Promise<void> {
    // Create or get customer
    let user
    if (sale.customer_email) {
      user = await prisma.user.upsert({
        where: { email: sale.customer_email },
        update: {},
        create: {
          email: sale.customer_email,
          name: sale.customer_name || 'POS Customer',
          phone: sale.customer_phone
        }
      })
    } else {
      // Use a generic POS customer
      user = await prisma.user.upsert({
        where: { email: 'pos-customer@w3sportsdevil.com' },
        update: {},
        create: {
          email: 'pos-customer@w3sportsdevil.com',
          name: 'POS Customer'
        }
      })
    }

    // Create local order
    const order = await prisma.order.create({
      data: {
        orderNumber: `POS-${sale.sale_number}`,
        status: this.mapXeposOrderStatus(sale.status),
        totalAmount: sale.total,
        subtotalAmount: sale.subtotal,
        taxAmount: sale.tax_total,
        shippingAmount: 0,
        discountAmount: sale.discount_total,
        userId: user.id,
        shippingName: user.name || 'POS Customer',
        shippingEmail: user.email,
        shippingPhone: user.phone || '',
        shippingAddress: '309 Kingstanding Rd', // Store address
        shippingCity: 'Birmingham',
        shippingPostal: 'B44 9TH',
        shippingCountry: 'UK',
        billingName: user.name || 'POS Customer',
        billingEmail: user.email,
        billingPhone: user.phone || '',
        billingAddress: '309 Kingstanding Rd',
        billingCity: 'Birmingham',
        billingPostal: 'B44 9TH',
        billingCountry: 'UK',
        paymentMethod: sale.payment_method,
        paymentStatus: 'COMPLETED'
      }
    })

    // Create order items
    for (const item of sale.items) {
      // Find local product by SKU
      const product = await prisma.product.findUnique({
        where: { sku: item.sku }
      })

      if (product) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            price: item.price
          }
        })
      }
    }

    // Create order mapping
    const integration = await prisma.platformIntegration.findFirst({
      where: { platform: 'XEPOS' }
    })

    if (integration) {
      await prisma.orderMapping.create({
        data: {
          orderId: order.id,
          platformId: integration.id,
          externalId: sale.id,
          externalNumber: sale.sale_number,
          status: 'SYNCED',
          lastSync: new Date(),
          metadata: JSON.stringify(sale)
        }
      })
    }
  }

  private mapCategoryToXepos(categoryName?: string): string {
    const categoryMap: Record<string, string> = {
      'Cricket Bats': 'cricket-bats',
      'Protection': 'cricket-protection',
      'Wicket Keeping': 'cricket-keeping',
      'Accessories': 'cricket-accessories'
    }
    return categoryName ? (categoryMap[categoryName] || 'cricket-other') : 'cricket-other'
  }

  private mapXeposOrderStatus(xeposStatus: string): any {
    const statusMap: Record<string, any> = {
      'completed': 'DELIVERED',
      'pending': 'PENDING',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED'
    }
    return statusMap[xeposStatus] || 'PENDING'
  }

  private generateMockResponse(endpoint: string, method: string, data?: any): any {
    if (endpoint.includes('/auth/login')) {
      return {
        success: true,
        session_id: `xepos_session_${crypto.randomBytes(8).toString('hex')}`,
        access_token: `xepos_token_${crypto.randomBytes(16).toString('hex')}`
      }
    }

    if (endpoint.includes('/products')) {
      if (method === 'GET' && !endpoint.includes('?')) {
        // Single product
        return {
          product: {
            id: `xepos_prod_${crypto.randomBytes(4).toString('hex')}`,
            name: 'Professional Cricket Bat',
            sku: 'BAT-PROF-001',
            price: 89.99,
            stock_quantity: 15,
            status: 'active'
          }
        }
      }
      if (method === 'GET') {
        // Products list
        return {
          products: [
            {
              id: 'xepos_prod_001',
              name: 'Professional Cricket Bat',
              sku: 'BAT-PROF-001',
              price: 89.99,
              stock_quantity: 15,
              status: 'active'
            },
            {
              id: 'xepos_prod_002',
              name: 'Cricket Helmet',
              sku: 'HELM-PROT-001',
              price: 45.99,
              stock_quantity: 8,
              status: 'active'
            }
          ]
        }
      }
      if (method === 'POST' || method === 'PUT') {
        return {
          product: {
            id: `xepos_prod_${crypto.randomBytes(4).toString('hex')}`,
            ...data
          }
        }
      }
    }

    if (endpoint.includes('/inventory')) {
      return {
        inventory: [
          {
            product_id: 'xepos_prod_001',
            sku: 'BAT-PROF-001',
            current_stock: 15,
            available_stock: 12,
            reorder_level: 5
          }
        ]
      }
    }

    if (endpoint.includes('/sales')) {
      return {
        sales: [
          {
            id: 'xepos_sale_001',
            sale_number: 'S2024001',
            customer_name: 'John Cricket',
            customer_email: 'john@cricket.com',
            staff_name: 'Store Manager',
            status: 'completed',
            subtotal: 89.99,
            tax_total: 18.00,
            total: 107.99,
            payment_method: 'card',
            items: [
              {
                product_id: 'xepos_prod_001',
                sku: 'BAT-PROF-001',
                name: 'Professional Cricket Bat',
                quantity: 1,
                price: 89.99
              }
            ],
            created_at: new Date().toISOString()
          }
        ]
      }
    }

    if (endpoint.includes('/customers')) {
      return {
        customers: [
          {
            id: 'xepos_cust_001',
            name: 'John Cricket',
            email: 'john@cricket.com',
            phone: '+44 7700 900001',
            total_spent: 450.99,
            visit_count: 5
          }
        ]
      }
    }

    if (endpoint.includes('/store/status')) {
      return {
        status: {
          is_open: true,
          current_shift: 'day',
          total_sales_today: 1250.99,
          transaction_count_today: 15,
          cash_in_drawer: 350.00
        }
      }
    }

    return { success: true }
  }
}

// Xepos Integration Manager
export class XeposIntegration {
  private service: XeposService
  private platformId: string

  constructor(config: XeposConfig, platformId: string) {
    this.service = new XeposService(config)
    this.platformId = platformId
  }

  async initialize(): Promise<void> {
    // Authenticate with Xepos
    const authResult = await this.service.authenticate()
    if (!authResult.success) {
      throw new Error(`Xepos authentication failed: ${authResult.error}`)
    }

    // Update platform integration status
    await prisma.platformIntegration.update({
      where: { id: this.platformId },
      data: {
        syncStatus: 'SUCCESS',
        lastSync: new Date(),
        errorCount: 0
      }
    })
  }

  async syncAllProducts(): Promise<void> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        productCategories: {
          include: { category: true }
        }
      }
    })

    let synced = 0
    let failed = 0

    for (const product of products) {
      try {
        const xeposProduct = await this.service.syncProductToXepos(product)
        
        // Create or update product mapping
        await prisma.productMapping.upsert({
          where: {
            productId_platformId: {
              productId: product.id,
              platformId: this.platformId
            }
          },
          update: {
            externalId: xeposProduct.id,
            externalSku: xeposProduct.sku,
            status: 'ACTIVE',
            lastSync: new Date()
          },
          create: {
            productId: product.id,
            platformId: this.platformId,
            externalId: xeposProduct.id,
            externalSku: xeposProduct.sku,
            status: 'ACTIVE',
            syncDirection: 'BIDIRECTIONAL',
            lastSync: new Date()
          }
        })

        synced++
      } catch (error) {
        failed++
        console.error(`Failed to sync product ${product.name}:`, error)
      }
    }

    await this.logSyncResult('PRODUCT_SYNC', { success: failed === 0, synced, failed })
  }

  async syncInventoryFromXepos(): Promise<void> {
    const syncResults = await this.service.syncInventoryFromXepos()
    
    await this.logSyncResult('INVENTORY_SYNC', { 
      success: true, 
      synced: syncResults.length, 
      failed: 0 
    })
  }

  async syncSalesFromXepos(): Promise<void> {
    const lastSync = await this.getLastSalesSync()
    const newSales = await this.service.syncSalesFromXepos(lastSync)

    await this.logSyncResult('ORDER_SYNC', { 
      success: true, 
      synced: newSales.length, 
      failed: 0 
    })
  }

  async syncCustomersFromXepos(): Promise<void> {
    const newCustomers = await this.service.syncCustomersFromXepos()

    await this.logSyncResult('CUSTOMER_SYNC', { 
      success: true, 
      synced: newCustomers.length, 
      failed: 0 
    })
  }

  private async getLastSalesSync(): Promise<Date> {
    const lastLog = await prisma.syncLog.findFirst({
      where: {
        platformId: this.platformId,
        operation: 'ORDER_SYNC',
        status: 'SUCCESS'
      },
      orderBy: { createdAt: 'desc' }
    })

    return lastLog?.createdAt || new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
  }

  private async logSyncResult(operation: string, result: any): Promise<void> {
    await prisma.syncLog.create({
      data: {
        platformId: this.platformId,
        operation: operation as any,
        direction: 'BIDIRECTIONAL',
        status: result.success ? 'SUCCESS' : 'FAILED',
        recordsProcessed: result.synced || 0,
        recordsFailed: result.failed || 0,
        duration: 0
      }
    })
  }
}