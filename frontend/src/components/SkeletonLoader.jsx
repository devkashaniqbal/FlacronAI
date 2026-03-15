import React from 'react';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`skeleton ${width} ${height}`} />
);

export const SkeletonCard = ({ rows = 3 }) => (
  <div className="card p-6 space-y-3">
    <SkeletonLine height="h-5" width="w-3/4" />
    {[...Array(rows - 1)].map((_, i) => (
      <SkeletonLine key={i} height="h-3" width={i === rows - 2 ? 'w-1/2' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {[...Array(cols)].map((_, i) => <SkeletonLine key={i} height="h-3" width="w-3/4" />)}
    </div>
    {[...Array(rows)].map((_, r) => (
      <div key={r} className="grid gap-4 border-b border-[#e5e7eb] pb-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, c) => <SkeletonLine key={c} height="h-4" width={c === 0 ? 'w-2/3' : 'w-full'} />)}
      </div>
    ))}
  </div>
);

export const SkeletonReport = () => (
  <div className="space-y-4">
    <SkeletonLine height="h-8" width="w-2/3" />
    <SkeletonLine height="h-4" />
    <SkeletonLine height="h-4" width="w-5/6" />
    <SkeletonLine height="h-4" width="w-4/5" />
    <div className="pt-2 space-y-2">
      <SkeletonLine height="h-6" width="w-1/3" />
      <SkeletonLine height="h-4" />
      <SkeletonLine height="h-4" width="w-5/6" />
      <SkeletonLine height="h-4" width="w-4/6" />
    </div>
    <div className="pt-2 space-y-2">
      <SkeletonLine height="h-6" width="w-1/4" />
      <SkeletonLine height="h-4" />
      <SkeletonLine height="h-4" width="w-5/6" />
    </div>
  </div>
);

const SkeletonLoader = ({ type = 'card', count = 1, ...props }) => {
  const Component = type === 'table' ? SkeletonTable : type === 'report' ? SkeletonReport : SkeletonCard;
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => <Component key={i} {...props} />)}
    </div>
  );
};

export default SkeletonLoader;
