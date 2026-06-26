import { ResearchState } from "../state";
import { getValuationMetrics } from "../tools/finance";
import { getGeminiModel, invokeWithRetry, sleep } from "../llm";

export async function valuationAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  await sleep(2000);
  const { ticker } = state;
  const metrics = await getValuationMetrics(ticker);


  const prompt = `You are a valuation analyst. Analyze valuation for ${ticker}.
${metrics ? `Data: ${JSON.stringify(metrics)}` : "No data found. Use your knowledge."}

Return ONLY valid JSON (no markdown, no code fences):
{
  "status": "fairly valued",
  "analysis": "Brief analysis",
  "valuationScore": 6
}

status: "undervalued", "fairly valued", or "overvalued". Score: 0=overvalued, 10=undervalued.`;

  const text = await invokeWithRetry(() => getGeminiModel(0), prompt);
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const a = JSON.parse(cleaned);
    return {
      valuation: { trailingPE: metrics?.trailingPE, forwardPE: metrics?.forwardPE, pegRatio: metrics?.pegRatio, priceToBook: metrics?.priceToBook, status: a.status, analysis: a.analysis },
      valuationScore: a.valuationScore ?? 5,
    };
  } catch {
    return { valuation: { error: "Failed to parse" }, valuationScore: 5 };
  }
}
