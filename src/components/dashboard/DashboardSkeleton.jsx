import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
      <Card><CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-2"><Skeleton className="h-5 w-44" /><Skeleton className="h-4 w-56" /></div><div className="flex gap-2"><Skeleton className="h-10 w-36" /><Skeleton className="h-10 w-28" /></div></CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item}><CardContent className="space-y-3 p-4"><Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-12" /></CardContent></Card>)}</div>
      <Card><CardContent className="space-y-3 p-5"><Skeleton className="h-5 w-40" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></CardContent></Card>
      <Card><CardContent className="space-y-3 p-5"><Skeleton className="h-5 w-44" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></CardContent></Card>
    </div>
  );
}

export function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
