"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import {
  Zap, Search, AtSign, BarChart3, Clock, Sparkles,
  TrendingUp, ChevronRight, Users, ArrowRight
} from "lucide-react";
import { formatCurrency, normalizeHandle } from "@/lib/utils";

interface BrandData {
  id: string;
  instagramHandle: string;
  credits: number;
  niche: string | null;
  createdAt: string;
  creditTransactions: Array<{
    id: string;
    credits: number;
    type: string;
    description: string | null;
    createdAt: string;
  }>;
  roiAnalyses: Array<{
    id: string;
    postUrl: string;
    amountPaid: number;
    roiScore: number | null;
    postType: string | null;
    createdAt: string;
    influencer: { name: string; instagramHandle: string } | null;
  }>;
  recommendations: Array<{
    id: string;
    shownAt: string;
    matchScore: number | null;
    influencer: { name: string; instagramHandle: string; niche: string };
  }>;
}

function DashboardContent() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<BrandData | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;
    setLoading(true);
    setError("");
    try {
      const normalized = normalizeHandle(handle);
      const res = await fetch(`/api/brand?handle=${normalized}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Brand not found");
      setData(json.brand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
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
        {data && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">{data.credits} credits</span>
            </div>
            <Link href="/buy-credits" className="text-sm bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-4 py-1.5 rounded-lg font-medium transition-all">
              Buy Credits
            </Link>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Handle Lookup */}
        {!data && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-3">Brand Dashboard</h1>
              <p className="text-white/50">Enter your Instagram handle to view your history, credits, and ROI analyses.</p>
            </div>
            <form onSubmit={handleLookup} className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 focus-within:border-violet-500/50 transition-colors">
                <AtSign className="w-5 h-5 text-violet-400 shrink-0" />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourbrand or @yourbrand"
                  className="flex-1 bg-transparent text-white placeholder-white/30 outline-none"
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading || !handle.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>View Dashboard <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AtSign className="w-5 h-5 text-violet-400" />
                  <h1 className="text-2xl font-black">@{data.instagramHandle}</h1>
                </div>
                {data.niche && (
                  <span className="text-sm bg-violet-500/20 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">
                    {data.niche}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/results/${data.instagramHandle}`}
                  className="flex items-center gap-2 text-sm glass-card hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all"
                >
                  <Search className="w-4 h-4" />
                  Find Influencers
                </Link>
                <Link
                  href={`/roi?handle=${data.instagramHandle}`}
                  className="flex items-center gap-2 text-sm bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analyze ROI
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Credits Remaining"
                value={data.credits.toString()}
                icon={<Sparkles className="w-5 h-5 text-violet-400" />}
                action={{ label: "Buy more", href: "/buy-credits" }}
              />
              <StatCard
                label="Influencers Found"
                value={data.recommendations.length.toString()}
                icon={<Users className="w-5 h-5 text-blue-400" />}
              />
              <StatCard
                label="ROI Analyses"
                value={data.roiAnalyses.length.toString()}
                icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
              />
              <StatCard
                label="Avg ROI Score"
                value={
                  data.roiAnalyses.length > 0
                    ? `${Math.round(data.roiAnalyses.reduce((sum, r) => sum + (r.roiScore || 0), 0) / data.roiAnalyses.length)}/100`
                    : "—"
                }
                icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
              />
            </div>

            {/* ROI Analyses */}
            {data.roiAnalyses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  ROI Analyses
                </h2>
                <div className="space-y-3">
                  {data.roiAnalyses.map((analysis) => (
                    <div key={analysis.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className={`text-2xl font-black w-16 shrink-0 text-center ${
                        analysis.roiScore
                          ? analysis.roiScore >= 80 ? "text-emerald-400"
                          : analysis.roiScore >= 60 ? "text-green-400"
                          : analysis.roiScore >= 40 ? "text-yellow-400"
                          : "text-red-400"
                          : "text-white/30"
                      }`}>
                        {analysis.roiScore ? Math.round(analysis.roiScore) : "—"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {analysis.influencer ? `@${analysis.influencer.instagramHandle}` : "Unknown influencer"}
                        </p>
                        <p className="text-white/40 text-xs truncate">{analysis.postUrl}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(analysis.amountPaid)}</p>
                        <p className="text-white/40 text-xs">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Influencer Recommendations History */}
            {data.recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Influencers Shown to You
                </h2>
                <div className="space-y-2">
                  {data.recommendations.map((rec) => (
                    <div key={rec.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600/40 to-blue-500/40 flex items-center justify-center text-sm font-bold shrink-0">
                        {rec.influencer.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.influencer.name}</p>
                        <p className="text-white/40 text-xs">@{rec.influencer.instagramHandle} · {rec.influencer.niche}</p>
                      </div>
                      {rec.matchScore && (
                        <span className="text-violet-400 font-bold text-sm shrink-0">{rec.matchScore}%</span>
                      )}
                      <span className="text-white/30 text-xs shrink-0">{new Date(rec.shownAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credit History */}
            {data.creditTransactions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Credit History
                </h2>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {data.creditTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="text-sm font-medium">{tx.description || tx.type}</p>
                          <p className="text-white/40 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`font-bold ${tx.credits > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.credits > 0 ? "+" : ""}{tx.credits}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {data.roiAnalyses.length === 0 && data.recommendations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No activity yet</h3>
                <p className="text-white/50 mb-6">Start by finding influencers for your brand or analyzing an influencer post.</p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href={`/results/${data.instagramHandle}`}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    Find Influencers <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label, value, icon, action
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        {icon}
        {action && (
          <Link href={action.href} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            {action.label}
          </Link>
        )}
      </div>
      <p className="text-2xl font-black mb-1">{value}</p>
      <p className="text-white/50 text-sm">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
