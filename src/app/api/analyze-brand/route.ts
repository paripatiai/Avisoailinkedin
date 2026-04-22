import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBrand, matchInfluencers } from "@/lib/claude";
import { normalizeHandle } from "@/lib/utils";
import { InfluencerProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { handle, sell, customer } = await req.json();
    if (!handle) {
      return NextResponse.json({ error: "Instagram handle is required" }, { status: 400 });
    }

    const normalizedHandle = normalizeHandle(handle);

    // Get or create brand
    let brand = await prisma.brand.findUnique({
      where: { instagramHandle: normalizedHandle },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          instagramHandle: normalizedHandle,
          credits: 3, // 3 free searches on signup
        },
      });
    }

    // Find which influencers have already been shown to this brand
    const shownInfluencerIds = await prisma.recommendation.findMany({
      where: { brandId: brand.id },
      select: { influencerId: true },
    });
    const shownIds = new Set(shownInfluencerIds.map((r) => r.influencerId));

    // Get all active influencers not yet shown to this brand
    const availableInfluencers = await prisma.influencer.findMany({
      where: {
        isActive: true,
        id: { notIn: [...shownIds] },
      },
    });

    if (availableInfluencers.length === 0) {
      return NextResponse.json({ error: "No new influencers available" }, { status: 404 });
    }

    // Analyze the brand
    const brandAnalysis = await analyzeBrand(normalizedHandle, sell, customer);

    // Update brand with inferred info
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        niche: brandAnalysis.inferredNiche,
        description: brandAnalysis.targetAudience,
      },
    });

    // Convert Prisma results to InfluencerProfile
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

    // Use Claude to match and rank influencers (get top 12: 3 free + 9 locked)
    const matchedInfluencers = await matchInfluencers(brandAnalysis, influencerProfiles, 12);
    const topInfluencers = matchedInfluencers.slice(0, 12);

    // Save recommendations (3 free, rest locked)
    for (let i = 0; i < topInfluencers.length; i++) {
      const inf = topInfluencers[i];
      const isFree = i < 3;
      await prisma.recommendation.create({
        data: {
          brandId: brand.id,
          influencerId: inf.id,
          wasFree: isFree,
          creditsUsed: isFree ? 0 : 1,
          matchScore: inf.matchScore,
          matchReason: inf.matchReason,
        },
      });
    }

    return NextResponse.json({
      brand: {
        id: brand.id,
        handle: normalizedHandle,
        credits: brand.credits,
        niche: brandAnalysis.inferredNiche,
      },
      brandAnalysis,
      influencers: topInfluencers,
      freeCount: 3,
    });
  } catch (error) {
    console.error("analyze-brand error:", error);
    return NextResponse.json({ error: "Failed to analyze brand" }, { status: 500 });
  }
}
