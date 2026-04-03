import Anthropic from "@anthropic-ai/sdk";
import { BrandAnalysis, InfluencerProfile, ROIReport } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeBrand(instagramHandle: string): Promise<BrandAnalysis> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert brand analyst. Based on the Instagram handle "@${instagramHandle}", infer what kind of D2C (direct-to-consumer) brand this likely is.

Analyze the handle name itself for clues about:
- The niche/category (beauty, fitness, food, fashion, home goods, wellness, pets, baby, etc.)
- Products they likely sell
- Target audience demographics
- Brand voice and aesthetic
- Price point (budget, mid-range, premium, luxury)

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "handle": "${instagramHandle}",
  "inferredNiche": "string - primary niche category",
  "inferredProducts": ["array", "of", "likely", "products"],
  "targetAudience": "string - description of target customer",
  "brandVoice": "string - likely brand personality/voice",
  "pricePoint": "budget|mid-range|premium|luxury"
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return {
      handle: instagramHandle,
      inferredNiche: "lifestyle",
      inferredProducts: ["products"],
      targetAudience: "general consumers",
      brandVoice: "authentic and engaging",
      pricePoint: "mid-range",
    };
  }
}

export async function matchInfluencers(
  brandAnalysis: BrandAnalysis,
  influencers: InfluencerProfile[],
  count: number = 10
): Promise<InfluencerProfile[]> {
  if (influencers.length === 0) return [];

  const influencerList = influencers
    .map(
      (inf, i) =>
        `${i + 1}. @${inf.instagramHandle} | ${inf.name} | Niche: ${inf.niche} | Followers: ${inf.followerCount.toLocaleString()} | Engagement: ${inf.engagementRate}% | Tags: ${inf.tags?.join(", ")} | Past brands: ${inf.pastBrands?.join(", ")} | Audience: ${inf.audienceGender}, ${inf.audienceAgeRange}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an expert influencer marketing strategist. Match the best influencers for this brand.

BRAND PROFILE:
- Handle: @${brandAnalysis.handle}
- Niche: ${brandAnalysis.inferredNiche}
- Products: ${brandAnalysis.inferredProducts.join(", ")}
- Target Audience: ${brandAnalysis.targetAudience}
- Brand Voice: ${brandAnalysis.brandVoice}
- Price Point: ${brandAnalysis.pricePoint}

AVAILABLE INFLUENCERS:
${influencerList}

Select the TOP ${count} best matching influencers. For each, provide a match score (0-100) and a brief reason (1 sentence).

Respond ONLY with a valid JSON array (no markdown):
[
  {"index": 1, "matchScore": 87, "matchReason": "Brief reason why this is a great match"},
  ...
]

Sort by matchScore descending.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const matches = JSON.parse(text) as { index: number; matchScore: number; matchReason: string }[];
    return matches
      .slice(0, count)
      .map((m) => {
        const inf = influencers[m.index - 1];
        if (!inf) return null;
        return { ...inf, matchScore: m.matchScore, matchReason: m.matchReason };
      })
      .filter(Boolean) as InfluencerProfile[];
  } catch {
    return influencers.slice(0, count);
  }
}

export async function searchInfluencersByQuery(
  query: string,
  influencers: InfluencerProfile[],
  count: number = 5
): Promise<InfluencerProfile[]> {
  if (influencers.length === 0) return [];

  const influencerList = influencers
    .map(
      (inf, i) =>
        `${i + 1}. @${inf.instagramHandle} | ${inf.name} | Niche: ${inf.niche} | Followers: ${inf.followerCount.toLocaleString()} | Engagement: ${inf.engagementRate}% | Gender audience: ${inf.audienceGender} | Age: ${inf.audienceAgeRange} | Location: ${inf.location} | Tags: ${inf.tags?.join(", ")} | Past brands: ${inf.pastBrands?.join(", ")} | Price: $${inf.priceRange}/post`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an expert influencer marketing strategist. A brand is looking for specific influencers.

BRAND'S REQUIREMENTS (natural language):
"${query}"

AVAILABLE INFLUENCERS:
${influencerList}

Select the TOP ${count} influencers that BEST match the brand's requirements. Consider all criteria mentioned.

Respond ONLY with a valid JSON array (no markdown):
[
  {"index": 1, "matchScore": 92, "matchReason": "Specific reason tied to the brand's criteria"},
  ...
]

If fewer than ${count} influencers match the criteria well, return only those that genuinely match. Sort by matchScore descending.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const matches = JSON.parse(text) as { index: number; matchScore: number; matchReason: string }[];
    return matches
      .slice(0, count)
      .map((m) => {
        const inf = influencers[m.index - 1];
        if (!inf) return null;
        return { ...inf, matchScore: m.matchScore, matchReason: m.matchReason };
      })
      .filter(Boolean) as InfluencerProfile[];
  } catch {
    return influencers.slice(0, count);
  }
}

export async function analyzeROI(
  postUrl: string,
  amountPaid: number,
  influencerHandle?: string,
  influencerFollowers?: number,
  influencerEngagementRate?: number
): Promise<ROIReport> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an expert influencer marketing ROI analyst. Analyze the ROI for this influencer campaign.

POST DETAILS:
- Post URL: ${postUrl}
- Amount Paid: $${amountPaid}
- Influencer Handle: ${influencerHandle || "Unknown"}
- Influencer Followers: ${influencerFollowers?.toLocaleString() || "Unknown"}
- Influencer Engagement Rate: ${influencerEngagementRate || "Unknown"}%

Based on the URL structure and influencer data, estimate realistic Instagram performance metrics.
For a real product, these would be fetched via Instagram Graph API. For now, use industry benchmarks.

Industry benchmarks:
- Average Instagram engagement rate: 1-3% for large accounts, 3-6% for micro influencers
- Story reach: ~10-15% of followers
- Reel reach: can exceed follower count by 2-5x due to algorithmic distribution
- Average cost per 1000 impressions (CPM) for influencer marketing: $5-$25

Calculate realistic metrics and provide ROI analysis.

Respond ONLY with valid JSON (no markdown):
{
  "postUrl": "${postUrl}",
  "platform": "instagram",
  "postType": "reel|post|story",
  "estimatedMetrics": {
    "reach": number,
    "impressions": number,
    "likes": number,
    "comments": number,
    "saves": number,
    "engagementRate": number
  },
  "financial": {
    "amountPaid": ${amountPaid},
    "costPerLike": number,
    "costPerComment": number,
    "costPerThousand": number,
    "roiScore": number
  },
  "verdict": "excellent|good|average|poor",
  "verdictText": "One paragraph explaining the overall performance",
  "recommendations": ["array", "of", "3-4", "actionable", "recommendations"],
  "industryComparison": "One sentence comparing to industry benchmarks"
}

roiScore should be 0-100 where:
- 80-100: excellent ROI
- 60-79: good ROI
- 40-59: average ROI
- 0-39: poor ROI`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    return {
      postUrl,
      platform: "instagram",
      postType: "post",
      estimatedMetrics: {
        reach: Math.floor((influencerFollowers || 10000) * 0.3),
        impressions: Math.floor((influencerFollowers || 10000) * 0.45),
        likes: Math.floor((influencerFollowers || 10000) * 0.025),
        comments: Math.floor((influencerFollowers || 10000) * 0.002),
        saves: Math.floor((influencerFollowers || 10000) * 0.005),
        engagementRate: influencerEngagementRate || 2.5,
      },
      financial: {
        amountPaid,
        costPerLike: amountPaid / ((influencerFollowers || 10000) * 0.025),
        costPerComment: amountPaid / ((influencerFollowers || 10000) * 0.002),
        costPerThousand: (amountPaid / ((influencerFollowers || 10000) * 0.3)) * 1000,
        roiScore: 55,
      },
      verdict: "average",
      verdictText: "The campaign performed at industry average. Consider optimizing content format and posting time.",
      recommendations: [
        "Test reel format for higher organic reach",
        "Include a clear call-to-action in the caption",
        "Post during peak hours (7-9pm local time)",
        "Add story follow-ups to extend campaign lifespan",
      ],
      industryComparison: "Performance is in line with average D2C brand influencer campaigns.",
    };
  }
}
