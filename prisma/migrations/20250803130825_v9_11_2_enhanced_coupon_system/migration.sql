-- AlterTable
ALTER TABLE "coupon_usage" ADD COLUMN "deviceType" TEXT;
ALTER TABLE "coupon_usage" ADD COLUMN "discountAmount" DECIMAL;
ALTER TABLE "coupon_usage" ADD COLUMN "ipCountry" TEXT;
ALTER TABLE "coupon_usage" ADD COLUMN "orderTotal" DECIMAL;
ALTER TABLE "coupon_usage" ADD COLUMN "referralSource" TEXT;
ALTER TABLE "coupon_usage" ADD COLUMN "userAgent" TEXT;

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "budget" DECIMAL,
    "targetSales" DECIMAL,
    "theme" TEXT,
    "createdBy" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL NOT NULL,
    "minimumAmount" DECIMAL,
    "maximumDiscount" DECIMAL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "template" TEXT,
    "campaignId" TEXT,
    "targetSegment" TEXT,
    "scheduleStart" DATETIME,
    "scheduleEnd" DATETIME,
    "timeRestrictions" TEXT,
    "maxUsesPerUser" INTEGER,
    "requiresAccount" BOOLEAN NOT NULL DEFAULT true,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "buyXQuantity" INTEGER,
    "getYQuantity" INTEGER,
    "applicableProducts" TEXT,
    "applicableCategories" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "coupons_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_coupons" ("code", "createdAt", "description", "discountType", "discountValue", "id", "isActive", "maximumDiscount", "minimumAmount", "updatedAt", "usageLimit", "usedCount", "validFrom", "validUntil") SELECT "code", "createdAt", "description", "discountType", "discountValue", "id", "isActive", "maximumDiscount", "minimumAmount", "updatedAt", "usageLimit", "usedCount", "validFrom", "validUntil" FROM "coupons";
DROP TABLE "coupons";
ALTER TABLE "new_coupons" RENAME TO "coupons";
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "coupons_code_idx" ON "coupons"("code");
CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");
CREATE INDEX "coupons_campaignId_idx" ON "coupons"("campaignId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_slug_idx" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_isActive_idx" ON "campaigns"("isActive");

-- CreateIndex
CREATE INDEX "campaigns_startDate_endDate_idx" ON "campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "coupon_usage_usedAt_idx" ON "coupon_usage"("usedAt");
