import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Loader2, MapPin, Plus } from "lucide-react";

import { getMyReports } from "@/services/reports/reportsService";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { EmptyReports, NoReportsMatch } from "@/components/reports/EmptyReports";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { ReportListSkeleton } from "@/components/reports/ReportSkeleton";
import { formatShortDate } from "@/components/reports/format";
import { reportCategoryMeta } from "@/components/reports/reportMeta";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;
const STAGES = [["submitted", "Received"], ["under_review", "Under Review"], ["in_progress", "In Progress"], ["resolved", "Completed"]];

function Progress({ status }) {
  const current = status === "closed" ? "resolved" : status;
  const index = Math.max(0, STAGES.findIndex(([key]) => key === current));
  return <div className="mt-3 flex items-center text-[10px] font-medium text-muted-foreground">{STAGES.map(([key, label], step) => <div key={key} className="flex min-w-0 flex-1 items-center last:flex-none"><span className={step <= index ? "text-primary" : ""}>{label}</span>{step < STAGES.length - 1 && <span className={`mx-2 h-px flex-1 ${step < index ? "bg-primary/50" : "bg-border"}`} />}</div>)}</div>;
}

function MyReportRow({ report }) {
  const meta = reportCategoryMeta(report.category);
  const Icon = meta.icon;
  return <article className="rounded-xl border bg-card p-4 shadow-soft"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}><Icon size={17} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="truncate font-display text-base font-semibold text-foreground">{report.title}</h2><p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"><span>{report.categoryLabel || meta.label}</span><span aria-hidden>•</span><span className="inline-flex items-center gap-1"><MapPin size={10} />{report.location || "Community"}</span></p></div><ReportStatusBadge status={report.status} className="px-2 py-0.5 text-[10px]" /></div><p className="mt-2 text-xs text-muted-foreground">Reported {formatShortDate(report.reportedAt)}</p><Progress status={report.status} /><div className="mt-3 flex justify-end"><Link to={`/reports/${report.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">View Report <ArrowRight size={13} /></Link></div></div></div></article>;
}

export function MyReports() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const load = useCallback(async ({ page = 1, append = false } = {}) => { const id = ++requestId.current; if (append) setLoadingMore(true); else setLoading(true); setError(null); try { const next = await getMyReports({ page, limit: PAGE_SIZE, status, query }); if (id !== requestId.current) return; setData((current) => append ? { ...next, items: [...(current?.items || []), ...next.items] } : next); } catch (nextError) { if (id === requestId.current) setError(nextError); } finally { if (id === requestId.current) { setLoading(false); setLoadingMore(false); } } }, [query, status]);
  useEffect(() => { requestId.current += 1; const timer = setTimeout(() => load(), query ? 250 : 0); return () => clearTimeout(timer); }, [load, query]);
  const items = data?.items || [];
  const filtered = Boolean(query.trim() || status !== "all");
  const reset = () => { setQuery(""); setStatus("all"); };
  return <CitizenLayout><div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Reports</h1><p className="mt-1 text-sm text-muted-foreground">Track your reports from submission to completion.</p></div><Button asChild><Link to="/report"><Plus size={15} />Report an Issue</Link></Button></header><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search my reports" aria-label="Search my reports" className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter my reports by status" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="all">All statuses</option><option value="submitted">Received</option><option value="under_review">Under Review</option><option value="in_progress">In Progress</option><option value="resolved">Completed</option></select></div>{error && !data ? <ReportErrorState title="Unable to load your reports" message={error.message} onRetry={() => load()} /> : loading ? <ReportListSkeleton count={4} /> : items.length === 0 && filtered ? <NoReportsMatch onReset={reset} /> : items.length === 0 ? <EmptyReports title="No reports yet" description="Submit a civic issue to start tracking progress." /> : <><div className="space-y-3">{items.map((report) => <MyReportRow key={report.id} report={report} />)}</div>{data?.pagination?.hasMore && <div className="flex justify-center"><Button variant="outline" disabled={loadingMore} onClick={() => load({ page: data.pagination.page + 1, append: true })}>{loadingMore && <Loader2 size={15} className="animate-spin" />} {loadingMore ? "Loading…" : "Load more reports"}</Button></div>}</>}</div></CitizenLayout>;
}
