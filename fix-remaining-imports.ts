#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

console.log('🔧 Fixing remaining single-level ../lib/ imports...\n')

// Find all route.ts files in app/api directory
const routeFiles = glob.sync('app/api/**/route.ts')

for (const filePath of routeFiles) {
  console.log(`📁 Processing: ${filePath}`)
  
  // Calculate correct relative path to lib directory
  const segments = filePath.replace(/^app\/api\//, '').split('/').filter(s => s !== 'route.ts')
  const depth = segments.length
  const correctPrefix = '../'.repeat(depth + 2) // +2 for app/api levels
  
  console.log(`   Directory depth: ${depth}, correct prefix: ${correctPrefix}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found, skipping`)
    continue
  }
  
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Fix ../lib/ imports to correct depth (for files directly in app/api/[folder]/)
  if (depth === 1) {
    const wrongPattern = "from '../lib/"
    const correctPattern = `from '../../lib/`
    
    if (content.includes(wrongPattern)) {
      const regex = new RegExp("from '\\.\\./lib/", 'g')
      content = content.replace(regex, correctPattern)
      console.log(`   ✅ Fixed: ../lib/ → ../../lib/`)
      modified = true
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`   💾 Saved changes`)
  } else {
    console.log(`   ➡️  No changes needed`)
  }
  
  console.log('')
}

console.log('✨ Remaining imports fixed!')