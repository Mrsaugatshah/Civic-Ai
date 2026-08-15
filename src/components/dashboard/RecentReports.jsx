import { Link } from "react-router-dom";
import { ArrowRight, FileText, MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { categoryMeta } from "./categoryMeta";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { formatRelativeTime } from "@/components/reports/format";

function ReportRow({ report }) {
  const meta = categoryMeta(report.category);
  const Icon = meta.icon;
  return <Link to={`/reports/${report.id}`} className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary/30"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{report.title}</p><p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"><span>{report.categoryLabel || meta.label}</span><span aria-hidden>·</span><span className="inline-flex items-center gap-1"><MapPin size={10} />{report.location || "Community"}</span></p></div><div className="flex shrink-0 flex-col items-end gap-1.5"><ReportStatusBadge status={report.status} className="px-2 py-0.5 text-[10px]" /><span className="text-[11px] text-muted-foreground">{formatRelativeTime(report.reportedAt)}</span></div></Link>;
}

export function RecentReports({ data, loading, error, onRetry }) {
  if (loading) return <Card><CardHeader><CardTitle className="text-base">My Recent Reports</CardTitle><CardDescription>Loading your submissions…</CardDescription></CardHeader><CardContent><SectionSkeleton rows={3} /></CardContent></Card>;
  if (error || !data) return <Card><CardContent className="p-6"><SectionError title="Couldn't load your reports" onRetry={onRetry} /></CardContent></Card>;
  const items = (data.items || []).slice(0, 4);
  return <section id="reports" className="scroll-mt-24"><Card><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle className="text-base">My Recent Reports</CardTitle><CardDescription>Keep track of your latest submissions.</CardDescription></div><Link to="/reports" className="shrink-0 text-sm font-medium text-primary hover:underline">View all <span aria-hidden>→</span></Link></CardHeader><CardContent className="space-y-2.5">{items.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center"><FileText size={22} className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-medium text-foreground">No reports yet.</p><p className="mt-1 text-xs text-muted-foreground">Submit your first civic issue to start tracking progress.</p><Button asChild size="sm" className="mt-4"><Link to="/report"><Plus size={14} />Report an Issue</Link></Button></div> : items.map((report) => <ReportRow key={report.id} report={report} />)}{items.length > 0 && <div className="flex justify-end pt-1"><Link to="/reports" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">View all my reports <ArrowRight size={13} /></Link></div>}</CardContent></Card></section>;
}
