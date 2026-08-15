import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { CommunityIssueCard } from "@/components/reports/CommunityIssueCard";
import { EmptyReports, NoReportsMatch } from "@/components/reports/EmptyReports";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { confirmResolution, getCommunityReports } from "@/services/reports/reportsService";

const STATUS_LABELS = { submitted: "Received", under_review: "Under Review", verified: "Verified", assigned: "Assigned", in_progress: "Work In Progress", resolved: "Completed", closed: "Completed" };

export function CommunityIssues() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sort, setSort] = useState("newest");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingId, setVotingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getCommunityReports({ limit: 50, query })); }
    catch (nextError) { setError(nextError); }
    finally { setLoading(false); }
  }, [query]);
  useEffect(() => { const timer = setTimeout(load, query ? 250 : 0); return () => clearTimeout(timer); }, [load, query]);

  const categories = useMemo(() => [...new Set((data?.items || []).map((item) => item.categoryLabel || item.category).filter(Boolean))].sort(), [data]);
  const items = useMemo(() => {
    const filtered = (data?.items || []).filter((item) => item.canVote !== false && (category === "all" || (item.categoryLabel || item.category) === category) && (status === "all" || item.status === status) && (severity === "all" || String(item.severity || "").toLowerCase() === severity));
    return [...filtered].sort((a, b) => sort === "oldest" ? new Date(a.reportedAt) - new Date(b.reportedAt) : new Date(b.reportedAt) - new Date(a.reportedAt));
  }, [category, data, severity, sort, status]);

  const vote = async (id, verdict) => {
    setVotingId(id);
    try { await confirmResolution(id, verdict); toast.success(verdict === "yes" ? "Issue confirmed." : "Your disagreement was recorded."); await load(); }
    catch (nextError) { toast.error(nextError.message || "We couldn't record your vote."); }
    finally { setVotingId(null); }
  };

  return <CitizenLayout><div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Community Issues</h1><p className="mt-1 text-sm text-muted-foreground">See civic problems reported by people in your community.</p></div><Button asChild><Link to="/report"><Plus size={15} />Report an Issue</Link></Button></header>
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem_9rem]"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search issues" className="pl-9" aria-label="Search community issues" /></div><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"><option value="all">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity" className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"><option value="all">All severities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort issues" className="h-10 rounded-md border bg-background px-3 text-sm text-foreground"><option value="newest">Newest</option><option value="oldest">Oldest</option></select></div>
    {error && !data ? <ReportErrorState title="Unable to load community issues" message={error.message} onRetry={load} /> : loading ? <div className="civic-card flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 size={18} className="mr-2 animate-spin" />Loading community issues…</div> : items.length === 0 && (query || category !== "all" || status !== "all" || severity !== "all") ? <NoReportsMatch onReset={() => { setQuery(""); setCategory("all"); setStatus("all"); setSeverity("all"); }} /> : items.length === 0 ? <EmptyReports title="No community issues yet" description="Public civic reports will appear here once citizens submit them." /> : <div className="grid gap-3 lg:grid-cols-2">{items.map((report) => <CommunityIssueCard key={report.id} report={report} onVote={vote} voting={votingId === report.id} />)}</div>}
  </div></CitizenLayout>;
}

export default CommunityIssues;
