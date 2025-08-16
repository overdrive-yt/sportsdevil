import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

interface ImageFile {
  filename: string
  path: string
  productSlug: string
  isPrimary: boolean
  sortOrder: number
}

// Function to check if image is a primary image
function isPrimaryImage(filename: string): boolean {
  return filename.includes('-main') || filename.includes('main')
}

// Function to get sort order from filename
function getSortOrder(filename: string): number {
  // Primary images get sort order 0
  if (isPrimaryImage(filename)) return 0
  
  // Extract number from filename (e.g., "product-2.webp" -> 2)
  const match = filename.match(/-(\d+)\.webp$/)
  if (match) {
    return parseInt(match[1])
  }
  
  return 999 // Default high number for images without clear ordering
}

// Function to generate alt text from filename
function generateAltText(productSlug: string, filename: string): string {
  const productName = productSlug.replace(/-/g, ' ')
  const capitalizedName = productName.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
  
  if (isPrimaryImage(filename)) {
    return `${capitalizedName} - Main Product Image`
  }
  
  const imageNumber = getSortOrder(filename)
  return `${capitalizedName} - Image ${imageNumber}`
}

// Recursively scan the products directory for images
async function scanProductImages(baseDir: string): Promise<ImageFile[]> {
  const images: ImageFile[] = []
  
  async function scanDirectory(dir: string, relativePath = ''): Promise<void> {
    try {
      const items = await readdir(dir)
      
      for (const item of items) {
        const fullPath = join(dir, item)
        const itemRelativePath = relativePath ? join(relativePath, item) : item
        const stats = await stat(fullPath)
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath, itemRelativePath)
        } else if (item.endsWith('.webp') || item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.png')) {
          // Found an image file
          const pathParts = relativePath.split('/')
          if (pathParts.length >= 2) {
            // Product slug is the last directory name
            const productSlug = pathParts[pathParts.length - 1]
            
            images.push({
              filename: item,
              path: `/images/products/${itemRelativePath}`,
              productSlug,
              isPrimary: isPrimaryImage(item),
              sortOrder: getSortOrder(item)
            })
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }
  
  await scanDirectory(baseDir)
  return images
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting product image population...')
    
    const publicDir = join(process.cwd(), 'public', 'images', 'products')
    
    // Scan for all images
    console.log('📁 Scanning product images directory...')
    const images = await scanProductImages(publicDir)
    console.log(`📸 Found ${images.length} image files`)
    
    // Get all products from database
    console.log('🗃️  Fetching products from database...')
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, name: true }
    })
    console.log(`🛍️  Found ${products.length} products in database`)
    
    // Group images by product slug
    const imagesBySlug = images.reduce((acc, image) => {
      if (!acc[image.productSlug]) {
        acc[image.productSlug] = []
      }
      acc[image.productSlug].push(image)
      return acc
    }, {} as Record<string, ImageFile[]>)
    
    console.log(`📁 Found images for ${Object.keys(imagesBySlug).length} unique product slugs`)
    
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const results: any[] = []
    
    // Process each product
    for (const product of products) {
      try {
        const productImages = imagesBySlug[product.slug]
        
        if (!productImages || productImages.length === 0) {
          console.log(`⚠️  No images found for product: ${product.slug}`)
          skippedCount++
          results.push({ product: product.slug, status: 'no_images', message: 'No images found' })
          continue
        }
        
        // Check if product already has images
        const existingImages = await prisma.productImage.findMany({
          where: { productId: product.id }
        })
        
        if (existingImages.length > 0) {
          console.log(`⏭️  Product ${product.slug} already has ${existingImages.length} images, skipping`)
          skippedCount++
          results.push({ product: product.slug, status: 'already_exists', message: `Already has ${existingImages.length} images` })
          continue
        }
        
        // Sort images: primary first, then by sort order
        productImages.sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1
          if (!a.isPrimary && b.isPrimary) return 1
          return a.sortOrder - b.sortOrder
        })
        
        // Create ProductImage records
        const imageRecords = productImages.map((image, index) => ({
          productId: product.id,
          url: image.path,
          alt: generateAltText(product.slug, image.filename),
          isPrimary: index === 0, // First image is primary
          sortOrder: index,
          format: image.filename.split('.').pop()?.toLowerCase() || 'webp'
        }))
        
        await prisma.productImage.createMany({
          data: imageRecords
        })
        
        console.log(`✅ Created ${imageRecords.length} images for product: ${product.name} (${product.slug})`)
        processedCount++
        results.push({ 
          product: product.slug, 
          status: 'success', 
          message: `Created ${imageRecords.length} images`,
          imageCount: imageRecords.length
        })
        
      } catch (error) {
        console.error(`❌ Error processing product ${product.slug}:`, error)
        errorCount++
        results.push({ 
          product: product.slug, 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const summary = {
      totalProducts: products.length,
      totalImagesScanned: images.length,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      uniqueImageSlugs: Object.keys(imagesBySlug).length
    }
    
    console.log('\n📊 Summary:')
    console.log(`✅ Successfully processed: ${processedCount} products`)
    console.log(`⏭️  Skipped: ${skippedCount} products`)
    console.log(`❌ Errors: ${errorCount} products`)
    console.log(`📸 Total images scanned: ${images.length}`)
    
    return NextResponse.json({
      success: true,
      summary,
      results
    })
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}