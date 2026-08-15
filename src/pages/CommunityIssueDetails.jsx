import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, FileText, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { CommunityConfirmation } from "@/components/reports/CommunityConfirmation";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { getCommunityConfirmation, getCommunityReport, confirmResolution, submitResolutionFeedback } from "@/services/reports/reportsService";
import { useAsync } from "@/hooks/useAsync";
import { formatShortDate } from "@/components/reports/format";

export function CommunityIssueDetails() {
  const { id } = useParams();
  const reportAsync = useAsync(() => getCommunityReport(id), [id]);
  const communityAsync = useAsync(() => getCommunityConfirmation(id), [id]);
  const [error, setError] = useState(null);
  const report = reportAsync.data;

  useEffect(() => {
    setError(null);
  }, [id]);

  const handleConfirm = async (verdict) => {
    try {
      await confirmResolution(id, verdict);
      communityAsync.reload();
      reportAsync.reload();
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    }
  };

  const handleFeedback = async () => {
    try {
      await submitResolutionFeedback(id);
      communityAsync.reload();
    } catch (nextError) {
      setError(nextError);
      throw nextError;
    }
  };

  if (reportAsync.error) return <CitizenLayout><ReportErrorState title="Unable to load this community issue" message={reportAsync.error.message} onRetry={reportAsync.reload} /></CitizenLayout>;

  return <CitizenLayout><div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/issues" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={14} />Community Issues</Link>{report && <ReportStatusBadge status={report.status} className="px-3 py-1 text-xs" />}</div>
    {reportAsync.loading ? <div className="h-72 animate-pulse rounded-lg border bg-muted" /> : report && <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6"><header className="rounded-lg border bg-card p-5 shadow-soft"><p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><FileText size={11} />{report.id}</span><span className="inline-flex items-center gap-1"><MapPin size={11} />{report.approximateLocation}</span><span className="inline-flex items-center gap-1"><Calendar size={11} />Reported {formatShortDate(report.reportedAt)}</span></p><h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{report.title}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.description}</p><p className="mt-3 text-xs text-muted-foreground">{report.categoryLabel} · {report.severity === "pending" ? "Priority pending" : `${report.severity} priority`}</p></header>
        {report.imageUrl ? <figure className="overflow-hidden rounded-lg border bg-card"><img src={report.imageUrl} alt="Community report evidence" className="max-h-[32rem] w-full object-contain" /><figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">Photo shared with this civic report</figcaption></figure> : <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">No public image was attached to this report.</div>}
        {error && <ReportErrorState title="Reaction could not be saved" message={error.message} />}
      </div>
      <CommunityConfirmation reportId={report.id} data={communityAsync.data} loading={communityAsync.loading} onConfirm={handleConfirm} onSubmitFeedback={handleFeedback} />
    </div>}
  </div></CitizenLayout>;
}

export default CommunityIssueDetails;
