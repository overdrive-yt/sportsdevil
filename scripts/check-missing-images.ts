#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { readdir } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

async function scanImageDirectories() {
  const baseDir = join(process.cwd(), 'public', 'images', 'products')
  const imageDirs: string[] = []
  
  async function scanDir(dir: string, relativePath = ''): Promise<void> {
    try {
      const items = await readdir(dir, { withFileTypes: true })
      
      for (const item of items) {
        if (item.isDirectory()) {
          const fullPath = join(dir, item.name)
          const newRelativePath = relativePath ? join(relativePath, item.name) : item.name
          
          // Check if this directory contains images
          const subItems = await readdir(fullPath)
          const hasImages = subItems.some(file => 
            file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
          )
          
          if (hasImages) {
            imageDirs.push(newRelativePath)
          }
          
          // Continue scanning subdirectories
          await scanDir(fullPath, newRelativePath)
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error)
    }
  }
  
  await scanDir(baseDir)
  return imageDirs
}

async function main() {
  try {
    console.log('🔍 Analyzing missing product images...\n')
    
    // Get all products from database
    const products = await prisma.product.findMany({
      select: { 
        id: true, 
        slug: true, 
        name: true,
        _count: {
          select: { images: true }
        }
      }
    })
    
    // Get all image directories
    const imageDirs = await scanImageDirectories()
    
    console.log(`📊 Analysis Results:`)
    console.log(`   Products in database: ${products.length}`)
    console.log(`   Image directories found: ${imageDirs.length}\n`)
    
    // Find products without images
    const productsWithoutImages = products.filter(p => p._count.images === 0)
    console.log(`❌ Products without images: ${productsWithoutImages.length}`)
    
    if (productsWithoutImages.length > 0) {
      console.log('\nProducts missing images:')
      productsWithoutImages.slice(0, 10).forEach(product => {
        console.log(`   - ${product.slug} (${product.name})`)
      })
      if (productsWithoutImages.length > 10) {
        console.log(`   ... and ${productsWithoutImages.length - 10} more`)
      }
    }
    
    // Find image directories without matching products
    const productSlugs = new Set(products.map(p => p.slug))
    const orphanedImageDirs = imageDirs.filter(dir => {
      // Extract the product slug from the directory path
      const parts = dir.split('/')
      const productSlug = parts[parts.length - 1]
      return !productSlugs.has(productSlug)
    })
    
    console.log(`\n🗂️  Orphaned image directories: ${orphanedImageDirs.length}`)
    if (orphanedImageDirs.length > 0) {
      console.log('Image directories without matching products:')
      orphanedImageDirs.slice(0, 10).forEach(dir => {
        console.log(`   - ${dir}`)
      })
      if (orphanedImageDirs.length > 10) {
        console.log(`   ... and ${orphanedImageDirs.length - 10} more`)
      }
    }
    
    // Try to find potential matches for missing images
    console.log('\n🔗 Potential matches for missing images:')
    for (const product of productsWithoutImages.slice(0, 5)) {
      const potentialMatches = imageDirs.filter(dir => {
        const dirName = dir.split('/').pop()?.toLowerCase() || ''
        const productSlug = product.slug.toLowerCase()
        
        // Check for partial matches
        return dirName.includes(productSlug.split('-')[0]) || 
               productSlug.includes(dirName.split('-')[0]) ||
               dirName.replace(/-/g, '').includes(productSlug.replace(/-/g, '').substring(0, 8))
      })
      
      if (potentialMatches.length > 0) {
        console.log(`   ${product.slug} → might match: ${potentialMatches.join(', ')}`)
      }
    }
    
    // Summary with recommendations
    console.log('\n📋 Recommendations:')
    if (productsWithoutImages.length > 0) {
      console.log(`   1. ${productsWithoutImages.length} products need images added`)
      console.log(`   2. Check if some product slugs don't match directory names`)
      console.log(`   3. Consider bulk uploading missing product images`)
    }
    
    if (orphanedImageDirs.length > 0) {
      console.log(`   4. ${orphanedImageDirs.length} image directories could be mapped to products`)
      console.log(`   5. Review product slug naming consistency`)
    }
    
    console.log('\n✅ Analysis complete!')
    
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()