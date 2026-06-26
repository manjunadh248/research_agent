# 🤖 AI Investment Research Agent

A production-ready, multi-agent AI application that performs comprehensive investment research on any publicly traded company. Enter a stock ticker and receive a structured analysis with a final **INVEST**, **WATCHLIST**, or **PASS** recommendation — powered by a LangGraph multi-agent workflow using Google Gemini and Grok LLMs.

---

## ✨ Features

- **Multi-Agent LangGraph Workflow** — 6 specialized AI agents working in sequence
- **Real Financial Data** — Pulls live data from Yahoo Finance via `yahoo-finance2`
- **Dual LLM Support** — Uses Google Gemini for reasoning/synthesis, Grok (xAI) for news & risk analysis
- **Scoring Engine** — Weighted formula (Financial 35%, Growth 25%, Valuation 15%, Risk 15%, News 10%)
- **Rich Dashboard** — Interactive charts (Recharts), score widgets, radar chart, news sentiment
- **Research History** — Saves every analysis to PostgreSQL via Prisma ORM
- **Dark UI** — Sleek dark-mode interface built with Tailwind CSS
- **TypeScript Throughout** — Fully typed end-to-end

---

## 🏗 Architecture

```
User Input (Ticker)
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LangGraph Workflow                             │
│                                                                     │
│  ①CompanyResearch → ②FinancialAnalyst → ③NewsResearch →           │
│  ④RiskAssessment → ⑤Valuation → ⑥InvestmentCommittee             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
      │
      ▼
  Weighted Score → INVEST / WATCHLIST / PASS
      │
      ▼
  Save to PostgreSQL & Return JSON to Frontend
```

### Agent Roles

| Agent | LLM | Purpose |
|---|---|---|
| Company Research | Gemini | Gathers business description, industry, CEO, market cap |
| Financial Analyst | Gemini | Analyzes revenue, EPS, margins, FCF, D/E; scores 0–10 |
| News Research | Grok | Fetches latest news, classifies sentiment; scores 0–10 |
| Risk Assessment | Grok | Identifies debt/market/competition/regulatory/tech risks; scores 0–10 |
| Valuation | Gemini | Analyzes P/E, PEG, P/B; determines under/fair/overvalued; scores 0–10 |
| Investment Committee | Gemini | Synthesizes all scores → final INVEST/WATCHLIST/PASS + reasoning |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- A PostgreSQL database (local or cloud — [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app) all offer free tiers)
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- A [Grok / xAI](https://x.ai/api) API key

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd research_agent
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@host:5432/ai_research_agent"
GOOGLE_API_KEY="your_google_api_key_here"
GROK_API_KEY="your_grok_api_key_here"
```

### 3. Set Up the Database

```bash
npx prisma db push
```

This creates the `ResearchHistory` table in your PostgreSQL database.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### `POST /api/research`

**Request:**
```json
{ "company": "AAPL" }
```

**Response:**
```json
{
  "companyOverview": {
    "description": "Apple designs and sells consumer electronics...",
    "industry": "Consumer Electronics",
    "sector": "Technology",
    "ceo": "Tim Cook",
    "marketCap": 3200000000000
  },
  "financials": {
    "revenue": 394328000000,
    "netIncome": 97000000000,
    "eps": 6.16,
    "operatingMargin": 0.302,
    "freeCashFlow": 99584000000,
    "debtToEquity": 1.5,
    "cashFlowTrend": "Strongly positive with consistent growth..."
  },
  "news": [
    { "title": "...", "sentiment": "positive", "summary": "..." }
  ],
  "risks": {
    "debtRisks": "...",
    "marketRisks": "...",
    "competitionRisks": "...",
    "regulatoryRisks": "...",
    "technologyRisks": "..."
  },
  "valuation": {
    "trailingPE": 29.5,
    "forwardPE": 26.1,
    "pegRatio": 1.8,
    "priceToBook": 45.2,
    "status": "fairly valued",
    "analysis": "..."
  },
  "recommendation": {
    "decision": "INVEST",
    "confidence": 84,
    "reasoning": ["Strong FCF generation...", "Dominant market position...", "..."]
  },
  "scores": {
    "financialHealth": 8.5,
    "growthPotential": 7.2,
    "newsSentiment": 7.8,
    "riskProfile": 6.9,
    "valuation": 6.5
  }
}
```

---

## 🗄 Database Schema

```prisma
model ResearchHistory {
  id           String                 @id @default(uuid())
  companyName  String
  ticker       String
  researchDate DateTime               @default(now())
  decision     RecommendationDecision  // INVEST | WATCHLIST | PASS
  confidence   Float
  createdAt    DateTime               @default(now())
}
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── research/
│   │       └── route.ts         # POST /api/research endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Main dashboard UI
├── components/
│   ├── ui/
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   └── dashboard/
│       ├── CompanyOverviewCard.tsx
│       ├── FinancialMetricsCharts.tsx
│       ├── NewsSentimentCard.tsx
│       ├── RecommendationCard.tsx
│       ├── RiskRadarChart.tsx
│       └── ValuationAnalysisCard.tsx
├── langgraph/
│   ├── agents/
│   │   ├── companyResearch.ts
│   │   ├── financialAnalyst.ts
│   │   ├── investmentCommittee.ts
│   │   ├── newsResearch.ts
│   │   ├── riskAssessment.ts
│   │   └── valuation.ts
│   ├── tools/
│   │   └── finance.ts           # Yahoo Finance data fetching
│   ├── graph.ts                 # LangGraph state graph compilation
│   ├── llm.ts                   # Gemini & Grok model factories
│   └── state.ts                 # ResearchState annotation
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # cn() utility
└── generated/
    └── prisma/                  # Auto-generated Prisma client
prisma/
├── schema.prisma                # Database schema
└── migrations/                  # DB migration files
```

---

## ⚖️ Scoring Formula

| Factor | Weight |
|---|---|
| Financial Health | 35% |
| Growth Potential | 25% |
| Risk Profile | 15% |
| Valuation | 15% |
| News Sentiment | 10% |

**Decision Thresholds:**
- `75–100` → **INVEST** ✅
- `50–74` → **WATCHLIST** ⚠️
- `0–49` → **PASS** ❌

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set environment variables in the Vercel dashboard
4. Run `npx prisma db push` against your cloud PostgreSQL instance

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 Security

- All API keys are stored in environment variables — never committed to source control
- `.env` is in `.gitignore`
- Database calls gracefully degrade if `DATABASE_URL` is not set

---

## 📄 License

MIT
