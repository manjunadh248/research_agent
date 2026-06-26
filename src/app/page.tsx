"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, TrendingUp, AlertTriangle, ShieldCheck, Newspaper, Building2, Timer, Activity, PieChart, Download, Bookmark, BookmarkCheck, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Sub-components that we will build next
import { FinancialMetricsCharts } from "@/components/dashboard/FinancialMetricsCharts";
import { RiskRadarChart } from "@/components/dashboard/RiskRadarChart";
import { CompanyOverviewCard } from "@/components/dashboard/CompanyOverviewCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { NewsSentimentCard } from "@/components/dashboard/NewsSentimentCard";
import { ValuationAnalysisCard } from "@/components/dashboard/ValuationAnalysisCard";
import TradingChart from "@/components/dashboard/TradingChart";
import { ChatWidget } from "@/components/dashboard/ChatWidget";

export default function DashboardPage() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState("Overview");
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("research_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRateLimited && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsRateLimited(false);
    }
    return () => clearTimeout(timer);
  }, [isRateLimited, countdown]);

  const toggleWatchlist = () => {
    if (!data) return;
    const exists = watchlist.find(item => item.ticker === data.ticker);
    let newWatchlist;
    if (exists) {
      newWatchlist = watchlist.filter(item => item.ticker !== data.ticker);
    } else {
      newWatchlist = [...watchlist, { 
        ticker: data.ticker, 
        name: data.companyOverview?.name || data.ticker,
        decision: data.recommendation?.decision || "UNKNOWN"
      }];
    }
    setWatchlist(newWatchlist);
    localStorage.setItem("research_watchlist", JSON.stringify(newWatchlist));
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.ticker}_Research_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;

    setLoading(true);
    setError("");
    setData(null);
    setIsRateLimited(false);
    setProgressSteps([]);
    setCurrentProgress("Connecting to agents...");

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: ticker }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to research agents.");
      }

      if (!response.body) {
        throw new Error("No response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr) {
                let parsed = null;
                try {
                  parsed = JSON.parse(dataStr);
                } catch (e) {
                  // ignore JSON parse errors for incomplete chunks
                }
                
                if (parsed) {
                  if (parsed.type === "progress") {
                    setCurrentProgress(parsed.step);
                    setProgressSteps(prev => {
                      if (prev.includes(parsed.step)) return prev;
                      return [...prev, parsed.step];
                    });
                    if (parsed.ticker && parsed.ticker !== ticker) {
                      setTicker(parsed.ticker);
                    }
                  } else if (parsed.type === "complete") {
                    setData(parsed.data);
                    setLoading(false);
                  } else if (parsed.type === "error") {
                    throw new Error(parsed.error);
                  }
                }
              }
            }
          }
        }
      }
      
      // If stream ends without setting data, ensure we stop loading
      if (done) setLoading(false);
    } catch (err: any) {
      const errMsg = err.message || "";
      if (errMsg.includes("RATE_LIMIT") || errMsg.toLowerCase().includes("429") || errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("too many requests")) {
        setIsRateLimited(true);
        setCountdown(60); // 60 second wait based on the backend retry logs
        setError("API rate limit exceeded. Please wait before analyzing another company.");
      } else {
        setError(errMsg || "An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  // Navigation Tabs
  const tabs = [
    { id: "Overview", icon: Building2 },
    { id: "Market Data", icon: Activity },
    { id: "Financials", icon: PieChart },
    { id: "Risk & News", icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      
      {/* Navigation Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0a0a0c] p-4 flex flex-col justify-between shrink-0 relative z-20">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2 mt-4">
             <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)]">
               <TrendingUp className="h-6 w-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Research AI</h1>
               <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Pro Terminal</p>
             </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!data && !loading}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${!data && !loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,1)]"></div>}
                  {isActive && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>}
                  <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">{tab.id}</span>
                </button>
              );
            })}
          </nav>
          
          {watchlist.length > 0 && (
            <div className="mt-8 animate-in fade-in">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-3 flex items-center gap-2">
                <History className="h-3 w-3" /> Watchlist
              </h3>
              <div className="space-y-1">
                {watchlist.map(item => {
                  const isPositive = item.decision === "INVEST";
                  const isNeutral = item.decision === "WATCHLIST";
                  return (
                    <div key={item.ticker} className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800/50 cursor-pointer group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{item.ticker}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${isPositive ? 'bg-emerald-500' : isNeutral ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-4 py-6 border-t border-gray-800/50">
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold border border-gray-700">
               USR
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-medium">Pro User</span>
               <span className="text-xs text-green-400 flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div> System Online</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-24 border-b border-gray-800 bg-[#0a0a0c]/90 backdrop-blur-md px-8 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
            {data ? (
              <>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black tracking-tight text-white">
                      {data.companyOverview?.name || data.companyOverview?.longBusinessSummary?.split('.')[0] || data.ticker}
                    </h2>
                    <span className="text-blue-400 font-bold text-xl bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 rounded-lg shadow-inner">
                      {data.ticker}
                    </span>
                  </div>
                  <div className="text-gray-400 mt-1 font-medium text-sm flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> 
                    {data.companyOverview?.sector || "Technology"} • {data.companyOverview?.industry || "Software"}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-6 pl-6 border-l border-gray-800">
                  <button 
                    onClick={toggleWatchlist}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-sm font-medium transition-colors"
                  >
                    {watchlist.some(w => w.ticker === data.ticker) ? (
                      <><BookmarkCheck className="h-4 w-4 text-blue-400" /> Saved</>
                    ) : (
                      <><Bookmark className="h-4 w-4 text-gray-400" /> Save</>
                    )}
                  </button>
                  <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4 text-gray-400" /> Export JSON
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500 font-medium flex flex-col">
                <span className="text-lg text-gray-300">Ready for Analysis</span>
                <span className="text-sm">Enter a stock ticker on the right to begin</span>
              </div>
            )}
          </div>

          <form onSubmit={handleResearch} className="relative w-[400px] group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>
            <div className="relative flex items-center bg-[#111115] border border-gray-700 rounded-xl pl-4 pr-2 py-2 focus-within:border-blue-500 group-hover:border-blue-500 transition-colors shadow-inner">
              <input
                type="text"
                placeholder="Search ticker (e.g., AAPL, NVDA)..."
                className="w-full bg-transparent text-white placeholder-gray-500 outline-none px-2 text-base h-10"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                disabled={loading || !ticker}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-0 disabled:pointer-events-none text-white p-2 rounded-lg transition-all flex items-center justify-center h-10 w-10 ml-2"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          
          {/* Error Banner */}
          {error && !loading && (
            <div className={`mb-8 border rounded-xl p-6 text-center animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg ${isRateLimited ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {isRateLimited ? (
                <div className="flex flex-col items-center gap-3">
                  <Timer className="h-10 w-10 mx-auto mb-1 opacity-90 animate-pulse text-amber-400" />
                  <h3 className="text-xl font-bold text-amber-500">Rate Limit Exceeded</h3>
                  <p className="max-w-md mx-auto">{error}</p>
                  <div className="mt-4 bg-amber-500/20 px-6 py-3 rounded-full border border-amber-500/30 flex items-center gap-3">
                    <span className="font-semibold text-amber-300">Cooldown Timer:</span>
                    <span className="text-2xl font-mono font-bold text-amber-400">{countdown}s</span>
                  </div>
                </div>
              ) : (
                <>
                  <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-80" />
                  <p className="font-medium">{error}</p>
                </>
              )}
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/30 animate-pulse"></div>
                <Loader2 className="h-16 w-16 animate-spin text-blue-500 relative z-10" />
              </div>
              <div className="bg-[#111115] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
                <h3 className="text-xl font-bold text-white text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {currentProgress}
                </h3>
                {progressSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm animate-in slide-in-from-left-4 duration-300">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]"></div>
                    <span className="text-gray-300 font-medium">{step}</span>
                  </div>
                ))}
                {progressSteps.length > 0 && (
                  <div className="flex items-center gap-3 text-sm opacity-60 animate-pulse mt-4">
                    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                    <span className="text-gray-400">Processing next agent...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content Areas */}
          {data && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "Overview" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ScoreWidget title="Financial Health" score={data.scores?.financialHealth} icon={Building2} color="blue" />
                    <ScoreWidget title="Growth Potential" score={data.scores?.growthPotential} icon={TrendingUp} color="emerald" />
                    <ScoreWidget title="News Sentiment" score={data.scores?.newsSentiment} icon={Newspaper} color="purple" />
                    <ScoreWidget title="Risk Profile" score={data.scores?.riskProfile} icon={ShieldCheck} color="amber" />
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <RecommendationCard recommendation={data.recommendation} />
                    <CompanyOverviewCard overview={data.companyOverview} />
                  </div>
                </div>
              )}

              {/* --- MARKET DATA TAB --- */}
              {activeTab === "Market Data" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <ValuationAnalysisCard valuation={data.valuation} score={data.scores?.valuation} />
                  <div className="w-full h-[600px] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                     <TradingChart symbol={data.ticker} />
                  </div>
                </div>
              )}

              {/* --- FINANCIALS TAB --- */}
              {activeTab === "Financials" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <FinancialMetricsCharts financials={data.financials} />
                  {/* Expanded Financial Details could go here */}
                </div>
              )}

              {/* --- RISK & NEWS TAB --- */}
              {activeTab === "Risk & News" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500">
                  <RiskRadarChart risks={data.risks} score={data.scores?.riskProfile} />
                  <NewsSentimentCard news={data.news} score={data.scores?.newsSentiment} />
                </div>
              )}

            </div>
          )}

        </main>
        
        {data && <ChatWidget contextData={data} />}
      </div>
    </div>
  );
}

function ScoreWidget({ title, score, icon: Icon, color }: any) {
  const validScore = score || 0;
  
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  };
  
  const progressColors: Record<string, string> = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
  };

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:brightness-125 cursor-pointer ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-black/20 backdrop-blur-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-black text-2xl">{validScore.toFixed(1)}<span className="text-sm opacity-50 font-normal">/10</span></span>
      </div>
      <div className="space-y-2 mt-2">
        <p className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</p>
        <Progress value={validScore * 10} indicatorClassName={progressColors[color]} className="h-2 bg-black/40 rounded-full" />
      </div>
    </div>
  );
}

