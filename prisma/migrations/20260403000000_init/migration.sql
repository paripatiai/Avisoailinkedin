-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "instagramHandle" TEXT NOT NULL,
    "email" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "brandName" TEXT,
    "niche" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL,
    "instagramHandle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "subNiche" TEXT,
    "followerCount" INTEGER NOT NULL,
    "followingCount" INTEGER,
    "engagementRate" DOUBLE PRECISION NOT NULL,
    "avgLikes" INTEGER,
    "avgComments" INTEGER,
    "avgShares" INTEGER,
    "avgROI" DOUBLE PRECISION,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "wasFree" BOOLEAN NOT NULL DEFAULT false,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "matchScore" DOUBLE PRECISION,
    "matchReason" TEXT,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoiAnalysis" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "influencerId" TEXT,
    "postUrl" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'instagram',
    "postType" TEXT,
    "reach" INTEGER,
    "impressions" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "estimatedReach" INTEGER,
    "roiScore" DOUBLE PRECISION,
    "costPerLike" DOUBLE PRECISION,
    "costPerComment" DOUBLE PRECISION,
    "costPerThousand" DOUBLE PRECISION,
    "reportData" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountUsd" DOUBLE PRECISION,
    "stripePaymentId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "resultsJson" TEXT,
    "influencerCount" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Brand_instagramHandle_key" ON "Brand"("instagramHandle");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Influencer_instagramHandle_key" ON "Influencer"("instagramHandle");

-- CreateIndex
CREATE INDEX "Recommendation_brandId_influencerId_idx" ON "Recommendation"("brandId", "influencerId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoiAnalysis" ADD CONSTRAINT "RoiAnalysis_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoiAnalysis" ADD CONSTRAINT "RoiAnalysis_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
