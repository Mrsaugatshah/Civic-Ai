import { ArrowRight, Users, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { SectionError } from "@/components/dashboard/SectionError";

function ageLabel(iso) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function CriticalIssues({ data, loading, error, onRetry, onOpenIssue }) {
  return (
    <section id="critical" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Critical Issues</h2>
        <span className="text-sm text-muted-foreground">{data ? `${data.length} open` : ""}</span>
      </div>

      {error ? (
        <SectionError title="Couldn't load critical issues" onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No critical issues right now — the city is in good shape.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((issue) => (
            <Card key={issue.id} className="border-error/25 bg-error/[0.03]">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-foreground">{issue.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{issue.location}</p>
                  </div>
                  <SeverityBadge severity={issue.severity} className="shrink-0 px-2 py-0.5 text-[11px]" />
                </div>

                <PriorityMeter score={issue.priority} />

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {issue.reportCount} reports
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {ageLabel(issue.reportedAt)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Community legitimacy: {issue.legitimacy.score == null ? "Unverified" : `${issue.legitimacy.score}% legit`}
                  {` · ${issue.legitimacy.legit} legit / ${issue.legitimacy.fake} fake`}
                </p>

                <p className="text-xs text-muted-foreground">{issue.department}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-auto -ml-2 w-fit text-primary hover:text-primary"
                  onClick={() => onOpenIssue?.(issue)}
                >
                  View Issue <ArrowRight size={13} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
