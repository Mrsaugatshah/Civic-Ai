import { FileText, AlertCircle, Flame, Clock, CheckCircle2, Timer } from "lucide-react";

import { StatCard } from "@/components/civic/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/dashboard/SectionError";

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export function CityOverview({ data, loading, error, onRetry }) {
  return (
    <section id="overview" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">City Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            City-wide metrics across every active report.
          </p>
        </div>
        {data && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            Updated {timeAgo(data.updatedAt)}
          </span>
        )}
      </div>

      {error ? (
        <SectionError title="Couldn't load city overview" onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={FileText} label="Total Reports" value={data.stats.totalReports.toLocaleString()} tone="primary" />
          <StatCard icon={AlertCircle} label="Active Issues" value={data.stats.activeIssues} tone="info" />
          <StatCard icon={Flame} label="Critical" value={data.stats.criticalIssues} tone="error" />
          <StatCard icon={Timer} label="In Progress" value={data.stats.inProgress} tone="warning" />
          <StatCard icon={CheckCircle2} label="Resolved" value={data.stats.resolved.toLocaleString()} tone="success" />
          <StatCard icon={Clock} label="Avg. Resolution" value={`${data.stats.avgResolutionDays}d`} tone="ai" />
        </div>
      )}
    </section>
  );
}
