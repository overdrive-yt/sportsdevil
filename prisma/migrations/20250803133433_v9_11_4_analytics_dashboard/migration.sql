-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screenResolution" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageLoadTime" INTEGER
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "duration" INTEGER,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,
    "entryPage" TEXT,
    "exitPage" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT
);

-- CreateTable
CREATE TABLE "metrics_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "revenue" DECIMAL NOT NULL,
    "orders" INTEGER NOT NULL,
    "avgOrderValue" DECIMAL NOT NULL,
    "conversionRate" DECIMAL NOT NULL,
    "visitors" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "pageViews" INTEGER NOT NULL,
    "bounceRate" DECIMAL NOT NULL,
    "avgSessionTime" INTEGER NOT NULL,
    "productsViewed" INTEGER NOT NULL,
    "productsAdded" INTEGER NOT NULL,
    "cartAbandoned" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "analytics_events_eventType_timestamp_idx" ON "analytics_events"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_sessions_sessionId_key" ON "analytics_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_sessions_userId_idx" ON "analytics_sessions"("userId");

-- CreateIndex
CREATE INDEX "analytics_sessions_startTime_idx" ON "analytics_sessions"("startTime");

-- CreateIndex
CREATE INDEX "metrics_snapshots_period_timestamp_idx" ON "metrics_snapshots"("period", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_snapshots_period_timestamp_key" ON "metrics_snapshots"("period", "timestamp");
