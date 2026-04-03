import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { normalizeHandle } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { handle, packageId } = await req.json();

    if (!handle || !packageId) {
      return NextResponse.json({ error: "Handle and packageId are required" }, { status: 400 });
    }

    const normalizedHandle = normalizeHandle(handle);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let brand = await prisma.brand.findUnique({
      where: { instagramHandle: normalizedHandle },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: { instagramHandle: normalizedHandle, credits: 3 },
      });
    }

    const session = await createCheckoutSession(
      packageId,
      normalizedHandle,
      `${appUrl}/buy-credits/success?handle=${normalizedHandle}&session_id={CHECKOUT_SESSION_ID}`,
      `${appUrl}/buy-credits?handle=${normalizedHandle}&canceled=true`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("credits/purchase error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
