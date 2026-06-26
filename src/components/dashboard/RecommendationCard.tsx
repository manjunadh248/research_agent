"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, XCircle, AlertCircle, ChevronRight, X, Edit2, History } from "lucide-react";

export function RecommendationCard({ recommendation }: { recommendation: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualOverride, setManualOverride] = useState<string | null>(null);

  if (!recommendation) return null;

  const originalDecision = recommendation.decision;
  const decision = manualOverride || originalDecision;
  const { confidence, reasoning } = recommendation;

  const getConfig = (d: string) => ({
    INVEST: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
    WATCHLIST: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertCircle },
    PASS: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: XCircle },
  }[d as "INVEST" | "WATCHLIST" | "PASS"] || { color: "text-gray-400", bg: "bg-gray-800", border: "border-gray-700", icon: Target });

  const config = getConfig(decision);
  const originalConfig = getConfig(originalDecision);
  const Icon = config.icon;

  const handleOverride = (newDecision: string) => {
    setManualOverride(newDecision === originalDecision ? null : newDecision);
  };

  return (
    <>
      <Card 
        className={`border-2 ${config.border} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={`absolute top-0 left-0 w-full h-1 ${config.bg.replace('/10', '')}`} />
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4" /> Final Verdict
            {manualOverride && (
              <Badge variant="outline" className="text-[10px] ml-2 bg-blue-500/10 text-blue-400 border-blue-500/30">
                Overridden
              </Badge>
            )}
          </CardTitle>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1.5 rounded-full border border-gray-700">
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className={`p-4 rounded-full ${config.bg} relative`}>
              <Icon className={`h-12 w-12 ${config.color}`} />
              {manualOverride && (
                <div className="absolute -bottom-1 -right-1 bg-[#111] rounded-full p-1 border border-gray-700">
                  <Edit2 className="h-3 w-3 text-blue-400" />
                </div>
              )}
            </div>
            <h2 className={`text-4xl font-black tracking-tight ${config.color}`}>
              {decision}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm py-1 px-3">
                {confidence}% AI Confidence
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center justify-between">
              Key Reasoning
              <span className="text-xs text-gray-500 font-normal">Click to expand</span>
            </h4>
            <ul className="space-y-2">
              {reasoning?.slice(0, 2).map((reason: string, i: number) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2 line-clamp-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.bg.replace('/10', '')}`} />
                  <span>{reason}</span>
                </li>
              ))}
              {reasoning?.length > 2 && (
                <li className="text-xs text-gray-500 italic mt-2 text-center">
                  +{reasoning.length - 2} more reasons
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#111115] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-6 border-b border-gray-800 ${config.bg} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 z-10">
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className={`p-4 bg-[#111115] rounded-full border border-gray-800 shadow-lg`}>
                  <Icon className={`h-10 w-10 ${config.color}`} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Final Verdict</h2>
                  <div className="flex items-center gap-3">
                    <h1 className={`text-4xl font-black ${config.color}`}>{decision}</h1>
                    {manualOverride && <Badge className="bg-blue-600 text-white border-none">Manually Overridden</Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Detailed Reasoning */}
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-blue-400" />
                  AI Rationale
                </h3>
                <div className="space-y-4">
                  {reasoning?.map((reason: string, i: number) => (
                    <div key={i} className="bg-black/30 border border-gray-800/60 p-4 rounded-xl flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${originalConfig.bg.replace('/10', '')}`} />
                      <p className="text-gray-300 text-sm leading-relaxed">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Override Section */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-4">
                  <Edit2 className="h-4 w-4 text-gray-400" />
                  Manual Override
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Disagree with the AI? Override the recommendation for your personal watchlist.
                </p>
                <div className="flex gap-3">
                  {["INVEST", "WATCHLIST", "PASS"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOverride(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                        decision === opt 
                          ? getConfig(opt).bg + " " + getConfig(opt).border + " " + getConfig(opt).color
                          : "bg-[#1a1a20] border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {manualOverride && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => setManualOverride(null)}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      Reset to AI Recommendation ({originalDecision})
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

