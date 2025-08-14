// 🗑️ TEMPORARY FILE - DELETE AFTER MIGRATION
// Image Download and Storage Utility for WooCommerce Migration

import { promises as fs } from 'fs'
import path from 'path'

// Local type definitions to avoid import issues
type WooCommerceCategory = {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  image: {
    src: string
    alt: string
  } | null
  count: number
}

interface ImageDownloadResult {
  success: boolean
  localPath: string
  originalUrl: string
  error?: string
  fileSize?: number
  format?: string
}

interface ProductImageInfo {
  productName: string
  categories: WooCommerceCategory[]
  images: Array<{
    url: string
    alt: string
    caption: string
    isPrimary: boolean
    sortOrder: number
  }>
}

export class ImageDownloader {
  private baseDir: string
  private publicDir: string

  constructor() {
    // Base directory for images: /public/images/products/
    this.publicDir = path.join(process.cwd(), 'public')
    this.baseDir = path.join(this.publicDir, 'images', 'products')
  }

  /**
   * Generate database-mirrored folder structure based on product name and intelligent categorization
   * Structure: /public/images/products/[category]/[brand-if-bat]/[product]/
   */
  private generateFolderPath(productName: string, categories: WooCommerceCategory[]): string {
    // Sanitize names for filesystem
    const sanitizeForPath = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
    }

    const name = productName.toLowerCase()
    const productPath = sanitizeForPath(productName)
    
    // Intelligent categorization based on product name
    let categoryPath = 'uncategorized'
    let brandPath = ''
    
    // Cricket Bats - Brand-based organization
    if (name.includes('bat') && !name.includes('batting')) {
      categoryPath = 'cricket-bats'
      
      // Detect brand for cricket bats
      const brands = [
        { pattern: /^a2\s/i, folder: 'a2' },
        { pattern: /^bas\s/i, folder: 'bas' },
        { pattern: /^bdm\s/i, folder: 'bdm' },
        { pattern: /^ceat\s/i, folder: 'ceat' },
        { pattern: /^dsc\s/i, folder: 'dsc' },
        { pattern: /^gm\s|gunn\s*&\s*moore|gray.?nicolls/i, folder: 'gm' },
        { pattern: /^kg\s/i, folder: 'kg' },
        { pattern: /kookaburra/i, folder: 'kookaburra' },
        { pattern: /^mrf\s/i, folder: 'mrf' },
        { pattern: /new.?balance|^nb\s/i, folder: 'nb' },
        { pattern: /^rns\s/i, folder: 'rns' },
        { pattern: /^sf\s/i, folder: 'sf' },
        { pattern: /^sg\s/i, folder: 'sg' },
        { pattern: /^ss\s|single\s*s/i, folder: 'ss' }
      ]
      
      for (const brand of brands) {
        if (brand.pattern.test(name)) {
          brandPath = brand.folder
          break
        }
      }
    }
    // Cricket Balls
    else if (name.includes('ball') && !name.includes('football')) {
      categoryPath = 'cricket-balls'
    }
    // Kit Bags
    else if (name.includes('bag') || name.includes('duffle')) {
      categoryPath = 'cricket-kit-bags'
    }
    // Wicket Keeping Equipment
    else if (name.includes('wicket') && (name.includes('keeping') || name.includes('keeper'))) {
      categoryPath = 'cricket-wicket-keeping'
    }
    // Protection Equipment
    else if (name.includes('helmet') || name.includes('batting') && name.includes('glove') || 
             name.includes('batting') && name.includes('pad') || name.includes('chest') && name.includes('guard') ||
             name.includes('thigh') && name.includes('pad') || name.includes('elbow') && name.includes('guard') ||
             name.includes('abdomen') && name.includes('guard')) {
      categoryPath = 'cricket-protection'
    }
    // Junior Stock
    else if (name.includes('junior') || name.includes('youth') || name.includes('boys') || 
             name.includes('harrow') || name.includes('size 5') || name.includes('size 6')) {
      categoryPath = 'cricket-junior-stock'
    }
    // Training Equipment
    else if (name.includes('stump') || name.includes('training') || name.includes('practice')) {
      categoryPath = 'cricket-training-equipment'
    }
    // Clothing & Accessories (grips, covers, etc.)
    else if (name.includes('grip') || name.includes('cover') || name.includes('clothing') || 
             name.includes('shirt') || name.includes('trouser')) {
      categoryPath = 'cricket-clothing-accessories'
    }
    
    // Build path: /[category]/[brand-if-bat]/[product]
    const pathParts = [this.baseDir, categoryPath]
    if (brandPath) pathParts.push(brandPath)
    pathParts.push(productPath)
    
    const relativePath = [categoryPath, brandPath, productPath].filter(Boolean).join('/')
    console.log(`📁 Generated folder path: /${relativePath}`)
    
    return path.join(...pathParts)
  }

  /**
   * Ensure directory exists, create if necessary
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
      console.log(`📁 Created directory: ${dirPath}`)
    }
  }

  /**
   * Download image from URL and save locally
   */
  private async downloadImage(imageUrl: string, localPath: string): Promise<ImageDownloadResult> {
    try {
      console.log(`⬇️ Downloading: ${imageUrl}`)
      
      // Fetch image
      const response = await fetch(imageUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Get image data
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Determine file extension from URL or content type
      const urlExtension = path.extname(new URL(imageUrl).pathname).toLowerCase()
      const contentType = response.headers.get('content-type')
      
      let extension = urlExtension
      if (!extension && contentType) {
        const typeMap: Record<string, string> = {
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp',
          'image/gif': '.gif'
        }
        extension = typeMap[contentType] || '.jpg'
      }
      
      if (!extension) extension = '.jpg' // Default fallback

      // Generate unique filename if exists
      let finalPath = localPath + extension
      let counter = 1
      
      while (true) {
        try {
          await fs.access(finalPath)
          // File exists, try with counter
          const parsedPath = path.parse(localPath)
          finalPath = path.join(parsedPath.dir, `${parsedPath.name}-${counter}${extension}`)
          counter++
        } catch {
          // File doesn't exist, we can use this path
          break
        }
      }

      // Save image
      await fs.writeFile(finalPath, buffer)

      // Calculate relative path from public directory
      const relativePath = path.relative(this.publicDir, finalPath).replace(/\\/g, '/')

      console.log(`✅ Downloaded: ${relativePath} (${buffer.length} bytes)`)

      return {
        success: true,
        localPath: `/${relativePath}`, // Web-accessible path
        originalUrl: imageUrl,
        fileSize: buffer.length,
        format: extension.replace('.', '')
      }

    } catch (error) {
      console.error(`❌ Failed to download ${imageUrl}:`, error)
      
      return {
        success: false,
        localPath: '',
        originalUrl: imageUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Download all images for a product
   */
  async downloadProductImages(
    productName: string, 
    categories: WooCommerceCategory[],
    images: Array<{
      url: string
      alt: string
      caption: string
      isPrimary: boolean
      sortOrder: number
    }>
  ): Promise<ImageDownloadResult[]> {
    
    if (images.length === 0) {
      console.log(`📭 No images to download for product: ${productName}`)
      return []
    }

    console.log(`\n📸 Downloading ${images.length} images for: ${productName}`)

    // Generate folder path
    const folderPath = this.generateFolderPath(productName, categories)
    
    // Ensure directory exists
    await this.ensureDirectoryExists(folderPath)

    const results: ImageDownloadResult[] = []

    // Download each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Generate base filename
      const sanitizedProductName = productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      const baseFileName = image.isPrimary 
        ? `${sanitizedProductName}-main`
        : `${sanitizedProductName}-${i + 1}`

      const localBasePath = path.join(folderPath, baseFileName)
      
      // Download image
      const result = await this.downloadImage(image.url, localBasePath)
      results.push(result)

      // Small delay between downloads to be respectful
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalSize = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.fileSize || 0), 0)

    console.log(`📊 Product ${productName}: ${successCount}/${images.length} images downloaded (${Math.round(totalSize / 1024)}KB)`)

    return results
  }

  /**
   * Clean filename for safe filesystem usage
   */
  private cleanFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\s\-_\.]/g, '') // Keep only safe characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase()
      .trim()
  }

  /**
   * Get web-accessible URL for local image
   */
  getImageUrl(localPath: string): string {
    // localPath is already in format: /images/products/category/product/image.jpg
    return localPath
  }

  /**
   * Validate image URL
   */
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
      const extension = path.extname(urlObj.pathname).toLowerCase()
      
      return validExtensions.includes(extension) || 
             url.includes('image') ||
             url.includes('photo') ||
             url.includes('picture')
    } catch {
      return false
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalImages: number
    totalSize: number
    categories: string[]
  }> {
    try {
      const stats = {
        totalImages: 0,
        totalSize: 0,
        categories: [] as string[]
      }

      // Check if base directory exists
      try {
        await fs.access(this.baseDir)
      } catch {
        return stats
      }

      // Read categories (subdirectories)
      const categories = await fs.readdir(this.baseDir, { withFileTypes: true })
      
      for (const category of categories) {
        if (category.isDirectory()) {
          stats.categories.push(category.name)
          
          const categoryPath = path.join(this.baseDir, category.name)
          const products = await fs.readdir(categoryPath, { withFileTypes: true })
          
          for (const product of products) {
            if (product.isDirectory()) {
              const productPath = path.join(categoryPath, product.name)
              const images = await fs.readdir(productPath)
              
              stats.totalImages += images.length
              
              // Calculate size
              for (const image of images) {
                const imagePath = path.join(productPath, image)
                const stat = await fs.stat(imagePath)
                stats.totalSize += stat.size
              }
            }
          }
        }
      }

      return stats
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return {
        totalImages: 0,
        totalSize: 0,
        categories: []
      }
    }
  }
}