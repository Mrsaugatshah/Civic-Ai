import { Skeleton } from "@/components/ui/skeleton";

export function ReportCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3.5 shadow-soft sm:p-4">
      <div className="flex gap-3.5">
        <Skeleton className="hidden h-20 w-24 shrink-0 rounded-md sm:block" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-1.5 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading reports">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading status timeline">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading before and after photos">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
