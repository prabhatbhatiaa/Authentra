import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-slate-800 rounded" />
            <div className="h-4 w-12 bg-slate-800/60 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-700/60 rounded" />
          <div className="pt-2 border-t border-slate-800/50 flex justify-between">
            <div className="h-3 w-16 bg-slate-800/80 rounded" />
            <div className="h-3 w-16 bg-slate-800/80 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 4, cols = 5 }) => {
  return (
    <div className="divide-y divide-slate-800/60 font-mono text-xs">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-36 bg-slate-800 rounded" />
            <div className="h-2.5 w-48 bg-slate-850 rounded" />
          </div>
          {Array.from({ length: cols - 2 }).map((_, cIdx) => (
            <div key={cIdx} className="hidden sm:block h-3 w-20 bg-slate-800/60 rounded" />
          ))}
          <div className="h-6 w-16 bg-slate-800/80 rounded" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-800 rounded" />
          <div className="h-3 w-64 bg-slate-850 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
        <div className="h-16 rounded-xl bg-slate-950/60 border border-slate-800/50" />
        <div className="h-16 rounded-xl bg-slate-950/60 border border-slate-800/50" />
      </div>
    </div>
  );
};
