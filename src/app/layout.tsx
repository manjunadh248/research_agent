import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Investment Research Agent",
  description: "Enter a company ticker and get a comprehensive AI-driven investment analysis with a final INVEST, WATCHLIST, or PASS recommendation.",
  keywords: ["investment research", "AI", "stock analysis", "LangGraph", "financial analysis"],
  openGraph: {
    title: "AI Investment Research Agent",
    description: "Comprehensive AI-driven investment research with multi-agent analysis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full relative z-10">{children}</body>
    </html>
  );
}
