import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Helper: sleep for ms
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let currentGeminiKeyIndex = 0;

function getNextGeminiKey(): string | undefined {
  const keysStr = process.env.GOOGLE_API_KEY;
  if (!keysStr) return undefined;
  
  const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
  if (keys.length === 0) return undefined;
  
  const key = keys[currentGeminiKeyIndex % keys.length];
  currentGeminiKeyIndex++;
  return key;
}

/**
 * Helper: invoke LLM with automatic retry and key rotation on rate limit (429)
 */
export async function invokeWithRetry(modelFactory: () => any, prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const llm = modelFactory();
      const response = await llm.invoke(prompt);
      return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota");
      if (isRateLimit && attempt < maxRetries - 1) {
        const waitTime = (attempt + 1) * 3000; // wait briefly before retrying with next key
        console.warn(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 2}/${maxRetries} with next key...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Returns a configured Gemini LLM instance.
 */
export function getGeminiModel(temperature: number = 0) {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: getNextGeminiKey(),
    maxOutputTokens: 2048,
    temperature,
  });
}

/**
 * Falls back to Gemini if GROK_API_KEY is not set.
 */
export function getGrokModel(temperature: number = 0) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === "your_grok_api_key_here") {
    return getGeminiModel(temperature);
  }
  try {
    return new ChatOpenAI({
      model: "grok-4.3",
      apiKey: apiKey,
      configuration: { baseURL: "https://api.x.ai/v1" },
      temperature,
    });
  } catch {
    return getGeminiModel(temperature);
  }
}
