"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getSearchHistory } from "../../api/search.api";
import { Clock, History, Shield, ChevronRight } from "lucide-react";

const SearchHistory = ({ onSelectReport }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["searchHistory"],
    queryFn: getSearchHistory,
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) return <div className="text-slate-500 text-sm animate-pulse">Loading history...</div>;
  if (isError) return null;

  const history = data?.data || [];

  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-slate-300">
        <History size={20} />
        <h3 className="font-bold">Recent Intelligence</h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {history.map((report) => (
          <button
            key={report._id}
            onClick={() => {
              onSelectReport(report);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-white font-medium text-sm truncate max-w-[150px]">
                {report.targetName}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold ${
                  report.riskLevel === 'High' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {report.riskLevel}
                </span>
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Clock size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
