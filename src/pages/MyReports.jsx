import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";

import { useAsync } from "@/hooks/useAsync";
import { getMyReports, filterReports, sortReports } from "@/services/reports/reportsService";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportStats } from "@/components/reports/ReportStats";
import { ReportSearch } from "@/components/reports/ReportSearch";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReports, NoReportsMatch } from "@/components/reports/EmptyReports";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { ReportListSkeleton } from "@/components/reports/ReportSkeleton";
import { Button } from "@/components/ui/button";

export function MyReports() {
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  const { data, loading, error, reload } = useAsync(getMyReports, []);

  const items = useMemo(() => {
    if (!data) return [];
    const filtered = filterReports(data.items, { status, query });
    return sortReports(filtered, sort);
  }, [data, status, query, sort]);

  return (
    <CitizenLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText size={13} aria-hidden />
              CivicAI · Citizen Tracking
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-foreground">
              My Reports
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track every report from submission to community confirmation.
            </p>
          </div>
          <Button asChild>
            <Link to="/report?quick=1">
              <Plus size={15} />
              Report a Problem
            </Link>
          </Button>
        </div>

        <ReportStats stats={data?.stats} loading={loading} />

        {error ? (
          <ReportErrorState
            title="Unable to load your reports"
            message={error.message || "Please try again in a moment."}
            onRetry={reload}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <ReportFilters
                status={status}
                onStatusChange={setStatus}
                sort={sort}
                onSortChange={setSort}
                query={query}
                onQueryChange={setQuery}
              />
              <ReportSearch value={query} onChange={setQuery} className="w-full lg:w-72" />
            </div>

            {loading ? (
              <ReportListSkeleton count={5} />
            ) : items.length === 0 && (status !== "all" || query.trim()) ? (
              <NoReportsMatch onReset={() => { setStatus("all"); setSort("newest"); setQuery(""); }} />
            ) : items.length === 0 ? (
              <EmptyReports />
            ) : (
              <div className="space-y-3">
                {items.map((report, i) => (
                  <ReportCard key={report.id} report={report} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </CitizenLayout>
  );
}
