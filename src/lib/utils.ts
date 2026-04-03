import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase().trim();
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "excellent":
      return "text-emerald-400";
    case "good":
      return "text-green-400";
    case "average":
      return "text-yellow-400";
    case "poor":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict) {
    case "excellent":
      return "bg-emerald-500/20 border-emerald-500/30";
    case "good":
      return "bg-green-500/20 border-green-500/30";
    case "average":
      return "bg-yellow-500/20 border-yellow-500/30";
    case "poor":
      return "bg-red-500/20 border-red-500/30";
    default:
      return "bg-gray-500/20 border-gray-500/30";
  }
}
