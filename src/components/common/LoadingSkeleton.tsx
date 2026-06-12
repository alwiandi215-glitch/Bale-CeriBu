export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/40"
        />
      ))}
    </div>
  );
}
