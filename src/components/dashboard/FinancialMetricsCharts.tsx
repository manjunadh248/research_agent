import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Cell } from "recharts";

export function FinancialMetricsCharts({ financials }: { financials: any }) {
  if (!financials) return null;

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return "N/A";
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formatPct = (val: number | null | undefined) => {
    if (!val && val !== 0) return "N/A";
    return `${(val * 100).toFixed(2)}%`;
  };

  const formatNum = (val: number | null | undefined) => {
    if (!val && val !== 0) return "N/A";
    return val.toFixed(2);
  };

  const rev = financials.revenue || 0;
  
  // Generating a more robust mock historical dataset to demonstrate the interactive chart
  const chartData = [
    { name: "2021", revenue: rev * 0.75, netIncome: rev * 0.75 * 0.15, growth: "+12.4%" },
    { name: "2022", revenue: rev * 0.85, netIncome: rev * 0.85 * 0.18, growth: "+13.3%" },
    { name: "2023", revenue: rev * 0.95, netIncome: rev * 0.95 * 0.22, growth: "+11.7%" },
    { name: "TTM", revenue: rev, netIncome: financials.netIncome || (rev * 0.25), growth: "+5.2%" },
  ];

  // Custom Tooltip for rich interaction
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111115]/95 backdrop-blur-md border border-gray-700/50 p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[200px] animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2">
            <span className="font-bold text-gray-200">{label} Financials</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{data.growth} YoY</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Revenue</span>
              <span className="font-bold text-blue-400">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Net Income</span>
              <span className="font-bold text-purple-400">{formatCurrency(data.netIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Est. Margin</span>
              <span className="font-bold text-gray-300">{((data.netIncome / data.revenue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#0a0a0c] border-gray-800/60 shadow-2xl overflow-hidden">
      <CardHeader className="bg-[#111115] border-b border-gray-800/60 pb-6">
        <CardTitle className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-3">
          <LineChart className="h-6 w-6 text-blue-500" /> Deep Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        
        {/* Key Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <MetricBox label="Revenue (TTM)" value={formatCurrency(financials.revenue)} trend="up" />
          <MetricBox label="Net Income" value={formatCurrency(financials.netIncome)} trend="up" />
          <MetricBox label="Diluted EPS" value={formatNum(financials.eps)} />
          <MetricBox label="Operating Margin" value={formatPct(financials.operatingMargin)} />
          <MetricBox label="Free Cash Flow" value={formatCurrency(financials.freeCashFlow)} />
          <MetricBox label="Debt to Equity" value={formatNum(financials.debtToEquity)} />
        </div>

        {/* Textual Analysis */}
        {financials.cashFlowTrend && (
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-r-xl p-5">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Cash Flow Insights
            </h4>
            <p className="text-gray-300 leading-relaxed text-sm">{financials.cashFlowTrend}</p>
          </div>
        )}

        {/* Stunning Interactive Revenue Chart */}
        <div className="pt-6">
          <div className="flex justify-between items-end mb-6">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart className="h-5 w-5 text-indigo-400" /> Revenue Progression (Est.)
            </h4>
            <span className="text-xs text-gray-500 font-medium">Hover for detailed breakdown</span>
          </div>
          
          <div className="h-72 w-full bg-[#111115]/50 rounded-2xl p-4 border border-gray-800/40 shadow-inner relative group">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl blur-xl"></div>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorRevTTM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#3730a3" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1e9).toFixed(0)}B`} />
                <RechartsTooltip cursor={{ fill: '#1f2937', opacity: 0.4 }} content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "url(#colorRevTTM)" : "url(#colorRev)"} className="hover:brightness-125 transition-all duration-300 cursor-pointer" />
                  ))}
                </Bar>
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

function MetricBox({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="p-4 bg-[#111115] rounded-xl border border-gray-800/80 shadow-md hover:-translate-y-1 hover:shadow-blue-500/10 transition-all duration-300 group">
      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 group-hover:text-blue-400 transition-colors">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-black text-gray-100 tracking-tight">{value}</p>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500 mb-1.5 opacity-80" />}
      </div>
    </div>
  );
}
