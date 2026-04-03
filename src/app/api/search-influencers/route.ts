import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchInfluencersByQuery } from "@/lib/claude";
import { normalizeHandle } from "@/lib/utils";
import { InfluencerProfile, CREDIT_COSTS } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { handle, query, count = 5 } = await req.json();

    if (!handle || !query) {
      return NextResponse.json({ error: "Handle and query are required" }, { status: 400 });
    }

    const normalizedHandle = normalizeHandle(handle);
    const requestedCount = Math.min(Math.max(1, count), 20);
    const creditsNeeded = CREDIT_COSTS.NATURAL_LANGUAGE_BASE + requestedCount * CREDIT_COSTS.SEARCH_PER_INFLUENCER;

    const brand = await prisma.brand.findUnique({
      where: { instagramHandle: normalizedHandle },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found. Please analyze your brand first." }, { status: 404 });
    }

    if (brand.credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          creditsAvailable: brand.credits,
        },
        { status: 402 }
      );
    }

    // Find already shown influencers to avoid repeats
    const shownInfluencerIds = await prisma.recommendation.findMany({
      where: { brandId: brand.id },
      select: { influencerId: true },
    });
    const shownIds = new Set(shownInfluencerIds.map((r) => r.influencerId));

    const availableInfluencers = await prisma.influencer.findMany({
      where: {
        isActive: true,
        id: { notIn: [...shownIds] },
      },
    });

    if (availableInfluencers.length === 0) {
      return NextResponse.json({ error: "No new influencers available matching your criteria" }, { status: 404 });
    }

    const influencerProfiles: InfluencerProfile[] = availableInfluencers.map((inf) => ({
      id: inf.id,
      instagramHandle: inf.instagramHandle,
      name: inf.name,
      niche: inf.niche,
      subNiche: inf.subNiche,
      followerCount: inf.followerCount,
      engagementRate: inf.engagementRate,
      avgLikes: inf.avgLikes,
      avgComments: inf.avgComments,
      avgROI: inf.avgROI,
      roiDataPoints: inf.roiDataPoints,
      bio: inf.bio,
      profilePicUrl: inf.profilePicUrl,
      location: inf.location,
      audienceAgeRange: inf.audienceAgeRange,
      audienceGender: inf.audienceGender,
      audienceLocation: inf.audienceLocation,
      contentTypes: inf.contentTypes ? JSON.parse(inf.contentTypes) : null,
      pastBrands: inf.pastBrands ? JSON.parse(inf.pastBrands) : null,
      tags: inf.tags ? JSON.parse(inf.tags) : null,
      priceRange: inf.priceRange,
      isVerified: inf.isVerified,
    }));

    const results = await searchInfluencersByQuery(query, influencerProfiles, requestedCount);

    // Deduct credits
    await prisma.brand.update({
      where: { id: brand.id },
      data: { credits: { decrement: creditsNeeded } },
    });

    await prisma.creditTransaction.create({
      data: {
        brandId: brand.id,
        credits: -creditsNeeded,
        type: "used",
        description: `Search: "${query.substring(0, 50)}"`,
      },
    });

    // Save recommendations and search query
    await prisma.searchQuery.create({
      data: {
        brandId: brand.id,
        queryText: query,
        resultsJson: JSON.stringify(results.map((r) => r.instagramHandle)),
        influencerCount: results.length,
        creditsUsed: creditsNeeded,
      },
    });

    for (const inf of results) {
      await prisma.recommendation.create({
        data: {
          brandId: brand.id,
          influencerId: inf.id,
          wasFree: false,
          creditsUsed: CREDIT_COSTS.SEARCH_PER_INFLUENCER,
          matchScore: inf.matchScore,
          matchReason: inf.matchReason,
        },
      });
    }

    const updatedBrand = await prisma.brand.findUnique({ where: { id: brand.id } });

    return NextResponse.json({
      influencers: results,
      creditsUsed: creditsNeeded,
      creditsRemaining: updatedBrand?.credits ?? 0,
    });
  } catch (error) {
    console.error("search-influencers error:", error);
    return NextResponse.json({ error: "Failed to search influencers" }, { status: 500 });
  }
}
