import YahooFinance from "yahoo-finance2";

// yahoo-finance2 v3 requires instantiation
const yf = new YahooFinance();

export async function getCompanyProfile(ticker: string) {
  try {
    const result = await yf.quoteSummary(ticker, {
      modules: ["assetProfile", "price"],
    }) as any;
    return {
      description: result.assetProfile?.longBusinessSummary,
      industry: result.assetProfile?.industry,
      sector: result.assetProfile?.sector,
      ceo: result.assetProfile?.companyOfficers?.find((o: any) => o.title?.toLowerCase().includes("ceo"))?.name,
      website: result.assetProfile?.website,
      marketCap: result.price?.marketCap,
    };
  } catch (error) {
    console.error(`Error fetching company profile for ${ticker}:`, error);
    return null;
  }
}

export async function getFinancialData(ticker: string) {
  try {
    const result = await yf.quoteSummary(ticker, {
      modules: ["financialData", "defaultKeyStatistics", "incomeStatementHistory", "cashflowStatementHistory", "balanceSheetHistory"],
    }) as any;
    
    return {
      revenue: result.financialData?.totalRevenue,
      revenueGrowth: result.financialData?.revenueGrowth,
      netIncome: result.incomeStatementHistory?.incomeStatementHistory?.[0]?.netIncome,
      eps: result.defaultKeyStatistics?.trailingEps,
      operatingMargin: result.financialData?.operatingMargins,
      freeCashFlow: result.financialData?.freeCashflow,
      debtToEquity: result.financialData?.debtToEquity,
      currentRatio: result.financialData?.currentRatio,
      returnOnEquity: result.financialData?.returnOnEquity,
    };
  } catch (error) {
    console.error(`Error fetching financial data for ${ticker}:`, error);
    return null;
  }
}

export async function getValuationMetrics(ticker: string) {
  try {
    const result = await yf.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    }) as any;
    
    return {
      trailingPE: result.summaryDetail?.trailingPE,
      forwardPE: result.summaryDetail?.forwardPE,
      pegRatio: result.defaultKeyStatistics?.pegRatio,
      priceToBook: result.defaultKeyStatistics?.priceToBook,
    };
  } catch (error) {
    console.error(`Error fetching valuation metrics for ${ticker}:`, error);
    return null;
  }
}

export async function getNews(ticker: string) {
  try {
    const result = await yf.search(ticker, { newsCount: 5 }) as any;
    return result.news.map((item: any) => ({
      title: item.title,
      link: item.link,
      publisher: item.publisher,
      providerPublishTime: item.providerPublishTime,
    }));
  } catch (error) {
    console.error(`Error fetching news for ${ticker}:`, error);
    return [];
  }
}

export async function searchTicker(query: string): Promise<string | null> {
  try {
    const result = await yf.search(query, { quotesCount: 1, newsCount: 0 }) as any;
    const quotes = result.quotes;
    if (quotes && quotes.length > 0) {
      // Find the first equity or return the first result
      const equity = quotes.find((q: any) => q.quoteType === "EQUITY") || quotes[0];
      return equity.symbol;
    }
    return null;
  } catch (error) {
    console.error(`Error searching ticker for ${query}:`, error);
    return null;
  }
}
