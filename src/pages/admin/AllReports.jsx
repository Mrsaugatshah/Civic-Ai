import { useState } from "react";
import { Eye, Loader2, Trash2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAsync } from "@/hooks/useAsync";
import { getAllReports, deleteReport, rejectAndRemoveReport } from "@/services/admin/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionError } from "@/components/dashboard/SectionError";

export function AllReports() {
  const reports = useAsync(getAllReports, []);
  const [busy, setBusy] = useState(null);
  const remove = async (report, action) => {
    const message = action === "reject"
      ? `Reject and permanently remove “${report.title}”?`
      : `Permanently delete “${report.title}”?`;
    if (!window.confirm(`${message}\nThis action cannot be undone.`)) return;
    setBusy(`${action}:${report.id}`);
    try {
      if (action === "reject") await rejectAndRemoveReport(report.id);
      else await deleteReport(report.id);
      toast.success(action === "reject" ? "Report rejected and removed." : "Report deleted.");
      reports.reload();
    } catch (error) { toast.error(error.message || "Unable to remove report."); }
    finally { setBusy(null); }
  };
  return <AdminLayout initialActive="all-reports"><div className="space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Records</p><h1 className="mt-2 font-display text-2xl font-bold tracking-tight">All Reports</h1><p className="mt-1 text-sm text-muted-foreground">Review every report and remove records that should not remain in CivicAI.</p></header>{reports.error ? <SectionError title="Couldn't load all reports" onRetry={reports.reload} /> : reports.loading ? <Card><CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 size={17} className="mr-2 animate-spin" />Loading reports…</CardContent></Card> : !reports.data?.length ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No reports found.</CardContent></Card> : <Card className="civic-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Reporter</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{reports.data.map((report) => { const guest = report.reporterType === "guest"; const reporter = report.reporter || { name: guest ? "Anonymous" : "Unavailable" }; return <tr key={report.id} className="hover:bg-accent/40"><td className="max-w-[280px] px-4 py-3"><Link to={`/admin/issues/${report.id}`} className="block truncate font-medium hover:text-primary">{report.title}</Link><span className="text-xs text-muted-foreground">{report.id} · {report.location || report.address || "No location"}</span></td><td className="px-4 py-3"><p className="font-medium">{guest ? "Anonymous" : reporter.name}</p>{!guest && <p className="text-xs text-muted-foreground">{reporter.email}{reporter.phone ? ` · ${reporter.phone}` : ""}</p>}</td><td className="px-4 py-3 text-xs text-muted-foreground">{report.categoryLabel || report.category}</td><td className="px-4 py-3"><StatusBadge status={report.status} className="whitespace-nowrap px-2 py-0.5 text-[10px]" /></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link to={`/admin/issues/${report.id}`}><Eye size={14} />View</Link></Button><Button variant="outline" size="sm" className="text-error-foreground hover:bg-error/10" disabled={busy === `reject:${report.id}` || busy === `delete:${report.id}`} onClick={() => remove(report, "reject")}><XCircle size={14} />Reject</Button><Button variant="destructive" size="sm" disabled={busy === `reject:${report.id}` || busy === `delete:${report.id}`} onClick={() => remove(report, "delete")}><Trash2 size={14} />Delete</Button></div></td></tr>; })}</tbody></table></div></Card>}</div></AdminLayout>;
}
