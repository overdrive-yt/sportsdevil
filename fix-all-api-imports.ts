#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

console.log('🔧 Fixing ALL API import issues comprehensively...\n')

// Find all route.ts files in app/api directory
const routeFiles = glob.sync('app/api/**/route.ts')

console.log(`Found ${routeFiles.length} API route files to process\n`)

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
  
  // Fix ../../lib/ imports to correct depth
  const wrongPattern = "from '../../lib/"
  const correctPattern = `from '${correctPrefix}lib/`
  
  if (content.includes(wrongPattern)) {
    // Replace all instances of ../../lib/ with the correct path
    const regex = new RegExp("from '../../lib/", 'g')
    content = content.replace(regex, correctPattern)
    console.log(`   ✅ Fixed: ../../lib/ → ${correctPrefix}lib/`)
    modified = true
  }
  
  // Also fix any @/lib imports while we're at it
  const atPattern = "from '@/lib/"
  if (content.includes(atPattern)) {
    const regex = new RegExp("from '@/lib/", 'g')
    content = content.replace(regex, correctPattern)
    console.log(`   ✅ Fixed: @/lib/ → ${correctPrefix}lib/`)
    modified = true
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`   💾 Saved changes`)
  } else {
    console.log(`   ➡️  No changes needed`)
  }
  
  console.log('')
}

console.log('✨ All API imports fixed!')