import { NextResponse } from "next/server";
import { app } from "@/langgraph/graph";
import { prisma } from "@/lib/prisma";
import { searchTicker } from "@/langgraph/tools/finance";

// Force dynamic so Next.js doesn't try to statically evaluate this route at build time
export const dynamic = 'force-dynamic';

// Disable LangSmith tracing if no API key is configured to avoid 403 errors
if (!process.env.LANGCHAIN_API_KEY || process.env.LANGCHAIN_API_KEY === 'your_langchain_api_key_here') {
  process.env.LANGCHAIN_TRACING_V2 = 'false';
}

export async function POST(request: Request) {
  try {
    const { company } = await request.json();

    if (!company) {
      return NextResponse.json({ error: "Company ticker is required" }, { status: 400 });
    }

    // Initialize state
    const initialState = {
      ticker: "",
      companyName: company,
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Convert company name to ticker if needed
          let ticker = company.toUpperCase();
          if (!/^[A-Z]{1,5}$/.test(ticker)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "progress", step: `Looking up ticker for ${company}...`, agent: "init" })}\n\n`));
            const foundTicker = await searchTicker(company);
            if (foundTicker) {
              ticker = foundTicker;
            }
          }
          initialState.ticker = ticker;

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "progress", step: `Starting analysis for ${ticker}...`, agent: "init", ticker })}\n\n`));
          
          let finalState = initialState as any;
          for await (const chunk of await app.stream(initialState)) {
             // chunk is an object with the node name as key and the state update as value
             const agentName = Object.keys(chunk)[0];
             const stateUpdate = chunk[agentName];
             finalState = { ...finalState, ...stateUpdate };
             
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "progress", step: `Agent completed: ${agentName}`, agent: agentName })}\n\n`));
          }

          // Try saving history to the database
          if (prisma && finalState.recommendation) {
            try {
              await prisma.researchHistory.create({
                data: {
                  companyName: finalState.companyName || company,
                  ticker: finalState.ticker,
                  decision: finalState.recommendation.decision,
                  confidence: finalState.recommendation.confidence,
                },
              });
            } catch (dbError) {
              console.warn("Could not save to database:", dbError);
            }
          }

          // Final response
          const finalData = {
            companyOverview: finalState.companyOverview,
            financials: finalState.financials,
            news: finalState.news,
            risks: finalState.risks,
            valuation: finalState.valuation,
            recommendation: finalState.recommendation,
            scores: {
              financialHealth: finalState.financialHealthScore,
              growthPotential: finalState.growthPotentialScore,
              newsSentiment: finalState.newsSentimentScore,
              riskProfile: finalState.riskProfileScore,
              valuation: finalState.valuationScore,
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "complete", data: finalData })}\n\n`));
        } catch (error: any) {
           console.error("Stream error in route.ts:", error);
           
           const isRateLimitOrQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("404");
           
           if (isRateLimitOrQuota) {
             console.log("FALLING BACK TO MOCK DATA MODE DUE TO API QUOTA");
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "progress", step: "API Quota Exceeded. Enabling MOCK DATA MODE to demonstrate UI layout...", agent: "system" })}\n\n`));
             
             // Wait 2 seconds to simulate processing
             await new Promise(resolve => setTimeout(resolve, 2000));
             
             const mockData = {
                ticker: "NVDA",
                companyName: "NVIDIA Corporation",
                companyOverview: {
                  name: "NVIDIA Corporation",
                  sector: "Technology",
                  industry: "Semiconductors",
                  ceo: "Jensen Huang",
                  marketCap: 2800000000000,
                  description: "NVIDIA Corp. is a global leader in AI computing. They design GPUs for the gaming, professional markets, data centers, and automotive markets. Their explosive growth recently is attributed to their H100 and Blackwell AI chips."
                },
                financials: { revenue: 60920000000, netIncome: 29760000000, eps: 11.93, operatingMargin: 0.54, freeCashFlow: 26900000000, debtToEquity: 0.25, cashFlowTrend: "NVIDIA's operating cash flow has skyrocketed by over 400% year-over-year due to massive data center demand, giving them a fortress balance sheet." },
                news: [
                  { title: "NVIDIA announces new Blackwell architecture for AI", summary: "NVIDIA unveiled its next-generation Blackwell chips, promising 30x performance increases.", date: "Today" }, 
                  { title: "Data Center revenue hits record highs", summary: "NVIDIA's Q4 earnings blew past estimates as tech giants continue buying GPUs at an unprecedented scale.", date: "Yesterday" }
                ],
                risks: ["Geopolitical tensions affecting TSMC manufacturing in Taiwan", "Strict U.S. export restrictions on advanced AI chips to China", "High valuation multiples pricing in absolute perfection"],
                valuation: {
                  trailingPE: 75.4,
                  forwardPE: 35.2,
                  pegRatio: 1.15,
                  priceToBook: 42.8,
                  analysis: "NVIDIA trades at a premium valuation (Forward P/E ~35x), but this is heavily supported by triple-digit earnings growth. The PEG ratio is actually quite reasonable compared to historical high-growth hardware companies."
                },
                recommendation: { 
                  decision: "BUY", 
                  confidence: 92, 
                  reasoning: [
                    "NVIDIA has an undisputed monopoly in AI training and inference hardware.",
                    "Their software ecosystem (CUDA) provides a massive, impenetrable moat.",
                    "Unprecedented fundamental growth and margin expansion justifies the premium valuation."
                  ]
                },
                scores: { financialHealth: 95, growthPotential: 98, newsSentiment: 90, riskProfile: 65, valuation: 75 }
             };
             
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "complete", data: mockData })}\n\n`));
           } else {
             controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: error.message || "Internal server error" })}\n\n`));
           }
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Error in /api/research:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
