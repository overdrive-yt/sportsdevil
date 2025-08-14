/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'ADMIN',
    "phone" TEXT,
    "department" TEXT,
    "permissions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "bio" TEXT,
    "emergencyContact" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "admin_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "admin_accounts_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settings" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "stripe_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stripe_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stripe_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "orderId" TEXT,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "billingAddress" TEXT,
    "shippingAddress" TEXT,
    "metadata" TEXT,
    "description" TEXT,
    "receiptUrl" TEXT,
    "stripeEventId" TEXT,
    "stripeChargeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stripe_payments_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "stripe_customers" ("stripeCustomerId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stripe_payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stripe_refunds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeRefundId" TEXT NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "receiptNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stripe_refunds_stripePaymentId_fkey" FOREIGN KEY ("stripePaymentId") REFERENCES "stripe_payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "attributeTemplate" TEXT,
    "ageCategory" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "fullPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_categories" ("attributeTemplate", "createdAt", "description", "id", "image", "isActive", "name", "parentId", "slug", "sortOrder", "updatedAt") SELECT "attributeTemplate", "createdAt", "description", "id", "image", "isActive", "name", "parentId", "slug", "sortOrder", "updatedAt" FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX "categories_slug_idx" ON "categories"("slug");
CREATE INDEX "categories_isActive_idx" ON "categories"("isActive");
CREATE INDEX "categories_ageCategory_idx" ON "categories"("ageCategory");
CREATE INDEX "categories_level_idx" ON "categories"("level");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("address", "city", "country", "createdAt", "email", "emailVerified", "id", "image", "loyaltyPoints", "name", "password", "phone", "postalCode", "totalSpent", "updatedAt") SELECT "address", "city", "country", "createdAt", "email", "emailVerified", "id", "image", "loyaltyPoints", "name", "password", "phone", "postalCode", "totalSpent", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_level_isActive_idx" ON "admins"("level", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_provider_providerAccountId_key" ON "admin_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_sessionToken_key" ON "admin_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "admin_logs_adminId_createdAt_idx" ON "admin_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_logs_action_createdAt_idx" ON "admin_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "system_settings_updatedAt_idx" ON "system_settings"("updatedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_userId_key" ON "stripe_customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripeCustomerId_key" ON "stripe_customers"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "stripe_customers_stripeCustomerId_idx" ON "stripe_customers"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "stripe_customers_email_idx" ON "stripe_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_stripePaymentIntentId_key" ON "stripe_payments"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_orderId_key" ON "stripe_payments"("orderId");

-- CreateIndex
CREATE INDEX "stripe_payments_stripePaymentIntentId_idx" ON "stripe_payments"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "stripe_payments_stripeCustomerId_idx" ON "stripe_payments"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "stripe_payments_status_idx" ON "stripe_payments"("status");

-- CreateIndex
CREATE INDEX "stripe_payments_createdAt_idx" ON "stripe_payments"("createdAt");

-- CreateIndex
CREATE INDEX "stripe_payments_customerEmail_idx" ON "stripe_payments"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_refunds_stripeRefundId_key" ON "stripe_refunds"("stripeRefundId");

-- CreateIndex
CREATE INDEX "stripe_refunds_stripeRefundId_idx" ON "stripe_refunds"("stripeRefundId");

-- CreateIndex
CREATE INDEX "stripe_refunds_stripePaymentId_idx" ON "stripe_refunds"("stripePaymentId");

-- CreateIndex
CREATE INDEX "stripe_refunds_createdAt_idx" ON "stripe_refunds"("createdAt");
