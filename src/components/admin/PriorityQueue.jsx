import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { priorityTone } from "@/components/civic/PriorityMeter";
import { AIAnalysisCard } from "@/components/report/ai/AIAnalysisCard";
import { SectionError } from "@/components/dashboard/SectionError";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function PriorityQueue({ data, loading, error, onRetry, onOpenIssue }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
    <section id="queue" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Priority Queue</h2>
        <span className="text-sm text-muted-foreground">{data ? `${data.length} active` : ""}</span>
      </div>

      {error ? (
        <SectionError title="Couldn't load priority queue" onRetry={onRetry} />
      ) : loading ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium text-foreground">No reports awaiting review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New reports submitted by citizens will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[2.5rem_1fr_7rem_7rem_8rem_9rem_8rem] gap-3 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>#</span>
              <span>Issue</span>
              <span>Severity</span>
              <span>Priority</span>
              <span>Legitimacy</span>
              <span>Department</span>
              <span>Status</span>
            </div>
            <div className="divide-y">
              {data.slice(0, visible).map((issue, i) => (
                <button
                  key={issue.id}
                  onClick={() => onOpenIssue?.(issue)}
                  className={cn(
                    "grid w-full grid-cols-[2.5rem_1fr_7rem_7rem_8rem_9rem_8rem] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent",
                    i === 0 && "bg-ai/[0.04]"
                  )}
                >
                  <span className={cn("font-display text-sm", i === 0 ? "font-bold text-ai" : "text-muted-foreground")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{issue.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{issue.location}</p>
                  </span>
                  <SeverityBadge severity={issue.severity} className="w-fit px-2 py-0.5 text-[11px]" />
                  <span className={cn("font-display text-sm font-semibold", priorityTone(issue.priority))}>
                    {issue.priority}
                    <span className="text-xs font-normal text-muted-foreground">/100</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className={cn(
                      "block font-semibold",
                      issue.legitimacy.score == null
                        ? "text-muted-foreground"
                        : issue.legitimacy.score >= 67
                          ? "text-success-foreground"
                          : issue.legitimacy.score <= 33
                            ? "text-error-foreground"
                            : "text-warning-foreground"
                    )}>
                      {issue.legitimacy.score == null ? "Unverified" : `${issue.legitimacy.score}% legit`}
                    </span>
                    <span>{issue.legitimacy.total ? `${issue.legitimacy.total} votes` : "No community votes"}</span>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{issue.department}</span>
                  <StatusBadge status={issue.status} className="w-fit px-2 py-0.5 text-[11px]" />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {data.slice(0, visible).map((issue, i) => (
              <button
                key={issue.id}
                onClick={() => onOpenIssue?.(issue)}
                className={cn("flex w-full flex-col gap-2 px-4 py-4 text-left", i === 0 && "bg-ai/[0.04]")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      #{i + 1} {issue.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{issue.location}</p>
                  </span>
                  <StatusBadge status={issue.status} className="shrink-0 px-2 py-0.5 text-[11px]" />
                </div>
                <AIAnalysisCard analysis={issue} />
                <p className="text-xs text-muted-foreground">
                  {issue.legitimacy.total
                    ? `Community legitimacy: ${issue.legitimacy.score == null ? "Unverified" : `${issue.legitimacy.score}%`} · ${issue.legitimacy.legit} legit / ${issue.legitimacy.fake} fake`
                    : "Community verification unavailable"}
                </p>
              </button>
            ))}
          </div>

          {visible < data.length && (
            <CardContent className="border-t p-3">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({data.length - visible} remaining)
              </Button>
            </CardContent>
          )}
        </Card>
      )}
    </section>
  );
}
