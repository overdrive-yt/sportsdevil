/*
  Warnings:

  - Added the required column `updatedAt` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "product_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,
    "description" TEXT,
    "seoDefaults" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "format" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_images" ("alt", "id", "isPrimary", "productId", "sortOrder", "url") SELECT "alt", "id", "isPrimary", "productId", "sortOrder", "url" FROM "product_images";
DROP TABLE "product_images";
ALTER TABLE "new_product_images" RENAME TO "product_images";
CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "price" DECIMAL NOT NULL,
    "originalPrice" DECIMAL,
    "sku" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "weight" DECIMAL,
    "dimensions" TEXT,
    "colors" TEXT,
    "sizes" TEXT,
    "tags" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "categoryAttributes" TEXT,
    "seoKeywords" TEXT,
    "template" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("colors", "createdAt", "description", "dimensions", "id", "isActive", "isFeatured", "isNew", "metaDescription", "metaTitle", "name", "originalPrice", "price", "shortDescription", "sizes", "sku", "slug", "stockQuantity", "tags", "updatedAt", "weight") SELECT "colors", "createdAt", "description", "dimensions", "id", "isActive", "isFeatured", "isNew", "metaDescription", "metaTitle", "name", "originalPrice", "price", "shortDescription", "sizes", "sku", "slug", "stockQuantity", "tags", "updatedAt", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_isActive_isFeatured_idx" ON "products"("isActive", "isFeatured");
CREATE INDEX "products_slug_idx" ON "products"("slug");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_status_idx" ON "products"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "product_templates_categoryId_idx" ON "product_templates"("categoryId");

-- CreateIndex
CREATE INDEX "product_templates_isActive_idx" ON "product_templates"("isActive");
