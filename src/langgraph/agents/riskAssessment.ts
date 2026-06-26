import { ResearchState } from "../state";
import { getGeminiModel, invokeWithRetry, sleep } from "../llm";

export async function riskAssessmentAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  await sleep(2000);
  const { ticker, companyOverview, financials, news } = state;
  const context = { overview: companyOverview, financials, recentNews: news };


  const prompt = `You are a risk assessment analyst. Assess risks for ${ticker}.
Context: ${JSON.stringify(context)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "debtRisks": "analysis",
  "marketRisks": "analysis",
  "competitionRisks": "analysis",
  "regulatoryRisks": "analysis",
  "technologyRisks": "analysis",
  "riskProfileScore": 7
}

riskProfileScore: 0=extremely risky, 10=very safe.`;

  const text = await invokeWithRetry(() => getGeminiModel(0), prompt);
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const a = JSON.parse(cleaned);
    return {
      risks: { debtRisks: a.debtRisks, marketRisks: a.marketRisks, competitionRisks: a.competitionRisks, regulatoryRisks: a.regulatoryRisks, technologyRisks: a.technologyRisks },
      riskProfileScore: a.riskProfileScore ?? 5,
    };
  } catch {
    return { 
      risks: { 
        debtRisks: "Unable to assess debt risks at this time.", 
        marketRisks: "Unable to assess market risks at this time.", 
        competitionRisks: "Unable to assess competition risks at this time.", 
        regulatoryRisks: "Unable to assess regulatory risks at this time.", 
        technologyRisks: "Unable to assess technology risks at this time." 
      }, 
      riskProfileScore: 5 
    };
  }
}
