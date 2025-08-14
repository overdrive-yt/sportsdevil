/**
 * Database Migration Utilities
 * Handles migration from SQLite to PostgreSQL for production
 */

import { PrismaClient as SQLitePrisma } from '@prisma/client'
import { PrismaClient as PostgreSQLPrisma } from '@prisma/client'
import { createHash } from 'crypto'

interface MigrationProgress {
  total: number
  completed: number
  current: string
  errors: string[]
}

interface MigrationOptions {
  batchSize?: number
  skipTables?: string[]
  onProgress?: (progress: MigrationProgress) => void
}

export class DatabaseMigration {
  private sourcePrisma: SQLitePrisma
  private targetPrisma: PostgreSQLPrisma
  private progress: MigrationProgress

  constructor(
    private sourceConnectionString: string,
    private targetConnectionString: string
  ) {
    this.sourcePrisma = new SQLitePrisma({
      datasources: {
        db: {
          url: sourceConnectionString
        }
      }
    })
    
    this.targetPrisma = new PostgreSQLPrisma({
      datasources: {
        db: {
          url: targetConnectionString
        }
      }
    })

    this.progress = {
      total: 0,
      completed: 0,
      current: '',
      errors: []
    }
  }

  /**
   * Test database connections
   */
  async testConnections(): Promise<{ source: boolean, target: boolean }> {
    try {
      await this.sourcePrisma.$connect()
      const sourceTest = true
      await this.sourcePrisma.$disconnect()

      await this.targetPrisma.$connect()
      const targetTest = true
      await this.targetPrisma.$disconnect()

      return { source: sourceTest, target: targetTest }
    } catch (error) {
      console.error('Database connection test failed:', error)
      return { source: false, target: false }
    }
  }

  /**
   * Backup SQLite database before migration
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup-${timestamp}.json`
    
    try {
      // Export all data as JSON backup
      const backup = {
        timestamp,
        users: await this.sourcePrisma.user.findMany(),
        products: await this.sourcePrisma.product.findMany(),
        categories: await this.sourcePrisma.category.findMany(),
        productCategories: await this.sourcePrisma.productCategory.findMany(),
        productImages: await this.sourcePrisma.productImage.findMany(),
        orders: await this.sourcePrisma.order.findMany(),
        orderItems: await this.sourcePrisma.orderItem.findMany(),
        coupons: await this.sourcePrisma.coupon.findMany(),
        couponUsage: await this.sourcePrisma.couponUsage.findMany(),
        loyaltyTransactions: await this.sourcePrisma.loyaltyTransaction.findMany(),
        milestoneRewards: await this.sourcePrisma.milestoneReward.findMany(),
        wishlists: await this.sourcePrisma.wishlist.findMany(),
        wishlistItems: await this.sourcePrisma.wishlistItem.findMany(),
      }

      // Save backup to file
      const fs = await import('fs')
      const path = await import('path')
      const backupPath = path.join(process.cwd(), 'backups', backupFile)
      
      // Ensure backups directory exists
      await fs.promises.mkdir(path.dirname(backupPath), { recursive: true })
      
      await fs.promises.writeFile(backupPath, JSON.stringify(backup, null, 2))
      
      console.log(`✅ Database backup created: ${backupPath}`)
      return backupPath
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  /**
   * Migrate users table
   */
  private async migrateUsers(batchSize: number = 100) {
    this.progress.current = 'Migrating users'
    const users = await this.sourcePrisma.user.findMany()
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      
      try {
        await this.targetPrisma.user.createMany({
          data: batch.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            // role: user.role, // Legacy field, not in current schema
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            loyaltyPoints: user.loyaltyPoints,
            totalSpent: user.totalSpent,
            // lastLoginAt: user.lastLoginAt, // Legacy field, not in current schema
          })),
        })
      } catch (error) {
        this.progress.errors.push(`Users batch ${i}: ${error}`)
      }
    }
    
    this.progress.completed++
  }

  /**
   * Migrate categories table
   */
  private async migrateCategories(batchSize: number = 100) {
    this.progress.current = 'Migrating categories'
    const categories = await this.sourcePrisma.category.findMany()
    
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize)
      
      try {
        await this.targetPrisma.category.createMany({
          data: batch.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parentId,
            isActive: category.isActive,
            sortOrder: category.sortOrder,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          })),
        })
      } catch (error) {
        this.progress.errors.push(`Categories batch ${i}: ${error}`)
      }
    }
    
    this.progress.completed++
  }

  /**
   * Migrate products table
   */
  private async migrateProducts(batchSize: number = 50) {
    this.progress.current = 'Migrating products'
    const products = await this.sourcePrisma.product.findMany()
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      try {
        await this.targetPrisma.product.createMany({
          data: batch.map(product => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription,
            sku: product.sku,
            price: product.price,
            originalPrice: product.originalPrice,
            stockQuantity: product.stockQuantity,
            // lowStockAlert: product.lowStockAlert, // Legacy field
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            isNew: product.isNew,
            weight: product.weight,
            dimensions: product.dimensions,
            tags: product.tags,
            // firstStockDate: product.firstStockDate, // Legacy field
            // secondStockDate: product.secondStockDate, // Legacy field
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          })),
        })
      } catch (error) {
        this.progress.errors.push(`Products batch ${i}: ${error}`)
      }
    }
    
    this.progress.completed++
  }

  /**
   * Perform complete migration
   */
  async migrate(options: MigrationOptions = {}): Promise<MigrationProgress> {
    const { batchSize = 100, skipTables = [], onProgress } = options
    
    try {
      // Test connections first
      const connections = await this.testConnections()
      if (!connections.source || !connections.target) {
        throw new Error('Database connection test failed')
      }

      // Create backup
      await this.createBackup()

      // Define migration tasks
      const tasks = [
        { name: 'users', fn: () => this.migrateUsers(batchSize) },
        { name: 'categories', fn: () => this.migrateCategories(batchSize) },
        { name: 'products', fn: () => this.migrateProducts(batchSize) },
        // Add more migration tasks as needed
      ]

      this.progress.total = tasks.filter(task => !skipTables.includes(task.name)).length
      this.progress.completed = 0
      this.progress.errors = []

      // Execute migrations
      for (const task of tasks) {
        if (skipTables.includes(task.name)) {
          continue
        }

        try {
          await task.fn()
          if (onProgress) {
            onProgress(this.progress)
          }
        } catch (error) {
          this.progress.errors.push(`${task.name}: ${error}`)
          console.error(`Migration failed for ${task.name}:`, error)
        }
      }

      console.log(`✅ Migration completed: ${this.progress.completed}/${this.progress.total} tasks`)
      if (this.progress.errors.length > 0) {
        console.warn(`⚠️ Migration completed with ${this.progress.errors.length} errors:`)
        this.progress.errors.forEach(error => console.warn(`  - ${error}`))
      }

      return this.progress
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    } finally {
      await this.sourcePrisma.$disconnect()
      await this.targetPrisma.$disconnect()
    }
  }

  /**
   * Verify migration integrity
   */
  async verifyMigration(): Promise<{
    success: boolean
    differences: Record<string, { source: number, target: number }>
  }> {
    try {
      const verification = {
        users: {
          source: await this.sourcePrisma.user.count(),
          target: await this.targetPrisma.user.count(),
        },
        products: {
          source: await this.sourcePrisma.product.count(),
          target: await this.targetPrisma.product.count(),
        },
        categories: {
          source: await this.sourcePrisma.category.count(),
          target: await this.targetPrisma.category.count(),
        },
      }

      const differences = Object.entries(verification)
        .filter(([_, counts]) => counts.source !== counts.target)
        .reduce((acc, [table, counts]) => {
          acc[table] = counts
          return acc
        }, {} as Record<string, { source: number, target: number }>)

      return {
        success: Object.keys(differences).length === 0,
        differences
      }
    } catch (error) {
      console.error('Verification failed:', error)
      return { success: false, differences: {} }
    }
  }
}

/**
 * Environment configuration for database migration
 */
export function createMigrationConfig() {
  const sourceDb = process.env.DATABASE_URL || 'file:./dev.db'
  const targetDb = process.env.POSTGRES_URL || process.env.DATABASE_URL_POSTGRES
  
  if (!targetDb) {
    throw new Error('PostgreSQL connection string required (POSTGRES_URL or DATABASE_URL_POSTGRES)')
  }

  return {
    source: sourceDb,
    target: targetDb,
  }
}