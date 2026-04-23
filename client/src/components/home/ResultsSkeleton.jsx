import React from "react";

const ResultsSkeleton = () => {
  return (
    <div className="mt-8 space-y-6 animate-pulse">
      {/* Header Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-lg h-28">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-slate-100 rounded"></div>
              <div className="h-2 w-16 bg-slate-100 rounded"></div>
            </div>
            <div className="h-6 w-24 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Vector Results Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden h-[24rem]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="space-y-2">
                <div className="h-3 w-32 bg-slate-200 rounded"></div>
                <div className="h-2 w-20 bg-slate-100 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-2 w-[90%] bg-slate-100 rounded"></div>
              </div>
              <div className="h-40 w-full bg-slate-50 rounded border border-slate-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSkeleton;
