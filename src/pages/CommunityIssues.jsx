import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Globe2, Loader2, Plus, Search } from "lucide-react";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReports, NoReportsMatch } from "@/components/reports/EmptyReports";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCommunityReports } from "@/services/reports/reportsService";

export function CommunityIssues() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getCommunityReports({ limit: 50, query }));
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const items = data?.items || [];

  return <CitizenLayout><div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Globe2 size={13} aria-hidden />CivicAI · Community</p><h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">Community Issues</h1><p className="mt-1 text-sm text-muted-foreground">See civic reports from across the community and help verify them.</p></div>
      <Button asChild><Link to="/report?quick=1"><Plus size={15} />Report a Problem</Link></Button>
    </div>
    <div className="relative max-w-md"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search community reports" className="pl-9" aria-label="Search community reports" /></div>
    {error && !data ? <ReportErrorState title="Unable to load community issues" message={error.message} onRetry={load} /> : loading ? <div className="flex items-center justify-center rounded-lg border bg-card py-16 text-sm text-muted-foreground"><Loader2 size={18} className="mr-2 animate-spin" />Loading community issues…</div> : items.length === 0 && query ? <NoReportsMatch onReset={() => setQuery("")} /> : items.length === 0 ? <EmptyReports title="No community issues yet" description="Public civic reports will appear here once citizens submit them." /> : <div className="space-y-3">{items.map((report, index) => <ReportCard key={report.id} report={report} index={index} detailPath="/issues" />)}</div>}
  </div></CitizenLayout>;
}

export default CommunityIssues;
