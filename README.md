# Chi Chang AI

AI-powered influencer discovery and ROI tracking platform for small D2C Shopify brands.

## What it does

**Chi Chang AI** helps small Shopify brands (under $1M ARR) find the right influencers and measure their ROI — without big marketing budgets.

### Core features

1. **Instant influencer matching** — Enter your Instagram handle, get 3 AI-matched influencers immediately (free, no sign-up)
2. **Natural language search** — Describe your ideal influencer in plain English ("female fitness influencers 25-35 who promote clean supplements...")
3. **ROI analysis** — Submit any influencer post URL + what you paid → get a full ROI report with engagement estimates, CPM, cost-per-like, and a score
4. **Credit system** — First 3 recommendations free, then buy credits for more searches and analyses
5. **No repeated influencers** — Database tracks who's been shown to each brand so credits aren't wasted
6. **Influencer ROI history** — Over time, builds a database of each influencer's average ROI score across campaigns

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS** (dark gradient UI)
- **Prisma 7 + SQLite** (via libSQL adapter)
- **Anthropic Claude API** (claude-sonnet-4-6) — brand analysis, influencer matching, ROI reports
- **Stripe** — credit purchase checkout
- **Lucide React** — icons

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env` and fill in your keys:

```env
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up database

```bash
npx prisma migrate dev
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with Instagram handle input |
| `/results/[handle]` | Top 3 free influencers + locked influencers + NL search |
| `/roi` | ROI analysis form and report |
| `/dashboard` | Brand history, credits, past analyses |
| `/buy-credits` | Stripe credit purchase |
| `/buy-credits/success` | Post-purchase confirmation |

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze-brand` | POST | Analyze brand handle, return AI-matched influencers |
| `/api/search-influencers` | POST | Natural language influencer search (uses credits) |
| `/api/roi-analyze` | POST | Analyze post ROI (uses credits) |
| `/api/credits/purchase` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook to credit accounts |
| `/api/brand` | GET | Get brand dashboard data |

## Credit system

| Action | Cost |
|---|---|
| First 3 influencer recommendations | Free |
| Natural language search (base) | 2 credits |
| Per influencer found in search | 1 credit |
| ROI analysis per post | 2 credits |

| Package | Credits | Price |
|---|---|---|
| Starter | 20 | $9 |
| Growth | 60 | $24 |
| Pro | 150 | $49 |

## Database schema

- **brands** — tracks brand handles, credits, niche
- **influencers** — seeded database of 21+ influencers across niches with engagement data
- **recommendations** — every influencer shown to every brand (prevents repeats)
- **roi_analyses** — all ROI analyses with full report data
- **credit_transactions** — full credit ledger
- **search_queries** — all NL search queries for AI training data

## Roadmap

- [ ] Instagram Graph API integration for live follower/engagement data
- [ ] Shopify revenue conversion tracking (UTM links + pixel)
- [ ] Email notifications when ROI analysis is complete
- [ ] CSV export for reports
- [ ] Brand onboarding questionnaire for better initial matching
- [ ] Influencer outreach templates
