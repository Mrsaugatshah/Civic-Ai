import { ClipboardList, Flame, Clock, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/civic/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/dashboard/SectionError";

export function DepartmentOverview({ data, loading, error, onRetry }) {
  const { user } = useAuth();
  const department = user?.department || "Your Department";

  return (
    <section id="overview" className="scroll-mt-24">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Department Operations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{department}</p>
      </div>

      {error ? (
        <SectionError title="Unable to load department overview" onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ClipboardList} label="Assigned" value={data.assigned} tone="primary" />
          <StatCard icon={Flame} label="High Priority" value={data.highPriority} tone="error" />
          <StatCard icon={Clock} label="In Progress" value={data.inProgress} tone="warning" />
          <StatCard icon={CheckCircle2} label="Completed" value={data.completed} tone="success" />
        </div>
      )}
    </section>
  );
}
