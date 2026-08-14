import { MapPin, ArrowUpRight, Map, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { categoryMeta } from "./categoryMeta";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { ISSUE_FILTERS, ISSUE_SORTS, matchesFilter, sortIssues } from "./issueFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { priorityBarClass } from "@/components/civic/PriorityMeter";
import { cn } from "@/lib/utils";

function IssueRow({ issue, user, onVote, voting }) {
  const meta = categoryMeta(issue.category);
  const Icon = meta.icon;
  const voterKey = user?.id || user?.email;
  const currentVote = issue.communityVerification?.votes?.[voterKey];
  const isOwnReport = Boolean(issue.reporterId && issue.reporterId === voterKey);
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-accent/40">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
          <StatusBadge status={issue.status} className="shrink-0 px-2 py-0.5 text-[10px]" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} />
            {issue.location} · {issue.distance}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="text-xs font-semibold text-foreground">AI</span>
            {issue.priority}
            <span className="text-muted-foreground">/100</span>
          </span>
        </div>
        <Progress
          value={issue.priority}
          indicatorClassName={priorityBarClass(issue.priority)}
          className="mt-2 h-1"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="mr-auto text-[11px] text-muted-foreground">
            {issue.legitimacy.total
              ? `${issue.legitimacy.label} · ${issue.legitimacy.score}% legit`
              : "Not verified by neighbors yet"}
          </span>
          {isOwnReport ? (
            <span className="text-[11px] text-muted-foreground">Your report</span>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant={currentVote === "legit" ? "default" : "outline"}
                className="h-7 px-2.5 text-xs"
                disabled={voting}
                onClick={() => onVote?.(issue.id, "legit")}
              >
                <ThumbsUp size={12} /> Confirm issue {issue.legitimacy.legit}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currentVote === "fake" ? "destructive" : "outline"}
                className="h-7 px-2.5 text-xs"
                disabled={voting}
                onClick={() => onVote?.(issue.id, "fake")}
              >
                <ThumbsDown size={12} /> Needs review {issue.legitimacy.fake}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function NearbyIssues({ data, loading, error, onRetry, filter, onFilterChange, sort, onSortChange, user, onVote, votingId }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nearby problems</CardTitle>
          <CardDescription>Loading your neighborhood reports…</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionSkeleton rows={4} />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <SectionError title="Couldn't load nearby problems" onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  const filtered = data.filter((issue) => matchesFilter(issue, filter));
  const visible = sortIssues(filtered, sort).slice(0, 5);

  return (
    <section id="issues" className="scroll-mt-24">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Nearby problems</CardTitle>
            <CardDescription>
              {filtered.length} of {data.length} in your area
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            <MapPin size={12} className="text-primary" />
            within 2 km
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ISSUE_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <Button
                  key={f.key}
                  variant={filter === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange?.(f.key)}
                  className="shrink-0"
                >
                  <Icon size={13} />
                  {f.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              Sorted by AI priority
            </p>
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger aria-label="Sort issues" className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_SORTS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-accent/40 p-6 text-center text-sm text-muted-foreground">
              {data.length === 0
                ? "No newly submitted problems yet. New reports will appear here automatically."
                : "No issues match this filter."}
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  user={user}
                  onVote={onVote}
                  voting={votingId === issue.id}
                />
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => navigate("/map")}>
            <Map size={15} />
            View all on map
            <ArrowUpRight size={14} />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
