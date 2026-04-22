"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Zap, BarChart3, Target, ChevronRight, Star, TrendingUp, Shield, ArrowRight } from "lucide-react";

type Step = "handle" | "context";

export default function HomePage() {
  const [step, setStep] = useState<Step>("handle");
  const [handle, setHandle] = useState("");
  const [whatYouSell, setWhatYouSell] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setStep("context");
  };

  const handleContextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatYouSell.trim()) return;
    setLoading(true);
    const cleanHandle = handle.replace(/^@/, "").trim();
    const params = new URLSearchParams({
      sell: whatYouSell.trim(),
      customer: targetCustomer.trim(),
    });
    router.push(`/results/${encodeURIComponent(cleanHandle)}?${params.toString()}`);
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Chi Chang AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white transition-colors hidden sm:block">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors hidden sm:block">Pricing</a>
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8">
          <Star className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-sm text-violet-300 font-medium">AI-powered influencer matching for Shopify brands</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl leading-tight">
          Find influencers who{" "}
          <span className="gradient-text">actually convert</span>{" "}
          for your brand
        </h1>

        <p className="text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
          Enter your Instagram handle. Our AI instantly analyzes your brand and surfaces the{" "}
          <strong className="text-white/80">top 3 matching influencers</strong> — for free. No sign-up needed.
        </p>

        {/* Step 1: Handle */}
        {step === "handle" && (
          <form onSubmit={handleHandleSubmit} className="w-full max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 glass-card rounded-xl px-4 py-3.5 glow-purple">
                <AtSign className="w-5 h-5 text-violet-400 shrink-0" />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourbrand or @yourbrand"
                  className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-lg"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!handle.trim()}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 whitespace-nowrap"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-white/40 text-sm">Top 3 influencers revealed instantly · No credit card needed</p>
          </form>
        )}

        {/* Step 2: Brand context (2 quick questions) */}
        {step === "context" && (
          <form onSubmit={handleContextSubmit} className="w-full max-w-lg">
            <div className="glass-card rounded-2xl p-6 text-left mb-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white">@</div>
                <span className="text-white/70 text-sm">Matching influencers for</span>
                <span className="font-bold text-violet-300">@{handle.replace(/^@/, "")}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    What does your brand sell? <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={whatYouSell}
                    onChange={(e) => setWhatYouSell(e.target.value)}
                    placeholder="e.g. vegan protein powder, baby clothing, natural skincare, pet treats"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors text-sm"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Who is your target customer? <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={targetCustomer}
                    onChange={(e) => setTargetCustomer(e.target.value)}
                    placeholder="e.g. fitness-focused women aged 25-35, new moms, dog owners, health-conscious millennials"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("handle")}
                className="px-4 py-3 glass-card hover:bg-white/10 text-white/50 hover:text-white rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !whatYouSell.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Find My Influencers <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
            <p className="mt-3 text-white/40 text-sm text-center">Top 3 shown instantly · No credit card needed</p>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span>2.4x avg. engagement improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>ROI tracked on every post</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Built for brands under $1M ARR</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Chi Chang AI works</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              From brand analysis to ROI report in minutes — no spreadsheets required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <AtSign className="w-6 h-6" />,
                title: "Describe your brand",
                desc: "Enter your handle and tell us what you sell and who your customer is. Takes 20 seconds.",
                color: "violet",
              },
              {
                step: "02",
                icon: <Target className="w-6 h-6" />,
                title: "Get matched influencers",
                desc: "We surface influencers whose audience, niche, and engagement align with your brand. Top 3 always free.",
                color: "blue",
              },
              {
                step: "03",
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Measure your ROI",
                desc: "Paste the influencer post link and what you paid. Get a full performance report and ROI score instantly.",
                color: "emerald",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.color === "violet" ? "bg-violet-500/20 text-violet-400" :
                    item.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  }`}>{item.icon}</div>
                  <span className="text-4xl font-black text-white/10">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple credit pricing</h2>
            <p className="text-white/50 text-lg">Pay only for what you use. Each influencer found or post analyzed costs a few credits.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$9", credits: 20, features: ["Find ~6 new influencers", "Analyze ~10 posts for ROI", "Natural language search", "No repeated influencers"], popular: false },
              { name: "Growth", price: "$24", credits: 60, features: ["Find ~20 new influencers", "Analyze ~30 posts for ROI", "Natural language search", "Full ROI history", "Influencer ROI database"], popular: true },
              { name: "Pro", price: "$49", credits: 150, features: ["Find ~50 new influencers", "Analyze ~75 posts for ROI", "Priority AI matching", "Full ROI history", "Export reports"], popular: false },
            ].map((pkg) => (
              <div key={pkg.name} className={`rounded-2xl p-8 relative ${pkg.popular ? "bg-gradient-to-b from-violet-600/20 to-blue-600/10 border border-violet-500/30" : "glass-card"}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-white/60 text-sm mb-1">{pkg.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{pkg.price}</span>
                    <span className="text-white/40">/ {pkg.credits} credits</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />{f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/buy-credits?package=${pkg.name.toLowerCase()}`}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${pkg.popular ? "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white" : "bg-white/5 hover:bg-white/10 text-white/80"}`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-sm mt-8">First 3 influencer recommendations are always free. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-white/50">Chi Chang AI</span>
        </div>
        <p>© 2025 Chi Chang AI. Built for D2C brands on Shopify.</p>
      </footer>
    </main>
  );
}
