import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card space-y-5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-7 w-7 rounded-lg" />
          </div>
          <div className="skeleton h-9 w-28" />
          <div className="flex justify-between border-t border-line/[0.06] pt-4">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 4, cols = 5 }) => {
  return (
    <div className="divide-y divide-line/[0.05]">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center justify-between gap-4 px-1 py-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-40 max-w-full" />
              <div className="skeleton h-2.5 w-56 max-w-full" />
            </div>
          </div>
          {Array.from({ length: Math.max(0, cols - 3) }).map((_, cIdx) => (
            <div key={cIdx} className="skeleton hidden h-3 w-20 sm:block" />
          ))}
          <div className="skeleton h-7 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="card space-y-6 rounded-xl p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2.5">
          <div className="skeleton h-5 w-48 max-w-full" />
          <div className="skeleton h-3 w-72 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-line/[0.06] pt-6 sm:grid-cols-2">
        <div className="skeleton h-28 rounded-lg" />
        <div className="skeleton h-28 rounded-lg" />
      </div>
      <div className="skeleton h-40 rounded-lg" />
    </div>
  );
};
