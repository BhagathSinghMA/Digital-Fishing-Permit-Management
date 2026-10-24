import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
      <div className="bg-slate-50 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 mt-1" />
      <Skeleton className="h-3 w-36 mt-1" />
    </div>
  );
};
