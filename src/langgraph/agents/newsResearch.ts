import { ResearchState } from "../state";
import { getNews } from "../tools/finance";
import { getGeminiModel, invokeWithRetry, sleep } from "../llm";

export async function newsResearchAgent(state: ResearchState): Promise<Partial<ResearchState>> {
  await sleep(2000);
  const { ticker, companyName } = state;
  const rawNews = await getNews(ticker);


  const prompt = `You are a news sentiment analyst. Analyze recent news for ${companyName || ticker}.
${rawNews && rawNews.length > 0 ? `Recent headlines: ${JSON.stringify(rawNews)}` : "No recent news found. Provide a general sentiment assessment based on your knowledge."}

Return ONLY valid JSON (no markdown, no code fences):
{
  "analyzedNews": [
    { "title": "headline", "sentiment": "positive", "summary": "brief summary" }
  ],
  "newsSentimentScore": 7
}

sentiment: "positive", "neutral", or "negative". Score: 0-10. Include 3-5 items.`;

  const text = await invokeWithRetry(() => getGeminiModel(0), prompt);
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);
    return { news: analysis.analyzedNews || [], newsSentimentScore: analysis.newsSentimentScore ?? 5 };
  } catch {
    return { news: [], newsSentimentScore: 5 };
  }
}
