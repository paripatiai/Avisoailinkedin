import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_MAP } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { brandHandle, packageId, credits } = session.metadata ?? {};

    if (brandHandle && packageId && credits) {
      const creditsToAdd = parseInt(credits, 10);

      let brand = await prisma.brand.findUnique({
        where: { instagramHandle: brandHandle },
      });

      if (!brand) {
        brand = await prisma.brand.create({
          data: { instagramHandle: brandHandle, credits: creditsToAdd },
        });
      } else {
        await prisma.brand.update({
          where: { id: brand.id },
          data: { credits: { increment: creditsToAdd } },
        });
      }

      const pkg = STRIPE_PRICE_MAP[packageId];
      await prisma.creditTransaction.create({
        data: {
          brandId: brand.id,
          credits: creditsToAdd,
          amountUsd: pkg ? pkg.amount / 100 : 0,
          stripePaymentId: session.payment_intent as string,
          type: "purchase",
          description: `Purchased ${creditsToAdd} credits - ${packageId} package`,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
