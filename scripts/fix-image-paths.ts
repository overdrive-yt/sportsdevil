#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixImagePaths() {
  try {
    console.log('🔧 Starting image path fixes...\n')
    
    // Get all product images with incorrect paths
    const incorrectImages = await prisma.productImage.findMany({
      where: {
        OR: [
          { url: { contains: '/images/products/uncategorized/' } },
          { url: { contains: '/images/products/cricket-' } }
        ]
      },
      select: { id: true, url: true }
    })
    
    console.log(`Found ${incorrectImages.length} images with incorrect paths`)
    
    let fixedCount = 0
    
    for (const image of incorrectImages) {
      let correctedPath = image.url
      
      // Fix uncategorized paths
      if (image.url.includes('/images/products/uncategorized/')) {
        correctedPath = image.url.replace('/images/products/uncategorized/', '/images/products/')
      }
      // Fix category-based paths (cricket-bats, cricket-junior-stock, etc.)
      else if (image.url.includes('/images/products/cricket-')) {
        correctedPath = image.url.replace(/\/images\/products\/[^\/]+\//, '/images/products/')
      }
      
      if (correctedPath !== image.url) {
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: correctedPath }
        })
        
        console.log(`✅ Fixed: ${image.url} → ${correctedPath}`)
        fixedCount++
      }
    }
    
    console.log(`\n🎉 Successfully fixed ${fixedCount} image paths!`)
    
    // Verify the fixes
    const remainingIncorrect = await prisma.productImage.count({
      where: {
        OR: [
          { url: { contains: '/images/products/uncategorized/' } },
          { url: { contains: '/images/products/cricket-' } }
        ]
      }
    })
    
    console.log(`Remaining incorrect paths: ${remainingIncorrect}`)
    
  } catch (error) {
    console.error('💥 Error fixing image paths:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixImagePaths()