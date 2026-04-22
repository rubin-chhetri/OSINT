"use client";
import { useState } from "react";
import SearchConsole from "@/components/home/SearchConsole";
import ResultsDashboard from "@/components/home/ResultsDashboard";
import SearchHistory from "@/components/home/SearchHistory";
import { FileText, Zap } from "lucide-react";

export default function Dashboard() {
  const [report, setReport] = useState(null);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#020617] text-slate-200">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center py-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Zap size={14} /> OSINT v2.0 Live
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Intelligence <span className="text-blue-500">Console</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Resolve cross-vector entities across social, technical, and contextual data lakes with high-fidelity matching algorithms.
          </p>
        </section>

        {/* Search UI */}
        <SearchConsole onResultsFound={(data) => setReport(data)} />

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
          {/* Main Results Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            {report ? (
              <ResultsDashboard report={report} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-slate-800 rounded-[2rem] bg-slate-900/10 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                  <FileText size={64} className="relative mb-6 text-slate-700 animate-pulse" />
                </div>
                <p className="text-slate-500 font-semibold text-lg">
                  Awaiting scan command...
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Enter a target above to begin deep discovery.
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

