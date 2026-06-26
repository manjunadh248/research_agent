import { ResearchState } from "../state";
import { getCompanyProfile } from "../tools/finance";
import { getGeminiModel, invokeWithRetry } from "../llm";

export async function companyResearchAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  const { ticker } = state;
  const rawProfile = await getCompanyProfile(ticker);


  const prompt = `You are a company research analyst. Analyze this data for ticker ${ticker}.
${rawProfile ? `Raw data: ${JSON.stringify(rawProfile)}` : "No data was found from Yahoo Finance. Use your knowledge about this company."}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "description": "A concise 2-3 sentence business model description",
  "industry": "industry name",
  "sector": "sector name",
  "ceo": "CEO name or Unknown",
  "marketCap": null
}`;

  const text = await invokeWithRetry(() => getGeminiModel(0), prompt);

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { companyOverview: parsed };
  } catch {
    return { companyOverview: { description: text, industry: "Unknown", sector: "Unknown", ceo: "Unknown", marketCap: null } };
  }
}
