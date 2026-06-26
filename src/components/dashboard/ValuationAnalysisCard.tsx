import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export function ValuationAnalysisCard({ valuation, score }: { valuation: any, score: number }) {
  if (!valuation) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "undervalued": return "success";
      case "fairly valued": return "warning";
      case "overvalued": return "destructive";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Calculator className="h-4 w-4" /> Valuation Analysis
        </CardTitle>
        {valuation.status && (
          <Badge variant={getStatusColor(valuation.status)}>
            {valuation.status.toUpperCase()}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase">Trailing P/E</span>
            <p className="font-medium text-lg text-gray-200">{valuation.trailingPE?.toFixed(2) || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase">Forward P/E</span>
            <p className="font-medium text-lg text-gray-200">{valuation.forwardPE?.toFixed(2) || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase">PEG Ratio</span>
            <p className="font-medium text-lg text-gray-200">{valuation.pegRatio?.toFixed(2) || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase">Price to Book</span>
            <p className="font-medium text-lg text-gray-200">{valuation.priceToBook?.toFixed(2) || "N/A"}</p>
          </div>
        </div>

        {valuation.analysis && (
          <div className="pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400 leading-relaxed">
              {valuation.analysis}
            </p>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
