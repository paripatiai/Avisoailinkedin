import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia",
});

export const STRIPE_PRICE_MAP: Record<string, { credits: number; amount: number }> = {
  starter: { credits: 20, amount: 900 },   // $9.00
  growth: { credits: 60, amount: 2400 },   // $24.00
  pro: { credits: 150, amount: 4900 },     // $49.00
};

export async function createCheckoutSession(
  packageId: string,
  brandHandle: string,
  successUrl: string,
  cancelUrl: string
) {
  const pkg = STRIPE_PRICE_MAP[packageId];
  if (!pkg) throw new Error("Invalid package");

  const packageNames: Record<string, string> = {
    starter: "Starter Pack – 20 Credits",
    growth: "Growth Pack – 60 Credits",
    pro: "Pro Pack – 150 Credits",
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pkg.amount,
          product_data: {
            name: packageNames[packageId],
            description: `${pkg.credits} Chi Chang AI credits for @${brandHandle}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      brandHandle,
      packageId,
      credits: pkg.credits.toString(),
    },
  });

  return session;
}
