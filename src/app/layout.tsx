import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chi Chang AI – Influencer Discovery for D2C Brands",
  description:
    "Find the perfect influencers for your Shopify brand with AI. Measure ROI on influencer posts and build smarter campaigns with a smaller budget.",
  keywords: "influencer marketing, D2C brands, Shopify, ROI tracking, micro influencers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050510] text-[#e8e8f0]">{children}</body>
    </html>
  );
}
