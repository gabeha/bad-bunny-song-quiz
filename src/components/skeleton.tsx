import { cn } from "@/lib/utils.ts";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-gray-300/80", className)} />
  );
}

export function QuestionSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 bg-gray-100 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-1.5 flex-1" />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 py-2">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xs" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="mx-auto h-6 w-48" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export function RowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-2 border-gray-200 bg-white px-3 py-2"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}
