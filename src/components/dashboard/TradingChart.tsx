"use client";

import { useEffect, useRef, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";

function TradingChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent duplicate injections during React strict mode or HMR
    if (!container.current || container.current.querySelector("script")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol || "NASDAQ:AAPL",
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // 1 = Candles, 2 = Line, 3 = Area
      locale: "en",
      enable_publishing: false,
      backgroundColor: "#16161b", // match our card background
      gridColor: "#222",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_chart",
      support_host: "https://www.tradingview.com"
    });
    
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <Card className="flex flex-col h-[600px] w-full overflow-hidden border-gray-800">
      <div className="px-6 py-4 border-b border-gray-800 bg-[#16161b] flex items-center gap-2">
        <LineChart className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-gray-200 tracking-wide uppercase">Interactive Market Data</h3>
      </div>
      <CardContent className="p-0 flex-1 bg-[#16161b]">
        <div 
          className="tradingview-widget-container" 
          ref={container} 
          style={{ height: "100%", width: "100%" }}
        >
          <div 
            className="tradingview-widget-container__widget" 
            style={{ height: "calc(100% - 32px)", width: "100%" }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent re-rendering and re-injecting the script unnecessarily
export default memo(TradingChart);
