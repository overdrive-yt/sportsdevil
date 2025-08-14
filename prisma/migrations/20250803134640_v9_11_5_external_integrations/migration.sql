-- CreateTable
CREATE TABLE "platform_integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT,
    "credentials" TEXT NOT NULL,
    "lastSync" DATETIME,
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "config" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "syncInterval" INTEGER NOT NULL DEFAULT 3600,
    "syncProducts" BOOLEAN NOT NULL DEFAULT true,
    "syncInventory" BOOLEAN NOT NULL DEFAULT true,
    "syncOrders" BOOLEAN NOT NULL DEFAULT true,
    "syncPrices" BOOLEAN NOT NULL DEFAULT true,
    "totalProductsSynced" INTEGER NOT NULL DEFAULT 0,
    "totalOrdersSynced" INTEGER NOT NULL DEFAULT 0,
    "lastSuccessfulSync" DATETIME,
    "averageSyncTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "product_mappings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalSku" TEXT,
    "externalUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSync" DATETIME,
    "syncDirection" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "conflictData" TEXT,
    "platformData" TEXT,
    "customFields" TEXT,
    "localLastModified" DATETIME,
    "platformLastModified" DATETIME,
    "syncAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAttempt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_mappings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_mappings_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platform_integrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_mappings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastSync" DATETIME,
    "metadata" TEXT,
    "trackingNumber" TEXT,
    "shippingCarrier" TEXT,
    "platformStatus" TEXT,
    "platformTotal" DECIMAL,
    "platformFees" DECIMAL,
    "platformPayout" DECIMAL,
    "feeBreakdown" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_mappings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_mappings_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platform_integrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "duration" INTEGER,
    "metadata" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "memoryUsage" INTEGER,
    "apiCallCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_logs_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platform_integrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "platform_integrations_platform_isActive_idx" ON "platform_integrations"("platform", "isActive");

-- CreateIndex
CREATE INDEX "platform_integrations_syncStatus_idx" ON "platform_integrations"("syncStatus");

-- CreateIndex
CREATE INDEX "product_mappings_externalId_platformId_idx" ON "product_mappings"("externalId", "platformId");

-- CreateIndex
CREATE INDEX "product_mappings_status_idx" ON "product_mappings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_mappings_productId_platformId_key" ON "product_mappings"("productId", "platformId");

-- CreateIndex
CREATE INDEX "order_mappings_externalId_platformId_idx" ON "order_mappings"("externalId", "platformId");

-- CreateIndex
CREATE INDEX "order_mappings_status_idx" ON "order_mappings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "order_mappings_orderId_platformId_key" ON "order_mappings"("orderId", "platformId");

-- CreateIndex
CREATE INDEX "sync_logs_platformId_createdAt_idx" ON "sync_logs"("platformId", "createdAt");

-- CreateIndex
CREATE INDEX "sync_logs_operation_status_idx" ON "sync_logs"("operation", "status");

-- CreateIndex
CREATE INDEX "sync_logs_status_createdAt_idx" ON "sync_logs"("status", "createdAt");
