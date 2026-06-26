import { ResearchState } from "../state";
import { getGeminiModel, invokeWithRetry, sleep } from "../llm";

export async function investmentCommitteeAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  await sleep(2000);
  const { financialHealthScore, growthPotentialScore, valuationScore, newsSentimentScore, riskProfileScore } = state;

  const weightedScore =
    (financialHealthScore * 0.35) + (growthPotentialScore * 0.25) +
    (valuationScore * 0.15) + (newsSentimentScore * 0.10) + (riskProfileScore * 0.15);
  const finalScore = weightedScore * 10;

  let decision: "INVEST" | "WATCHLIST" | "PASS" = "PASS";
  if (finalScore >= 75) decision = "INVEST";
  else if (finalScore >= 50) decision = "WATCHLIST";


  const prompt = `You are the Investment Committee. Final recommendation for ${state.ticker}.
Score: ${finalScore.toFixed(1)}/100. Decision: ${decision}.
Scores: Financial=${financialHealthScore}, Growth=${growthPotentialScore}, Valuation=${valuationScore}, News=${newsSentimentScore}, Risk=${riskProfileScore}.
Company: ${JSON.stringify(state.companyOverview)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "confidence": 75,
  "reasoning": ["point 1", "point 2", "point 3"]
}

confidence: 0-100. reasoning: 3-5 bullet points.`;

  const text = await invokeWithRetry(() => getGeminiModel(0.2), prompt);
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const s = JSON.parse(cleaned);
    return { recommendation: { decision, confidence: s.confidence ?? Math.round(finalScore), reasoning: s.reasoning ?? [] } };
  } catch {
    return { recommendation: { decision, confidence: Math.round(finalScore), reasoning: [`Weighted score: ${finalScore.toFixed(1)}/100`] } };
  }
}
