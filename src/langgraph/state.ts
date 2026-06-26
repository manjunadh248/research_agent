import { Annotation } from "@langchain/langgraph";

export const ResearchStateAnnotation = Annotation.Root({
  companyName: Annotation<string>(),
  ticker: Annotation<string>(),
  
  // 1. Company Overview
  companyOverview: Annotation<Record<string, any>>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  
  // 2. Financial Metrics
  financials: Annotation<Record<string, any>>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  financialHealthScore: Annotation<number>({
    reducer: (curr, next) => next,
    default: () => 0,
  }),
  growthPotentialScore: Annotation<number>({
    reducer: (curr, next) => next,
    default: () => 0,
  }),
  
  // 3. News & Sentiment
  news: Annotation<any[]>({
    reducer: (curr, next) => next, 
    default: () => [],
  }),
  newsSentimentScore: Annotation<number>({
    reducer: (curr, next) => next,
    default: () => 0,
  }),
  
  // 4. Risks
  risks: Annotation<Record<string, any>>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  riskProfileScore: Annotation<number>({
    reducer: (curr, next) => next,
    default: () => 0,
  }),
  
  // 5. Valuation
  valuation: Annotation<Record<string, any>>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  valuationScore: Annotation<number>({
    reducer: (curr, next) => next,
    default: () => 0,
  }),
  
  // 6. Recommendation
  recommendation: Annotation<{
    decision: "INVEST" | "WATCHLIST" | "PASS";
    confidence: number;
    reasoning: string[];
  }>({
    reducer: (curr, next) => next,
    default: () => ({ decision: "PASS", confidence: 0, reasoning: [] }),
  }),
});

export type ResearchState = typeof ResearchStateAnnotation.State;
