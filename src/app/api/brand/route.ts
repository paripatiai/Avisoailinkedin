import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeHandle } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  const normalizedHandle = normalizeHandle(handle);

  const brand = await prisma.brand.findUnique({
    where: { instagramHandle: normalizedHandle },
    include: {
      creditTransactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      roiAnalyses: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { influencer: { select: { name: true, instagramHandle: true } } },
      },
      recommendations: {
        orderBy: { shownAt: "desc" },
        take: 20,
        include: { influencer: { select: { name: true, instagramHandle: true, niche: true } } },
      },
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  return NextResponse.json({ brand });
}
