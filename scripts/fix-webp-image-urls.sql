-- Fix WebP Image URLs Migration
-- This script updates all product image URLs from old formats (.jpg, .png, .jpeg) to .webp
-- to match the converted image files

-- Update product_images table - replace old extensions with .webp
UPDATE product_images 
SET url = REPLACE(REPLACE(REPLACE(url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp'),
    format = 'webp'
WHERE url LIKE '%.jpg' OR url LIKE '%.jpeg' OR url LIKE '%.png';

-- Update products table primary_image_url if it exists
UPDATE products 
SET primary_image_url = REPLACE(REPLACE(REPLACE(primary_image_url, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp')
WHERE primary_image_url LIKE '%.jpg' OR primary_image_url LIKE '%.jpeg' OR primary_image_url LIKE '%.png';

-- Update any JSON fields that might contain image URLs in products table
UPDATE products
SET images = REPLACE(REPLACE(REPLACE(images, '.jpg', '.webp'), '.jpeg', '.webp'), '.png', '.webp')
WHERE images LIKE '%.jpg%' OR images LIKE '%.jpeg%' OR images LIKE '%.png%';

-- Show results
SELECT 'Updated image URLs to WebP format' as message;
SELECT COUNT(*) as total_webp_images FROM product_images WHERE format = 'webp';
SELECT COUNT(*) as total_products FROM products;

-- Verify no old extensions remain
SELECT COUNT(*) as remaining_old_formats 
FROM product_images 
WHERE url LIKE '%.jpg' OR url LIKE '%.jpeg' OR url LIKE '%.png';