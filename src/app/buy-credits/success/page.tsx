"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, CheckCircle, Sparkles, ChevronRight, Search, BarChart3 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") || "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-lg">Chi Chang AI</span>
        </div>

        <h1 className="text-4xl font-black mb-3">Credits Added!</h1>
        <p className="text-white/60 mb-2">
          Your credits have been added to{" "}
          {handle ? <strong className="text-white">@{handle}</strong> : "your account"}.
        </p>
        <div className="flex items-center justify-center gap-2 text-violet-400 mb-8">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Ready to use immediately</span>
        </div>

        <div className="space-y-3">
          {handle && (
            <Link
              href={`/results/${handle}`}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all"
            >
              <Search className="w-5 h-5" />
              Find Influencers
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href={handle ? `/roi?handle=${handle}` : "/roi"}
            className="flex items-center justify-center gap-2 w-full glass-card hover:bg-white/10 text-white/70 hover:text-white font-semibold py-3.5 rounded-xl transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            Analyze ROI
          </Link>
          <Link
            href="/"
            className="block text-white/40 hover:text-white text-sm transition-colors pt-2"
          >
            Go to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
