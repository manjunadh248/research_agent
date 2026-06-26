import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Building, User } from "lucide-react";

export function CompanyOverviewCard({ overview }: { overview: any }) {
  if (!overview) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Building className="h-4 w-4" /> Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><Briefcase className="h-3 w-3" /> Sector</span>
            <p className="font-medium text-sm text-gray-200">{overview.sector || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><Building className="h-3 w-3" /> Industry</span>
            <p className="font-medium text-sm text-gray-200">{overview.industry || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><User className="h-3 w-3" /> CEO</span>
            <p className="font-medium text-sm text-gray-200">{overview.ceo || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-gray-500 uppercase">Market Cap</span>
            <p className="font-medium text-sm text-gray-200">
              {overview.marketCap ? `$${(overview.marketCap / 1e9).toFixed(2)}B` : "N/A"}
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Business Model</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {overview.description || "No description available."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
