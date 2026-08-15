import { useMemo, useState } from "react";
import { ArrowLeft, Calendar, MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { StatusTimeline } from "@/components/reports/StatusTimeline";
import { getCommunityConfirmation, getCommunityReport, confirmResolution } from "@/services/reports/reportsService";
import { useAsync } from "@/hooks/useAsync";
import { formatShortDate } from "@/components/reports/format";
import { Button } from "@/components/ui/button";

const STAGES = [["submitted", "Received"], ["under_review", "Under Review"], ["in_progress", "Work In Progress"], ["resolved", "Completed"]];

function PublicTimeline({ status }) {
  const current = status === "closed" ? "resolved" : status;
  const index = Math.max(0, STAGES.findIndex(([key]) => key === current));
  const steps = STAGES.map(([key, label], stepIndex) => ({ key, label, done: stepIndex <= index, current: stepIndex === index, at: null, note: stepIndex <= index ? "This stage has been recorded." : "This stage has not been reached yet." }));
  return <StatusTimeline steps={steps} />;
}

export function CommunityIssueDetails() {
  const { id } = useParams();
  const reportAsync = useAsync(() => getCommunityReport(id), [id]);
  const communityAsync = useAsync(() => getCommunityConfirmation(id), [id]);
  const [voting, setVoting] = useState(false);
  const report = reportAsync.data;

  const handleVote = async (vote) => {
    setVoting(true);
    try { await confirmResolution(id, vote); toast.success(vote === "yes" ? "Issue confirmed." : "Your disagreement was recorded."); await communityAsync.reload(); }
    catch (error) { toast.error(error.message || "We couldn't record your vote."); }
    finally { setVoting(false); }
  };
  const evidence = useMemo(() => report?.evidence || [], [report]);
  if (reportAsync.error) return <CitizenLayout><ReportErrorState title="Unable to load this community issue" message={reportAsync.error.message} onRetry={reportAsync.reload} /></CitizenLayout>;

  return <CitizenLayout><div className="space-y-6">
    <Link to="/issues" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={14} />Community Issues</Link>
    {reportAsync.loading ? <div className="h-72 animate-pulse rounded-xl border bg-muted" /> : report && <>
      <header className="rounded-xl border bg-card p-5 shadow-soft sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{report.title}</h1><p className="mt-2 text-sm text-muted-foreground">{report.categoryLabel} <span aria-hidden>•</span> {report.approximateLocation || report.location}</p></div><ReportStatusBadge status={report.status} /></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{report.description}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar size={12} />Reported {formatShortDate(report.reportedAt)}</p></header>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6"><section className="rounded-xl border bg-card p-5 shadow-soft"><h2 className="font-display text-lg font-semibold">Public progress</h2><p className="mt-1 text-xs text-muted-foreground">Follow the report through its public status updates.</p><div className="mt-5"><PublicTimeline status={report.status} /></div></section><section className="rounded-xl border bg-card p-5 shadow-soft"><h2 className="font-display text-lg font-semibold">Evidence</h2>{evidence.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{evidence.map((item) => <img key={item.id} src={item.url} alt="Community report evidence" className="max-h-80 w-full rounded-lg border object-cover" />)}</div> : <p className="mt-3 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No public evidence was attached.</p>}</section>{report.status === "resolved" || report.status === "closed" ? <section className="rounded-xl border bg-card p-5 shadow-soft"><h2 className="font-display text-lg font-semibold">Resolution result</h2><p className="mt-2 text-sm text-muted-foreground">This issue is marked completed. Public resolution evidence will appear here when available.</p></section> : null}</div>
        <aside className="space-y-6"><section className="rounded-xl border bg-card p-5 shadow-soft"><h2 className="font-display text-base font-semibold">Location</h2><p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin size={15} className="mt-0.5 shrink-0 text-primary" />{report.approximateLocation || report.location || "Community location"}</p></section><section className="rounded-xl border bg-card p-5 shadow-soft"><h2 className="font-display text-base font-semibold">Community verification</h2><p className="mt-1 text-xs text-muted-foreground">Help confirm whether this issue is accurately reported.</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={communityAsync.data?.myVote === "confirm" ? "default" : "outline"} disabled={voting || report.canVote === false} onClick={() => handleVote("yes")}><ThumbsUp size={14} />Agree {communityAsync.data?.confirmed ?? report.confirmed ?? 0}</Button><Button size="sm" variant={communityAsync.data?.myVote === "reject" ? "destructive" : "outline"} disabled={voting || report.canVote === false} onClick={() => handleVote("no")}><ThumbsDown size={14} />Disagree {communityAsync.data?.rejected ?? report.rejected ?? 0}</Button></div>{report.canVote === false && <p className="mt-3 text-xs text-muted-foreground">Your report cannot be voted on.</p>}{communityAsync.data?.communityStatus === "community_supported" && <p className="mt-3 text-xs font-medium text-success-foreground">Community Supported</p>}</section></aside>
      </div>
    </>}
  </div></CitizenLayout>;
}

export default CommunityIssueDetails;
