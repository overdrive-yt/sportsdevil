import fs from 'fs'
import path from 'path'

// Read backup file
const backupPath = path.join(process.cwd(), 'backups', 'comprehensive-backup-2025-08-14T14-48-15-326Z.json')
console.log('📖 Reading backup file for batch 1...')

const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
const products = backupData.products || []

// Take first 50 products for batch 1
const batch1Products = products.slice(0, 50)
console.log(`📦 Processing ${batch1Products.length} products in batch 1`)

// Generate SQL INSERT statements for products
const generateProductInserts = (products: any[]) => {
  const values: string[] = []
  
  products.forEach((product: any) => {
    // Clean product data and handle special characters
    const name = product.name.replace(/'/g, "''").substring(0, 255)
    const slug = product.slug.replace(/'/g, "''")
    const sku = product.sku.replace(/'/g, "''")
    
    const cleanedValues = [
      `'${product.id}'`,
      `'${name}'`,
      `'${slug}'`,
      'NULL', // description - too large for inline insertion  
      'NULL', // shortDescription - too large for inline insertion
      product.price || 0,
      product.originalPrice || 'NULL',
      `'${sku}'`,
      product.stockQuantity || 0,
      product.isActive ? 'true' : 'false',
      product.isFeatured ? 'true' : 'false',
      product.isNew ? 'true' : 'false',
      product.weight || 'NULL',
      'NULL', // dimensions
      'NULL', // colors
      'NULL', // sizes
      'NULL', // tags
      'NULL', // metaTitle
      'NULL', // metaDescription
      "'ACTIVE'", // status
      'NULL', // categoryAttributes
      'NULL', // seoKeywords
      'NULL', // template
      product.impressions || 0,
      product.clicks || 0,
      'NULL', // conversionRate
      `'${product.createdAt}'`,
      `'${product.updatedAt}'`
    ]
    
    values.push(`(${cleanedValues.join(', ')})`)
  })
  
  return values
}

const productValues = generateProductInserts(batch1Products)

const sql = `
-- Import Products Batch 1 (1-50)
INSERT INTO "products" (
  "id", "name", "slug", "description", "shortDescription", "price", "originalPrice", 
  "sku", "stockQuantity", "isActive", "isFeatured", "isNew", "weight", "dimensions",
  "colors", "sizes", "tags", "metaTitle", "metaDescription", "status",
  "categoryAttributes", "seoKeywords", "template", "impressions", "clicks", 
  "conversionRate", "createdAt", "updatedAt"
) VALUES 
${productValues.join(',\n')}
ON CONFLICT ("id") DO NOTHING;

-- Verify batch 1 import
SELECT COUNT(*) as product_count FROM "products";
`

console.log('📝 Generated SQL for batch 1 products import')

// Output to file for manual execution
fs.writeFileSync('import-products-batch-1.sql', sql)
console.log('💾 SQL saved to import-products-batch-1.sql')
console.log(`✅ Ready to import ${batch1Products.length} products in batch 1`)