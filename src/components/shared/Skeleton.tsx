export const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
    <div className="h-4 w-1/3 bg-muted rounded mb-4" />
    <div className="h-6 w-1/2 bg-muted rounded mb-2" />
    <div className="h-4 w-2/3 bg-muted rounded" />
  </div>
);

export const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <div className={`h-4 bg-muted rounded animate-pulse ${className}`} />
);
