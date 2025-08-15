#!/bin/bash

# Fix all remaining files with ../../lib/ imports in app/api/[folder]/route.ts
# These should be ../../../lib/ (3 levels up to go from app/api/folder to lib)

files=(
"app/api/filters/route.ts"
"app/api/health/route.ts" 
"app/api/optimization/route.ts"
"app/api/orders/route.ts"
"app/api/products/route.ts"
"app/api/search/route.ts"
"app/api/settings/route.ts"
"app/api/social-media/route.ts"
"app/api/system-health/route.ts"
"app/api/wishlist/route.ts"
)

echo "🔧 Final fix for remaining import issues..."

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "📁 Fixing $file"
        sed -i '' "s|from '../../lib/|from '../../../lib/|g" "$file"
        echo "   ✅ Fixed imports in $file"
    else
        echo "   ⚠️  File not found: $file"
    fi
done

echo "✨ Final fixes complete!"