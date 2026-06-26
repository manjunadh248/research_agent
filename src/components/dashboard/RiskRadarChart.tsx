import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function RiskRadarChart({ risks, score }: { risks: any, score: number }) {
  if (!risks) return null;

  // We map the textual risks to a dummy 0-10 scale for the radar chart based on overall score for demonstration
  // In a real scenario, the agent would score each risk category individually
  const baseScore = Math.min(Math.max(score, 1), 9);
  
  // Generating variance for visual interest
  const data = [
    { subject: "Market", A: (baseScore * 1.1) > 10 ? 10 : (baseScore * 1.1).toFixed(1), fullMark: 10 },
    { subject: "Debt", A: (baseScore * 0.9).toFixed(1), fullMark: 10 },
    { subject: "Competition", A: (baseScore * 0.8).toFixed(1), fullMark: 10 },
    { subject: "Regulatory", A: (baseScore * 1.2) > 10 ? 10 : (baseScore * 1.2).toFixed(1), fullMark: 10 },
    { subject: "Tech", A: baseScore.toFixed(1), fullMark: 10 },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#333" }} />
              <Radar name="Risk Safety" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3 pt-4 border-t border-gray-800 flex-1 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
          {Object.entries(risks).map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={key} className="space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
                <p className="text-sm text-gray-300 leading-tight">{String(value)}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
