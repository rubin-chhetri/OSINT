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

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 h-full animate-pulse shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 bg-slate-100 rounded"></div>
          <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-50 rounded-lg border border-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }
  if (isError) return null;

  const history = data?.data || [];

  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 h-full shadow-sm">
      <div className="flex items-center gap-2 mb-6 text-slate-900">
        <History size={18} className="text-slate-400" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Recent Discovery</h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
        {history.map((report) => (
          <button
            key={report._id}
            onClick={() => {
              onSelectReport(report);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-blue-500/30 rounded-lg transition-all group"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-slate-900 font-semibold text-sm truncate max-w-[150px]">
                {report.targetName}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold ${
                  report.riskLevel === 'High' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {report.riskLevel}
                </span>
                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Clock size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
