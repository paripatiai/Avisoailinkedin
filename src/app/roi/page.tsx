"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Zap, BarChart3, ArrowLeft, ExternalLink, TrendingUp,
  ThumbsUp, MessageCircle, Bookmark, Share2, Eye, DollarSign,
  ChevronRight, AtSign
} from "lucide-react";
import { ROIReport } from "@/types";
import { formatFollowers, formatCurrency, getVerdictColor, getVerdictBg } from "@/lib/utils";

function ROIPageContent() {
  const searchParams = useSearchParams();
  const defaultHandle = searchParams.get("handle") || "";

  const [handle, setHandle] = useState(defaultHandle);
  const [postUrl, setPostUrl] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [influencerHandle, setInfluencerHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ROIReport | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !postUrl || !amountPaid) return;

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/roi-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          postUrl,
          amountPaid: parseFloat(amountPaid),
          influencerHandle: influencerHandle || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError(`Need ${json.creditsNeeded} credits (you have ${json.creditsAvailable}). Please buy more credits.`);
        } else {
          throw new Error(json.error || "Failed to analyze ROI");
        }
        return;
      }

      setReport(json.report);
      setCreditsRemaining(json.creditsRemaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
        <Link href="/buy-credits" className="text-sm bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-4 py-1.5 rounded-lg font-medium transition-all">
          Buy Credits
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          {defaultHandle && (
            <Link href={`/results/${defaultHandle}`} className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to influencers
            </Link>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-3xl font-black">ROI Analyzer</h1>
          </div>
          <p className="text-white/50">
            Submit an influencer post link and what you paid. Our AI will analyze performance metrics and calculate your ROI.
            <span className="text-violet-300 font-medium"> Costs 2 credits.</span>
          </p>
        </div>

        {/* Form */}
        {!report && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Your Instagram Handle *</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                  <AtSign className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yourbrand"
                    className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Post or Reel URL *</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Amount Paid (USD) *</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                    <DollarSign className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="250"
                      min="1"
                      step="0.01"
                      className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Influencer Handle <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                    <AtSign className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="text"
                      value={influencerHandle}
                      onChange={(e) => setInfluencerHandle(e.target.value)}
                      placeholder="influencer_handle"
                      className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between">
                  <span>{error}</span>
                  <Link href="/buy-credits" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-4 whitespace-nowrap">
                    Buy credits <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !handle || !postUrl || !amountPaid}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing ROI...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    Analyze ROI (2 credits)
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-5">
            {/* Verdict Banner */}
            <div className={`rounded-2xl p-6 border ${getVerdictBg(report.verdict)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/50 text-sm mb-1">ROI Verdict</p>
                  <p className={`text-3xl font-black uppercase ${getVerdictColor(report.verdict)}`}>
                    {report.verdict}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-sm mb-1">ROI Score</p>
                  <div className="text-5xl font-black">{report.financial.roiScore}<span className="text-xl text-white/40">/100</span></div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{report.verdictText}</p>
            </div>

            {/* Metrics Grid */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                Estimated Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Reach", value: formatFollowers(report.estimatedMetrics.reach), icon: <Eye className="w-4 h-4" />, color: "violet" },
                  { label: "Impressions", value: formatFollowers(report.estimatedMetrics.impressions), icon: <Eye className="w-4 h-4" />, color: "blue" },
                  { label: "Likes", value: formatFollowers(report.estimatedMetrics.likes), icon: <ThumbsUp className="w-4 h-4" />, color: "pink" },
                  { label: "Comments", value: formatFollowers(report.estimatedMetrics.comments), icon: <MessageCircle className="w-4 h-4" />, color: "emerald" },
                  { label: "Saves", value: formatFollowers(report.estimatedMetrics.saves), icon: <Bookmark className="w-4 h-4" />, color: "amber" },
                  { label: "Engagement Rate", value: `${report.estimatedMetrics.engagementRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: "emerald" },
                ].map((m) => (
                  <div key={m.label} className="bg-white/3 rounded-xl p-4">
                    <div className={`flex items-center gap-1.5 text-xs mb-2 ${
                      m.color === "violet" ? "text-violet-400" :
                      m.color === "blue" ? "text-blue-400" :
                      m.color === "pink" ? "text-pink-400" :
                      m.color === "emerald" ? "text-emerald-400" :
                      "text-amber-400"
                    }`}>{m.icon}{m.label}</div>
                    <p className="text-xl font-bold">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Financial Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Amount Paid", value: formatCurrency(report.financial.amountPaid) },
                  { label: "Cost per Like", value: formatCurrency(report.financial.costPerLike) },
                  { label: "Cost per Comment", value: formatCurrency(report.financial.costPerComment) },
                  { label: "CPM (Cost per 1,000 reach)", value: formatCurrency(report.financial.costPerThousand) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry Comparison */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Share2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Industry Comparison</p>
                  <p className="text-white/60 text-sm">{report.industryComparison}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4">Recommendations for next campaign</h3>
              <ul className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            {creditsRemaining !== null && (
              <p className="text-center text-white/40 text-sm">Credits remaining: {creditsRemaining}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setReport(null); setPostUrl(""); setAmountPaid(""); setInfluencerHandle(""); }}
                className="flex-1 py-3 glass-card hover:bg-white/10 text-white/70 hover:text-white rounded-xl font-semibold text-sm transition-all"
              >
                Analyze Another Post
              </button>
              {defaultHandle && (
                <Link
                  href={`/results/${defaultHandle}`}
                  className="flex-1 flex items-center justify-center py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white rounded-xl font-semibold text-sm transition-all"
                >
                  Find More Influencers
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ROIPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ROIPageContent />
    </Suspense>
  );
}
