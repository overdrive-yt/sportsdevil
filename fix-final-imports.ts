#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

// Failed files from build error
const filesToFix = [
  'app/api/add-ons/validate/route.ts',
  'app/api/admin-actions/route.ts', 
  'app/api/admin/coupons/bulk/route.ts',
  'app/api/admin/coupons/route.ts',
  'app/api/admin/orders/route.ts'
]

// Function to calculate correct relative path
function calculateRelativePath(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile)
  const relativePath = path.relative(fromDir, toFile)
  return relativePath.startsWith('.') ? relativePath : './' + relativePath
}

// Function to count directory levels from app/api
function getDirectoryDepth(filePath: string): number {
  // Remove 'app/api/' prefix and count remaining path segments
  const pathWithoutAppApi = filePath.replace(/^app\/api\//, '')
  const segments = pathWithoutAppApi.split('/').filter(seg => seg !== 'route.ts')
  return segments.length
}

// Function to create correct relative path to lib directory
function getLibPath(filePath: string): string {
  const depth = getDirectoryDepth(filePath)
  // Go up depth+2 levels (depth for nested dirs + 2 for app/api)
  const dotsBack = '../'.repeat(depth + 2)
  return dotsBack + 'lib'
}

// Map of common import fixes
const importMappings = {
  '@/lib/auth': (filePath: string) => getLibPath(filePath) + '/auth',
  '@/lib/prisma': (filePath: string) => getLibPath(filePath) + '/prisma',
  '@/lib/add-ons/services': (filePath: string) => getLibPath(filePath) + '/add-ons/services',
  '@/lib/services/order.service': (filePath: string) => getLibPath(filePath) + '/services/order.service'
}

console.log('🔧 Fixing final import issues in specific problematic files...\n')

for (const fileName of filesToFix) {
  const filePath = path.resolve(fileName)
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`)
    continue
  }

  console.log(`📁 Processing: ${fileName}`)
  console.log(`   Directory depth from app/api: ${getDirectoryDepth(fileName)}`)
  
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Fix @ imports to relative
  for (const [atImport, getPath] of Object.entries(importMappings)) {
    if (content.includes(atImport)) {
      const correctPath = getPath(fileName)
      content = content.replace(new RegExp(atImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correctPath)
      console.log(`   ✅ Fixed: ${atImport} → ${correctPath}`)
      modified = true
    }
  }
  
  // Fix relative paths that might be wrong
  const wrongPatterns = [
    // Wrong paths from build errors
    { pattern: "'../../../../../lib/add-ons/services'", correct: getLibPath(fileName) + '/add-ons/services' },
    { pattern: "'../../../../lib/prisma'", correct: getLibPath(fileName) + '/prisma' },
    { pattern: "'../../../../../../lib/auth'", correct: getLibPath(fileName) + '/auth' },
    { pattern: "'../../../../../lib/auth'", correct: getLibPath(fileName) + '/auth' },
    { pattern: "'../../lib/services/order.service'", correct: getLibPath(fileName) + '/services/order.service' }
  ]
  
  for (const { pattern, correct } of wrongPatterns) {
    if (content.includes(pattern)) {
      content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `'${correct}'`)
      console.log(`   ✅ Fixed wrong path: ${pattern} → '${correct}'`)
      modified = true
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`   💾 Saved changes to ${fileName}`)
  } else {
    console.log(`   ➡️  No changes needed for ${fileName}`)
  }
  
  console.log('')
}

console.log('✨ Import fixing complete!')