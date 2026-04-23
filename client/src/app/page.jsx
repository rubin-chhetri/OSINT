"use client";
import { useState } from "react";
import SearchConsole from "@/components/home/SearchConsole";
import ResultsDashboard from "@/components/home/ResultsDashboard";
import ResultsSkeleton from "@/components/home/ResultsSkeleton";
import SearchHistory from "@/components/home/SearchHistory";
import { FileText, Zap } from "lucide-react";

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-12 pb-24 px-6 md:px-12 text-[#0f172a]">
      <div className="max-w-7xl mx-auto">
        {/* Pro Header: Left Aligned, Monochrome */}
        <header className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight mb-2">
                Intelligence Console
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl">
                Advanced OSINT discovery engine with multi-vector identity resolution and risk scoring.
              </p>
            </div>
            {report && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Session Active
              </div>
            )}
          </div>
        </header>

        {/* Console Search: Utility Width */}
        <div className="max-w-3xl mb-12">
          <SearchConsole 
            onResultsFound={(data) => setReport(data)} 
            onLoadingChange={(loading) => setIsLoading(loading)}
          />
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
          {/* Main Results Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            {isLoading ? (
              <ResultsSkeleton />
            ) : report ? (
              <ResultsDashboard report={report} />
            ) : (
              <div className="bg-white border border-slate-200 shadow-sm p-16 text-center border-dashed rounded-2xl flex flex-col items-center justify-center h-[400px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400">
                  <FileText size={32} />
                </div>
                <h3 className="text-[#0f172a] font-semibold text-lg">No Active Investigation</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Enter a target name, domain, or identifier above to begin automated discovery.
                </p>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <SearchHistory onSelectReport={(prevReport) => setReport(prevReport)} />
          </div>
        </div>
      </div>
    </main>
  );
}

