import { Link } from "react-router-dom";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { reportCategoryMeta } from "./reportMeta";
import { formatRelativeTime } from "./format";
import { cn } from "@/lib/utils";

export function CommunityIssueCard({ report, onVote, voting }) {
  const meta = reportCategoryMeta(report.category);
  const Icon = meta.icon;
  const own = report.canVote === false;
  const currentVote = report.myVote;
  return <article className="civic-card p-3.5 transition-colors hover:border-primary/40 sm:p-4">
    <div className="flex gap-3.5">
      <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-border bg-accent sm:block">{report.imageUrl ? <img src={report.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Icon size={27} className={cn(meta.tone)} /></div>}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2"><Link to={`/issues/${report.id}`} className="font-display text-base font-semibold text-foreground hover:text-primary">{report.title}</Link><ReportStatusBadge status={report.status} className="px-2 py-0.5 text-[10px]" /></div>
        <div className="mt-1 flex flex-wrap items-center gap-2"><p className="text-xs text-muted-foreground">{report.categoryLabel || meta.label}</p>{report.severity ? <SeverityBadge severity={report.severity} className="px-2 py-0.5 text-[10px]" /> : <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">Not assessed</span>}{report.reporterType === "guest" && <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">Guest Report</span>}</div>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} />{report.location || report.address || "Your community"}<span aria-hidden>•</span>{formatRelativeTime(report.reportedAt || report.createdAt)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">{own ? <span className="text-xs font-medium text-muted-foreground">Your report</span> : <><Button type="button" size="sm" variant={currentVote === "confirm" ? "default" : "outline"} disabled={voting} onClick={() => onVote?.(report.id, "yes")} className="h-8 px-2.5 text-xs"><ThumbsUp size={13} />Agree {report.confirmed ?? 0}</Button><Button type="button" size="sm" variant={currentVote === "reject" ? "destructive" : "outline"} disabled={voting} onClick={() => onVote?.(report.id, "no")} className="h-8 px-2.5 text-xs"><ThumbsDown size={13} />Disagree {report.rejected ?? 0}</Button></>}</div>
        {(report.communityStatus === "community_supported" || (report.confirmed >= 3 && report.confirmed > report.rejected * 1.75)) && <p className="mt-2 text-xs font-medium text-success-foreground">Community Supported</p>}
      </div>
    </div>
  </article>;
}
