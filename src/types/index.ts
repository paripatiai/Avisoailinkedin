export interface InfluencerProfile {
  id: string;
  instagramHandle: string;
  name: string;
  niche: string;
  subNiche?: string | null;
  followerCount: number;
  engagementRate: number;
  avgLikes?: number | null;
  avgComments?: number | null;
  avgROI?: number | null;
  roiDataPoints: number;
  bio?: string | null;
  profilePicUrl?: string | null;
  location?: string | null;
  audienceAgeRange?: string | null;
  audienceGender?: string | null;
  audienceLocation?: string | null;
  contentTypes?: string[] | null;
  pastBrands?: string[] | null;
  tags?: string[] | null;
  priceRange?: string | null;
  isVerified: boolean;
  matchScore?: number;
  matchReason?: string;
}

export interface BrandAnalysis {
  handle: string;
  inferredNiche: string;
  inferredProducts: string[];
  targetAudience: string;
  brandVoice: string;
  pricePoint: string;
}

export interface ROIReport {
  postUrl: string;
  platform: string;
  postType: string;
  estimatedMetrics: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    saves: number;
    engagementRate: number;
  };
  financial: {
    amountPaid: number;
    costPerLike: number;
    costPerComment: number;
    costPerThousand: number;
    roiScore: number;
  };
  verdict: "excellent" | "good" | "average" | "poor";
  verdictText: string;
  recommendations: string[];
  industryComparison: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  description: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 20,
    price: 9,
    description: "Find ~6 influencers or analyze 10 posts",
  },
  {
    id: "growth",
    name: "Growth",
    credits: 60,
    price: 24,
    popular: true,
    description: "Find ~20 influencers or analyze 30 posts",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 150,
    price: 49,
    description: "Find ~50 influencers or analyze 75 posts",
  },
];

export const CREDIT_COSTS = {
  SEARCH_PER_INFLUENCER: 1,
  ROI_ANALYSIS: 2,
  NATURAL_LANGUAGE_BASE: 2,
};
