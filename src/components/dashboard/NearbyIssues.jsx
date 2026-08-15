import { Link } from "react-router-dom";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { categoryMeta } from "./categoryMeta";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { formatRelativeTime } from "@/components/reports/format";
import { cn } from "@/lib/utils";

function IssueRow({ issue, user, onVote, voting }) {
  const meta = categoryMeta(issue.category);
  const Icon = meta.icon;
  const voterKey = user?.id || user?.email;
  const currentVote = issue.myVote || issue.communityVerification?.votes?.[voterKey];
  const own = issue.canVote === false;
  return <article className="flex gap-3 rounded-xl border bg-background p-3.5 transition-colors hover:border-primary/30 sm:p-4"><div className="relative hidden h-16 w-20 shrink-0 overflow-hidden rounded-lg border bg-accent/40 sm:block">{issue.imageUrl ? <img src={issue.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Icon size={24} className={cn(meta.tone)} /></div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><Link to={`/issues/${issue.id}`} className="truncate text-sm font-semibold text-foreground hover:text-primary">{issue.title}</Link><ReportStatusBadge status={issue.status} className="shrink-0 px-2 py-0.5 text-[10px]" /></div><p className="mt-1 text-xs text-muted-foreground">{issue.categoryLabel || meta.label}</p><p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"><MapPin size={11} />{issue.location || "Your community"}<span aria-hidden>·</span>{formatRelativeTime(issue.reportedAt || issue.createdAt)}</p><div className="mt-2.5 flex flex-wrap items-center gap-2">{own ? <span className="text-[11px] font-medium text-muted-foreground">Your report</span> : <><Button type="button" size="sm" variant={currentVote === "confirm" || currentVote === "legit" ? "default" : "outline"} className="h-7 px-2.5 text-xs" disabled={voting} onClick={() => onVote?.(issue.id, "legit")}><ThumbsUp size={12} />Agree {issue.confirmed ?? issue.legitimacy?.legit ?? 0}</Button><Button type="button" size="sm" variant={currentVote === "reject" || currentVote === "fake" ? "destructive" : "outline"} className="h-7 px-2.5 text-xs" disabled={voting} onClick={() => onVote?.(issue.id, "fake")}><ThumbsDown size={12} />Disagree {issue.rejected ?? issue.legitimacy?.fake ?? 0}</Button></>}</div></div></article>;
}

export function NearbyIssues({ data, loading, error, onRetry, user, onVote, votingId }) {
  if (loading) return <Card><CardHeader><CardTitle className="text-base">Community Issues</CardTitle><CardDescription>Loading issues reported around your community.</CardDescription></CardHeader><CardContent><SectionSkeleton rows={3} /></CardContent></Card>;
  if (error || !data) return <Card><CardContent className="p-6"><SectionError title="Couldn't load community issues" onRetry={onRetry} /></CardContent></Card>;
  const visible = data.slice(0, 5);
  return <section id="issues" className="scroll-mt-24"><Card><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle className="text-base">Community Issues</CardTitle><CardDescription>Issues reported around your community.</CardDescription></div><Link to="/issues" className="shrink-0 text-sm font-medium text-primary hover:underline">View all <span aria-hidden>→</span></Link></CardHeader><CardContent className="space-y-2.5">{visible.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No community issues nearby.</div> : visible.map((issue) => <IssueRow key={issue.id} issue={issue} user={user} onVote={onVote} voting={votingId === issue.id} />)}</CardContent></Card></section>;
}
