"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, Sparkles, Check, AtSign, ArrowLeft, Shield, CreditCard } from "lucide-react";
import { CREDIT_PACKAGES } from "@/types";
import { normalizeHandle } from "@/lib/utils";

function BuyCreditsContent() {
  const searchParams = useSearchParams();
  const defaultHandle = searchParams.get("handle") || "";
  const defaultPackage = searchParams.get("package") || "growth";
  const canceled = searchParams.get("canceled") === "true";

  const [handle, setHandle] = useState(defaultHandle);
  const [selectedPackage, setSelectedPackage] = useState(defaultPackage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    if (!handle.trim()) {
      setError("Please enter your Instagram handle");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: normalizeHandle(handle),
          packageId: selectedPackage,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create checkout");

      // Redirect to Stripe Checkout
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#050510]/80 backdrop-blur-xl z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold">Chi Chang AI</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        {defaultHandle && (
          <Link href={`/results/${defaultHandle}`} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to results
          </Link>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-3">Buy AI Credits</h1>
          <p className="text-white/50 max-w-md mx-auto">
            Credits power every influencer search and ROI analysis. Use them when you need, they never expire.
          </p>
        </div>

        {/* Canceled Notice */}
        {canceled && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm mb-6 text-center">
            Payment was canceled. No charges were made.
          </div>
        )}

        {/* Handle Input */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">Your Instagram Handle</label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
            <AtSign className="w-4 h-4 text-white/40" />
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="yourbrand or @yourbrand"
              className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
          <p className="text-white/30 text-xs mt-2">Credits will be added to this handle&apos;s account</p>
        </div>

        {/* Package Selection */}
        <div className="space-y-4 mb-8">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`w-full text-left rounded-2xl p-5 border-2 transition-all ${
                selectedPackage === pkg.id
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/8 glass-card hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPackage === pkg.id ? "border-violet-500 bg-violet-500" : "border-white/30"
                  }`}>
                    {selectedPackage === pkg.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{pkg.name}</span>
                      {pkg.popular && (
                        <span className="text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">POPULAR</span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm mt-0.5">{pkg.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-black">${pkg.price}</p>
                  <p className="text-white/40 text-xs">{pkg.credits} credits</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Credit Cost Breakdown */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-semibold mb-4 text-sm text-white/70">How credits are used</h3>
          <div className="space-y-2">
            {[
              { action: "First 3 influencer recommendations", cost: "Free" },
              { action: "Natural language search (base)", cost: "2 credits" },
              { action: "Per influencer found in search", cost: "1 credit" },
              { action: "ROI analysis per post", cost: "2 credits" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between text-sm">
                <span className="text-white/60">{item.action}</span>
                <span className={`font-semibold ${item.cost === "Free" ? "text-emerald-400" : "text-white"}`}>
                  {item.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading || !handle.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all text-lg"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Continue to Payment
            </>
          )}
        </button>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-6 mt-6 text-white/30 text-xs">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Secure payment via Stripe
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Credits never expire
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BuyCreditsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <BuyCreditsContent />
    </Suspense>
  );
}
