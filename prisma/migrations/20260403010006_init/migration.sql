-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramHandle" TEXT NOT NULL,
    "email" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "brandName" TEXT,
    "niche" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramHandle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "subNiche" TEXT,
    "followerCount" INTEGER NOT NULL,
    "followingCount" INTEGER,
    "engagementRate" REAL NOT NULL,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "avgShares" INTEGER,
    "avgROI" REAL,
    "roiDataPoints" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "profilePicUrl" TEXT,
    "location" TEXT,
    "audienceAgeRange" TEXT,
    "audienceGender" TEXT,
    "audienceLocation" TEXT,
    "contentTypes" TEXT,
    "pastBrands" TEXT,
    "tags" TEXT,
    "priceRange" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "wasFree" BOOLEAN NOT NULL DEFAULT false,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "matchScore" REAL,
    "matchReason" TEXT,
    "shownAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoiAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT,
    "postUrl" TEXT NOT NULL,
    "amountPaid" REAL NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "postType" TEXT,
    "reach" INTEGER,
    "impressions" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "engagementRate" REAL,
    "estimatedReach" INTEGER,
    "roiScore" REAL,
    "costPerLike" REAL,
    "costPerComment" REAL,
    "costPerThousand" REAL,
    "reportData" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoiAnalysis_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoiAnalysis_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountUsd" REAL,
    "stripePaymentId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "resultsJson" TEXT,
    "influencerCount" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchQuery_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_instagramHandle_key" ON "Brand"("instagramHandle");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_instagramHandle_key" ON "Influencer"("instagramHandle");

-- CreateIndex
CREATE INDEX "Recommendation_brandId_influencerId_idx" ON "Recommendation"("brandId", "influencerId");
