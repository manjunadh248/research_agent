import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, MessageSquareHeart } from "lucide-react";

export function NewsSentimentCard({ news, score }: { news: any[], score: number }) {
  if (!news || news.length === 0) return null;

  const formatScore = (s: number) => {
    if (s >= 7) return <Badge variant="success">Positive</Badge>;
    if (s <= 4) return <Badge variant="destructive">Negative</Badge>;
    return <Badge variant="warning">Neutral</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Newspaper className="h-4 w-4" /> Recent News & Sentiment
        </CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Overall:</span>
          {formatScore(score)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item, i) => (
            <div key={i} className="group p-3 rounded-lg border border-gray-800 bg-[#141419] hover:bg-[#1a1a20] transition-colors flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-medium text-sm text-gray-200 line-clamp-2 leading-tight">
                  {item.title}
                </h4>
                <div className="shrink-0">
                  {item.sentiment === "positive" && <span className="text-emerald-400 text-xs font-bold uppercase">Pos</span>}
                  {item.sentiment === "negative" && <span className="text-rose-400 text-xs font-bold uppercase">Neg</span>}
                  {item.sentiment === "neutral" && <span className="text-amber-400 text-xs font-bold uppercase">Neu</span>}
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
