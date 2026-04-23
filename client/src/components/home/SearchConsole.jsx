"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { performOsintSearch, exportReportMarkdown } from "../../api/search.api";
import { Search, Loader2, ShieldAlert, Download, Globe } from "lucide-react";

const SearchConsole = ({ onResultsFound, onLoadingChange }) => {
  const [query, setQuery] = useState("");

  const queryClient = useQueryClient();
  const searchMutation = useMutation({
    mutationFn: performOsintSearch,
    onMutate: () => {
      if (onLoadingChange) onLoadingChange(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
      if (onResultsFound) onResultsFound(data.data);
      if (onLoadingChange) onLoadingChange(false);
    },
    onError: () => {
      if (onLoadingChange) onLoadingChange(false);
    },
  });


  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6">
      <form onSubmit={handleSearch} className="flex flex-col md:block relative group gap-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {searchMutation.isPending ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-slate-500 transition-colors" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter target name or domain..."
            className="block w-full pl-12 pr-4 md:pr-32 py-4 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg focus:border-blue-500/50 transition-all outline-none text-sm md:text-base shadow-sm"
          />

          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="hidden md:flex absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold rounded-md transition-colors items-center gap-2 text-xs tracking-wider"
          >
            {searchMutation.isPending ? "SCANNING..." : "RUN INTELLIGENCE"}
          </button>
        </div>

        {/* Mobile Search Button */}
        <button
          type="submit"
          disabled={searchMutation.isPending}
          className="flex md:hidden w-full justify-center py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-bold rounded-lg transition-all items-center gap-2"
        >
          {searchMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {searchMutation.isPending ? "RUNNING DISCOVERY..." : "RUN INTELLIGENCE"}
        </button>
      </form>


      {/* Error Feedback */}
      {searchMutation.isError && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
          <ShieldAlert size={20} />
          <p className="text-sm">
            {searchMutation.error?.response?.data?.message ||
              "Search failed. Please check your API keys."}
          </p>
        </div>
      )}

      {/* Quick Status Info */}
      {searchMutation.isPending && (
        <div className="mt-6 flex justify-center items-center gap-8 text-slate-400 text-xs uppercase tracking-widest animate-pulse">
          <div className="flex items-center gap-2">
            <Globe size={14} /> Google Search
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} /> Whois Records
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} /> GitHub Repos
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchConsole;
