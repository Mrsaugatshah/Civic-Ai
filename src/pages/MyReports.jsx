import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2, Plus } from "lucide-react";

import { getMyReports } from "@/services/reports/reportsService";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportStats } from "@/components/reports/ReportStats";
import { ReportSearch } from "@/components/reports/ReportSearch";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReports, NoReportsMatch } from "@/components/reports/EmptyReports";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { ReportListSkeleton } from "@/components/reports/ReportSkeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export function MyReports() {
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(async ({ page = 1, append = false } = {}) => {
    const id = ++requestId.current;
    if (append) setLoadingMore(true);
    else { setLoading(true); setData(null); }
    setError(null);
    try {
      const next = await getMyReports({ page, limit: PAGE_SIZE, status, sort, query });
      if (id !== requestId.current) return;
      setData((current) => append ? { ...next, items: [...(current?.items || []), ...next.items] } : next);
    } catch (loadError) {
      if (id === requestId.current) setError(loadError);
    } finally {
      if (id === requestId.current) { setLoading(false); setLoadingMore(false); }
    }
  }, [query, sort, status]);

  useEffect(() => {
    requestId.current += 1;
    const timer = setTimeout(() => load(), query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const reset = () => { setStatus("all"); setSort("newest"); setQuery(""); };
  const items = data?.items || [];
  const filtered = status !== "all" || query.trim();

  return <CitizenLayout><div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><FileText size={13} aria-hidden/>CivicAI · Citizen Tracking</p><h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-foreground">My Reports</h1><p className="mt-1 text-sm text-muted-foreground">Track every report from submission to community confirmation.</p></div><Button asChild><Link to="/report?quick=1"><Plus size={15}/>Report a Problem</Link></Button></div>
    <ReportStats stats={data?.stats} loading={loading && !data}/>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><ReportFilters status={status} onStatusChange={setStatus} sort={sort} onSortChange={setSort} query={query} onQueryChange={setQuery}/><ReportSearch value={query} onChange={setQuery} className="w-full lg:w-72"/></div>
    {error && !data ? <ReportErrorState title="Unable to load your reports" message={error.message || "Please try again in a moment."} onRetry={() => load()}/> : loading ? <ReportListSkeleton count={5}/> : items.length === 0 && filtered ? <NoReportsMatch onReset={reset}/> : items.length === 0 ? <EmptyReports/> : <>
      {error && (
        <ReportErrorState
          title="Unable to load more reports"
          message={error.message}
          onRetry={() => load({ page: (data?.pagination?.page || 1) + 1, append: true })}
        />
      )}
      <div className="space-y-3">{items.map((report, index) => <ReportCard key={report.id} report={report} index={index}/>)}</div>
      {data?.pagination?.hasMore && <div className="flex justify-center"><Button variant="outline" disabled={loadingMore} onClick={() => load({ page: data.pagination.page + 1, append: true })}>{loadingMore && <Loader2 className="animate-spin" size={15}/>} {loadingMore ? "Loading…" : `Load more (${data.pagination.total - items.length} remaining)`}</Button></div>}
      <p className="text-center text-xs text-muted-foreground">Showing {items.length} of {data?.pagination?.total ?? items.length} matching reports</p>
    </>}
  </div></CitizenLayout>;
}
