"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AtSign, Lock, Zap, Users, TrendingUp, Star, ChevronRight,
  MapPin, Search, BarChart3, ArrowLeft, Sparkles, CheckCircle
} from "lucide-react";
import { InfluencerProfile, BrandAnalysis } from "@/types";
import { formatFollowers } from "@/lib/utils";

interface ResultsData {
  brand: { id: string; handle: string; credits: number; niche: string };
  brandAnalysis: BrandAnalysis;
  influencers: InfluencerProfile[];
  freeCount: number;
}

export default function ResultsPage() {
  const { handle } = useParams<{ handle: string }>();
  const searchParams = useSearchParams();
  const sell = searchParams.get("sell") ?? undefined;
  const customer = searchParams.get("customer") ?? undefined;
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InfluencerProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [searchCount, setSearchCount] = useState(3);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analyze-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: decodeURIComponent(handle), sell, customer }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to analyze brand");
      setData(json);
      setCreditsRemaining(json.brand.credits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [handle, sell, customer]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !data) return;

    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch("/api/search-influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: data.brand.handle,
          query: searchQuery,
          count: searchCount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setSearchError(`Need ${json.creditsNeeded} credits (you have ${json.creditsAvailable}). Buy more credits to continue.`);
        } else {
          throw new Error(json.error);
        }
        return;
      }
      setSearchResults(json.influencers);
      setCreditsRemaining(json.creditsRemaining);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Analyzing @{decodeURIComponent(handle)}</p>
          <p className="text-white/50">Our AI is finding your perfect influencer matches...</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">{error}</p>
        <Link href="/" className="text-violet-400 hover:text-violet-300 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Go back
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const freeInfluencers = data.influencers.slice(0, data.freeCount);
  const lockedInfluencers = data.influencers.slice(data.freeCount);
  const displayInfluencers = searchResults.length > 0 ? searchResults : freeInfluencers;

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">{creditsRemaining} credits</span>
          </div>
          <Link href="/buy-credits" className="text-sm bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white px-4 py-1.5 rounded-lg font-medium transition-all">
            Buy Credits
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Brand Analysis Header */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AtSign className="w-5 h-5 text-violet-400" />
                <span className="text-white/60 text-sm">Analyzing</span>
                <span className="font-bold text-lg">@{data.brand.handle}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  {data.brandAnalysis.inferredNiche}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  {data.brandAnalysis.pricePoint}
                </span>
                {data.brandAnalysis.inferredProducts.slice(0, 2).map((p) => (
                  <span key={p} className="text-xs bg-white/5 text-white/50 border border-white/10 px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/roi?handle=${data.brand.handle}`}
                className="flex items-center gap-2 text-sm glass-card hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Analyze ROI
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm glass-card hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Free Results */}
        {searchResults.length === 0 && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold">Your Top 3 Influencer Matches</h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">FREE</span>
              </div>
              <p className="text-white/50 text-sm">AI-matched based on your brand niche and target audience</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {freeInfluencers.map((inf, i) => (
                <InfluencerCard key={inf.id} influencer={inf} rank={i + 1} locked={false} />
              ))}
            </div>

            {/* Locked Section */}
            {lockedInfluencers.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-white/30" />
                  <h3 className="text-lg font-semibold text-white/50">
                    {lockedInfluencers.length} more matches found
                  </h3>
                  <span className="text-xs text-white/30">— unlock with credits</span>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {lockedInfluencers.slice(0, 6).map((inf, i) => (
                    <InfluencerCard key={inf.id} influencer={inf} rank={i + 4} locked={true} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold">Search Results</h2>
              <span className="text-sm text-white/40">({searchResults.length} influencers found)</span>
              <button onClick={() => setSearchResults([])} className="ml-auto text-sm text-white/40 hover:text-white transition-colors">
                Clear results
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {searchResults.map((inf, i) => (
                <InfluencerCard key={inf.id} influencer={inf} rank={i + 1} locked={false} />
              ))}
            </div>
          </div>
        )}

        {/* Natural Language Search */}
        <div className="glass-card rounded-2xl p-6 border border-violet-500/10">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Find specific influencers with AI</h3>
              <p className="text-white/50 text-sm mt-1">
                Describe exactly who you&apos;re looking for in plain English. Uses{" "}
                <span className="text-violet-300 font-medium">{2 + searchCount} credits</span>.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`e.g. "Female fitness influencers aged 25-35 in the US who have promoted clean supplements or protein products, with at least 50k followers and high engagement rates..."`}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none resize-none focus:border-violet-500/50 transition-colors text-sm"
              disabled={searching}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>Show</span>
                <select
                  value={searchCount}
                  onChange={(e) => setSearchCount(Number(e.target.value))}
                  className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white outline-none"
                >
                  {[3, 5, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span>influencers</span>
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim() || creditsRemaining < 2 + searchCount}
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                {searching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Search className="w-4 h-4" />Search Influencers</>
                )}
              </button>
            </div>
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-between">
                <span>{searchError}</span>
                <Link href="/buy-credits" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-4 whitespace-nowrap">
                  Buy credits <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
            {creditsRemaining < 2 + searchCount && !searchError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-center justify-between">
                <span>You need {2 + searchCount} credits for this search.</span>
                <Link href="/buy-credits" className="text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-4 whitespace-nowrap">
                  Buy credits <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

function InfluencerCard({ influencer: inf, rank, locked }: { influencer: InfluencerProfile; rank: number; locked: boolean }) {
  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all ${locked ? "opacity-60" : "hover:border-violet-500/20"}`}>
      {locked && (
        <div className="absolute inset-0 bg-[#050510]/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <p className="text-white/50 text-sm font-medium">Unlock with credits</p>
          </div>
        </div>
      )}
      <div className={`relative ${locked ? "blur-[2px]" : ""}`}>
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/40 to-blue-500/40 flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
              {inf.profilePicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={inf.profilePicUrl} alt={inf.name} className="w-full h-full object-cover" />
              ) : (
                inf.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold truncate">{inf.name}</p>
                {inf.isVerified && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
              </div>
              <p className="text-white/50 text-sm">@{inf.instagramHandle}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs text-white/30">#{rank}</span>
              {inf.matchScore && (
                <span className="text-xs font-bold text-violet-400">{inf.matchScore}% match</span>
              )}
            </div>
          </div>

          {/* Niche badge */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-xs bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full">{inf.niche}</span>
            {inf.subNiche && (
              <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">{inf.subNiche}</span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/3 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <Users className="w-3.5 h-3.5" /> Followers
              </div>
              <p className="font-bold text-base">{formatFollowers(inf.followerCount)}</p>
            </div>
            <div className="bg-white/3 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> Engagement
              </div>
              <p className="font-bold text-base text-emerald-400">{inf.engagementRate}%</p>
            </div>
          </div>

          {/* Avg Likes */}
          {inf.avgLikes && (
            <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span>~{formatFollowers(inf.avgLikes)} avg likes/post</span>
            </div>
          )}

          {/* Location */}
          {inf.location && (
            <div className="flex items-center gap-1.5 text-sm text-white/40 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{inf.location}</span>
            </div>
          )}

          {/* Audience */}
          {inf.audienceGender && (
            <div className="text-xs text-white/40 mb-3">
              <span className="text-white/60">Audience: </span>
              {inf.audienceGender} · {inf.audienceAgeRange}
            </div>
          )}

          {/* ROI badge */}
          {inf.avgROI && inf.roiDataPoints > 0 && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Avg ROI score: {inf.avgROI.toFixed(0)}/100 ({inf.roiDataPoints} campaigns)</span>
            </div>
          )}

          {/* Match reason */}
          {inf.matchReason && (
            <p className="text-xs text-white/40 italic border-t border-white/5 pt-3">{inf.matchReason}</p>
          )}

          {/* Price range */}
          {inf.priceRange && (
            <div className="mt-3 text-xs text-white/40">
              <span className="text-white/60">Est. rate: </span>${inf.priceRange}/post
            </div>
          )}
        </div>

        {/* Past Brands */}
        {inf.pastBrands && inf.pastBrands.length > 0 && (
          <div className="px-5 pb-5">
            <p className="text-xs text-white/30 mb-2">Has worked with</p>
            <div className="flex flex-wrap gap-1.5">
              {inf.pastBrands.slice(0, 3).map((b) => (
                <span key={b} className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded">{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {locked && (
        <div className="relative z-20 p-4 pt-0">
          <Link
            href="/buy-credits"
            className="block w-full text-center py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Unlock with Credits
          </Link>
        </div>
      )}
    </div>
  );
}
