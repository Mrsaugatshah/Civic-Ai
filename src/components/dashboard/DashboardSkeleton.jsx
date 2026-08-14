import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-5">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-7">
        <CardContent className="flex items-center gap-6 p-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-5">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-7">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
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
