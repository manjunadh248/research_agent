import { ResearchState } from "../state";
import { getFinancialData } from "../tools/finance";
import { getGeminiModel, invokeWithRetry, sleep } from "../llm";

export async function financialAnalystAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  await sleep(2000); // Brief pause to avoid rate limits
  const { ticker } = state;
  const rawFinancials = await getFinancialData(ticker);


  const prompt = `You are a financial analyst. Analyze the financial data for ${ticker}.
${rawFinancials ? `Raw financial data: ${JSON.stringify(rawFinancials)}` : "No financial data was found. Use your knowledge about this company's finances."}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "revenue": 0,
  "netIncome": 0,
  "eps": 0,
  "operatingMargin": 0,
  "freeCashFlow": 0,
  "debtToEquity": 0,
  "revenueGrowthPct": 0,
  "cashFlowTrend": "Brief analysis",
  "financialHealthScore": 7,
  "growthPotentialScore": 7
}

Scores must be numbers 0-10. Use actual numbers, not null.`;

  const text = await invokeWithRetry(() => getGeminiModel(0), prompt);

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);
    return {
      financials: {
        revenue: analysis.revenue, netIncome: analysis.netIncome, eps: analysis.eps,
        operatingMargin: analysis.operatingMargin, freeCashFlow: analysis.freeCashFlow,
        debtToEquity: analysis.debtToEquity, revenueGrowthPct: analysis.revenueGrowthPct,
        cashFlowTrend: analysis.cashFlowTrend,
      },
      financialHealthScore: analysis.financialHealthScore ?? 5,
      growthPotentialScore: analysis.growthPotentialScore ?? 5,
    };
  } catch {
    return { financials: { error: "Failed to parse" }, financialHealthScore: 5, growthPotentialScore: 5 };
  }
}
