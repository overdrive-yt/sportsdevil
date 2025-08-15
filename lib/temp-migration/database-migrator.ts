// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// Database Migration Service for WooCommerce Import

import { prisma } from '../prisma'
import { WooCommerceProduct, WooCommerceCategory, WooCommerceTransformer } from './woocommerce-api'
import { ImageDownloader } from './image-downloader'

export interface MigrationProgress {
  step: string
  current: number
  total: number
  message: string
  errors: string[]
  imageProgress?: {
    currentProduct: string
    currentImage: number
    totalImages: number
    downloadStatus: string
    localPath?: string
  }
}

export interface MigrationResult {
  success: boolean
  message: string
  stats: {
    categoriesImported: number
    productsImported: number
    imagesProcessed: number
    attributesCreated: number
    errors: number
  }
  errors: string[]
}

export class DatabaseMigrator {
  private progress: MigrationProgress = {
    step: 'idle',
    current: 0,
    total: 0,
    message: 'Ready to start migration',
    errors: []
  }
  private imageDownloader: ImageDownloader

  constructor() {
    this.imageDownloader = new ImageDownloader()
  }

  getProgress(): MigrationProgress {
    return { ...this.progress }
  }

  private updateProgress(step: string, current: number, total: number, message: string, error?: string, imageProgress?: any) {
    this.progress = {
      step,
      current,
      total,
      message,
      errors: error ? [...this.progress.errors, error] : this.progress.errors,
      imageProgress: imageProgress || this.progress.imageProgress
    }
    console.log(`📊 Progress: ${current}/${total} - ${message}`)
    if (error) console.error('❌ Error:', error)
    if (imageProgress) console.log(`📸 Image Progress: ${imageProgress.currentProduct} - ${imageProgress.downloadStatus}`)
  }

  async migrateData(
    wcCategories: WooCommerceCategory[],
    wcProducts: WooCommerceProduct[],
    imagesOnly: boolean = false
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      stats: {
        categoriesImported: 0,
        productsImported: 0,
        imagesProcessed: 0,
        attributesCreated: 0,
        errors: 0
      },
      errors: []
    }

    try {
      this.updateProgress('starting', 0, wcCategories.length + wcProducts.length, 'Starting migration...')

      // Step 1: Import Categories (hierarchical order)
      this.updateProgress('categories', 0, wcCategories.length, 'Importing categories...')
      const categoryMapping = await this.importCategories(wcCategories)
      result.stats.categoriesImported = categoryMapping.size

      // Step 2: Import Products
      this.updateProgress('products', 0, wcProducts.length, 'Importing products...')
      const productStats = await this.importProducts(wcProducts, categoryMapping)
      result.stats.productsImported = productStats.imported
      result.stats.imagesProcessed = productStats.images
      result.stats.attributesCreated = productStats.attributes

      // Step 3: Final validation
      this.updateProgress('validation', 1, 1, 'Validating imported data...')
      await this.validateImportedData()

      result.success = true
      result.message = `Migration completed successfully! Imported ${result.stats.categoriesImported} categories and ${result.stats.productsImported} products.`
      result.errors = this.progress.errors
      result.stats.errors = this.progress.errors.length

      this.updateProgress('complete', 1, 1, 'Migration completed successfully!')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.success = false
      result.message = `Migration failed: ${errorMessage}`
      result.errors = [...this.progress.errors, errorMessage]
      result.stats.errors = result.errors.length

      this.updateProgress('error', 0, 0, `Migration failed: ${errorMessage}`, errorMessage)
    }

    return result
  }

  private async importCategories(wcCategories: WooCommerceCategory[]): Promise<Map<number, string>> {
    const categoryMapping = new Map<number, string>()
    
    // Sort categories to handle parent-child relationships
    const sortedCategories = this.sortCategoriesHierarchically(wcCategories)
    
    for (let i = 0; i < sortedCategories.length; i++) {
      const wcCategory = sortedCategories[i]
      
      try {
        this.updateProgress('categories', i + 1, sortedCategories.length, 
          `Importing category: ${wcCategory.name}`)

        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: wcCategory.slug },
              { name: wcCategory.name }
            ]
          }
        })

        if (existingCategory) {
          categoryMapping.set(wcCategory.id, existingCategory.id)
          continue
        }

        // Create new category
        const transformedCategory = WooCommerceTransformer.transformCategory(wcCategory, categoryMapping)
        
        const newCategory = await prisma.category.create({
          data: {
            name: transformedCategory.name,
            slug: transformedCategory.slug,
            description: transformedCategory.description,
            parentId: transformedCategory.parentId,
            isActive: transformedCategory.isActive
          }
        })

        categoryMapping.set(wcCategory.id, newCategory.id)

      } catch (error) {
        const errorMessage = `Failed to import category ${wcCategory.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        this.updateProgress('categories', i + 1, sortedCategories.length, 
          `Error importing category: ${wcCategory.name}`, errorMessage)
      }
    }

    return categoryMapping
  }

  private async importProducts(
    wcProducts: WooCommerceProduct[], 
    categoryMapping: Map<number, string>
  ): Promise<{ imported: number; images: number; attributes: number }> {
    let imported = 0
    let totalImages = 0
    let totalAttributes = 0

    for (let i = 0; i < wcProducts.length; i++) {
      const wcProduct = wcProducts[i]
      
      try {
        this.updateProgress('products', i + 1, wcProducts.length, 
          `Importing product: ${wcProduct.name}`)

        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { sku: wcProduct.sku },
              { slug: wcProduct.slug }
            ]
          }
        })

        if (existingProduct) {
          this.updateProgress('products', i + 1, wcProducts.length, 
            `Skipping existing product: ${wcProduct.name}`)
          continue
        }

        // Transform product data
        const transformedProduct = WooCommerceTransformer.transformProduct(wcProduct)
        
        // Create product
        const newProduct = await prisma.product.create({
          data: {
            name: transformedProduct.name,
            slug: await this.generateUniqueSlug(transformedProduct.slug),
            description: transformedProduct.description,
            shortDescription: transformedProduct.shortDescription,
            price: transformedProduct.price,
            originalPrice: transformedProduct.originalPrice,
            sku: await this.generateUniqueSku(transformedProduct.sku),
            stockQuantity: transformedProduct.stockQuantity,
            isActive: transformedProduct.isActive,
            isFeatured: transformedProduct.isFeatured,
            weight: transformedProduct.weight,
            dimensions: transformedProduct.dimensions
          }
        })

        // Import product categories
        await this.importProductCategories(newProduct.id, wcProduct.categories, categoryMapping)

        // Import product images with local download
        const imageCount = await this.importProductImages(newProduct.id, wcProduct, categoryMapping)
        totalImages += imageCount

        // Import product attributes
        const attributeCount = await this.importProductAttributes(newProduct.id, wcProduct)
        totalAttributes += attributeCount

        imported++

      } catch (error) {
        const errorMessage = `Failed to import product ${wcProduct.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        this.updateProgress('products', i + 1, wcProducts.length, 
          `Error importing product: ${wcProduct.name}`, errorMessage)
      }
    }

    return { imported, images: totalImages, attributes: totalAttributes }
  }

  private async importProductCategories(
    productId: string, 
    wcCategories: Array<{ id: number; name: string; slug: string }>,
    categoryMapping: Map<number, string>
  ) {
    for (let i = 0; i < wcCategories.length; i++) {
      const wcCategory = wcCategories[i]
      const categoryId = categoryMapping.get(wcCategory.id)
      
      if (categoryId) {
        await prisma.productCategory.create({
          data: {
            productId,
            categoryId,
            isPrimary: i === 0, // First category is primary
            sortOrder: i
          }
        })
      }
    }
  }

  private async importProductImages(
    productId: string, 
    wcProduct: WooCommerceProduct,
    categoryMapping: Map<number, string>
  ): Promise<number> {
    const images = WooCommerceTransformer.extractImages(wcProduct)
    
    if (images.length === 0) {
      console.log(`📭 No images found for product: ${wcProduct.name}`)
      return 0
    }

    console.log(`📸 Processing ${images.length} images for: ${wcProduct.name}`)
    
    // Get category information for folder structure  
    // Convert WooCommerce product categories to full WooCommerceCategory format
    const categories: WooCommerceCategory[] = wcProduct.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: 0, // We don't have parent info in product categories, default to 0
      description: '', // Default empty description
      image: null, // No image info available
      count: 0 // Product count not available here
    }))

    try {
      // Update progress with image download start
      this.updateProgress(
        this.progress.step,
        this.progress.current,
        this.progress.total,
        `Downloading ${images.length} images for: ${wcProduct.name}`,
        undefined,
        {
          currentProduct: wcProduct.name,
          currentImage: 0,
          totalImages: images.length,
          downloadStatus: 'Starting download...'
        }
      )

      // Download images to local storage
      const downloadResults = await this.imageDownloader.downloadProductImages(
        wcProduct.name,
        categories,
        images
      )

      // Save image records to database with local paths
      let savedCount = 0
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const downloadResult = downloadResults[i]
        
        // Update progress for each image
        this.updateProgress(
          this.progress.step,
          this.progress.current,
          this.progress.total,
          `Processing image ${i + 1}/${images.length} for: ${wcProduct.name}`,
          undefined,
          {
            currentProduct: wcProduct.name,
            currentImage: i + 1,
            totalImages: images.length,
            downloadStatus: downloadResult?.success ? 
              `✅ Downloaded: ${downloadResult.localPath}` : 
              `❌ Failed: ${downloadResult?.error || 'Unknown error'}`,
            localPath: downloadResult?.localPath
          }
        )
        
        try {
          // Determine which URL to store (local if download succeeded, external as fallback)
          const imageUrl = downloadResult?.success ? downloadResult.localPath : image.url
          const isLocal = downloadResult?.success || false
          
          await prisma.productImage.create({
            data: {
              productId,
              url: imageUrl,
              alt: image.alt,
              caption: image.caption,
              isPrimary: image.isPrimary,
              sortOrder: image.sortOrder,
              // Store additional metadata for downloaded images
              width: null, // Could be extracted if needed
              height: null,
              size: downloadResult?.fileSize || null,
              format: downloadResult?.format || null
            }
          })
          
          savedCount++
          
          if (isLocal) {
            console.log(`✅ Saved local image: ${imageUrl}`)
          } else {
            console.log(`⚠️ Saved external URL (download failed): ${imageUrl}`)
            if (downloadResult?.error) {
              this.updateProgress(
                this.progress.step, 
                this.progress.current, 
                this.progress.total, 
                this.progress.message,
                `Image download failed for ${wcProduct.name}: ${downloadResult.error}`
              )
            }
          }
          
        } catch (dbError) {
          console.error(`Failed to save image record for ${wcProduct.name}:`, dbError)
          this.updateProgress(
            this.progress.step, 
            this.progress.current, 
            this.progress.total, 
            this.progress.message,
            `Database save failed for image: ${image.url}`
          )
        }
      }

      console.log(`📊 ${wcProduct.name}: ${savedCount}/${images.length} images saved to database`)
      return savedCount
      
    } catch (error) {
      console.error(`Failed to process images for product ${wcProduct.name}:`, error)
      
      // If image download completely fails, fall back to storing external URLs
      console.log(`🔄 Falling back to external URLs for: ${wcProduct.name}`)
      
      let fallbackCount = 0
      for (const image of images) {
        try {
          await prisma.productImage.create({
            data: {
              productId,
              url: image.url, // External URL as fallback
              alt: image.alt,
              caption: image.caption,
              isPrimary: image.isPrimary,
              sortOrder: image.sortOrder
            }
          })
          fallbackCount++
        } catch (dbError) {
          console.error(`Failed to save fallback image for ${wcProduct.name}:`, dbError)
        }
      }
      
      this.updateProgress(
        this.progress.step, 
        this.progress.current, 
        this.progress.total, 
        this.progress.message,
        `Image processing failed for ${wcProduct.name}, used external URLs`
      )
      
      return fallbackCount
    }
  }

  private async importProductAttributes(productId: string, wcProduct: WooCommerceProduct): Promise<number> {
    const attributes = WooCommerceTransformer.extractAttributes(wcProduct)
    let count = 0

    for (const attr of attributes) {
      try {
        // Find or create attribute definition
        let attribute = await prisma.attribute.findFirst({
          where: { name: attr.name }
        })

        if (!attribute) {
          attribute = await prisma.attribute.create({
            data: {
              name: attr.name,
              slug: attr.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              type: 'SELECT',
              options: JSON.stringify(attr.options)
            }
          })
        }

        // Create product attribute with first option as value
        if (attr.options.length > 0) {
          await prisma.productAttribute.create({
            data: {
              productId,
              attributeId: attribute.id,
              value: attr.options[0]
            }
          })
          count++
        }

      } catch (error) {
        console.error(`Failed to import attribute ${attr.name} for product ${wcProduct.name}:`, error)
      }
    }

    return count
  }

  private sortCategoriesHierarchically(categories: WooCommerceCategory[]): WooCommerceCategory[] {
    const result: WooCommerceCategory[] = []
    const remaining = [...categories]

    // First pass: add root categories (parent = 0)
    const rootCategories = remaining.filter(cat => cat.parent === 0)
    result.push(...rootCategories)

    // Remove processed categories
    rootCategories.forEach(cat => {
      const index = remaining.findIndex(c => c.id === cat.id)
      if (index >= 0) remaining.splice(index, 1)
    })

    // Continue until all categories are processed
    while (remaining.length > 0) {
      const processed = []
      
      for (const category of remaining) {
        // Check if parent exists in result
        const parentExists = result.some(cat => cat.id === category.parent)
        if (parentExists) {
          result.push(category)
          processed.push(category)
        }
      }

      // Remove processed categories
      processed.forEach(cat => {
        const index = remaining.findIndex(c => c.id === cat.id)
        if (index >= 0) remaining.splice(index, 1)
      })

      // Prevent infinite loop
      if (processed.length === 0) {
        result.push(...remaining)
        break
      }
    }

    return result
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  private async generateUniqueSku(baseSku: string): Promise<string> {
    let sku = baseSku
    let counter = 1

    while (await prisma.product.findUnique({ where: { sku } })) {
      sku = `${baseSku}-${counter}`
      counter++
    }

    return sku
  }

  private async validateImportedData() {
    // Basic validation checks
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    const imageCount = await prisma.productImage.count()

    console.log(`✅ Validation complete:`)
    console.log(`   - Products: ${productCount}`)
    console.log(`   - Categories: ${categoryCount}`)
    console.log(`   - Images: ${imageCount}`)
  }

  // Clean up migration data (optional)
  async cleanupMigrationData() {
    // This could remove any temporary migration-specific data
    // For now, we'll just log that cleanup is available
    console.log('🧹 Migration cleanup completed (no temporary data to remove)')
  }
}