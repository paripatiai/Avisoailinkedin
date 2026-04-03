import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeROI } from "@/lib/claude";
import { normalizeHandle } from "@/lib/utils";
import { CREDIT_COSTS } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { handle, postUrl, amountPaid, influencerHandle } = await req.json();

    if (!handle || !postUrl || !amountPaid) {
      return NextResponse.json({ error: "Handle, postUrl, and amountPaid are required" }, { status: 400 });
    }

    const normalizedHandle = normalizeHandle(handle);
    const creditsNeeded = CREDIT_COSTS.ROI_ANALYSIS;

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

    // Look up influencer if handle provided
    let influencer = null;
    if (influencerHandle) {
      const normalizedInflHandle = normalizeHandle(influencerHandle);
      influencer = await prisma.influencer.findUnique({
        where: { instagramHandle: normalizedInflHandle },
      });
    }

    // Run ROI analysis via Claude
    const report = await analyzeROI(
      postUrl,
      amountPaid,
      influencerHandle,
      influencer?.followerCount,
      influencer?.engagementRate
    );

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
        description: `ROI analysis for ${postUrl.substring(0, 60)}`,
      },
    });

    // Save ROI analysis
    const roiRecord = await prisma.roiAnalysis.create({
      data: {
        brandId: brand.id,
        influencerId: influencer?.id,
        postUrl,
        amountPaid,
        platform: report.platform,
        postType: report.postType,
        reach: report.estimatedMetrics.reach,
        impressions: report.estimatedMetrics.impressions,
        likes: report.estimatedMetrics.likes,
        comments: report.estimatedMetrics.comments,
        saves: report.estimatedMetrics.saves,
        engagementRate: report.estimatedMetrics.engagementRate,
        roiScore: report.financial.roiScore,
        costPerLike: report.financial.costPerLike,
        costPerComment: report.financial.costPerComment,
        costPerThousand: report.financial.costPerThousand,
        reportData: JSON.stringify(report),
        creditsUsed: creditsNeeded,
      },
    });

    // Update influencer's average ROI if we know who it is
    if (influencer) {
      const allAnalyses = await prisma.roiAnalysis.findMany({
        where: { influencerId: influencer.id, roiScore: { not: null } },
        select: { roiScore: true },
      });
      const avgROI = allAnalyses.reduce((sum, a) => sum + (a.roiScore ?? 0), 0) / allAnalyses.length;
      await prisma.influencer.update({
        where: { id: influencer.id },
        data: { avgROI, roiDataPoints: allAnalyses.length },
      });
    }

    const updatedBrand = await prisma.brand.findUnique({ where: { id: brand.id } });

    return NextResponse.json({
      analysisId: roiRecord.id,
      report,
      creditsUsed: creditsNeeded,
      creditsRemaining: updatedBrand?.credits ?? 0,
    });
  } catch (error) {
    console.error("roi-analyze error:", error);
    return NextResponse.json({ error: "Failed to analyze ROI" }, { status: 500 });
  }
}
