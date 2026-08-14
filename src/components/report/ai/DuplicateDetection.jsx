import { useState } from "react";
import { GitCompareArrows, MapPin, Clock3, Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { AnalysisPanel } from "./AnalysisPanel";
import { cn } from "@/lib/utils";

function SimilarityGauge({ similarity }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ai/20 bg-background/70 px-3 py-2.5">
      <span className="font-display text-2xl font-bold tabular-nums text-ai-foreground">
        {similarity}%
      </span>
      <div className="min-w-0 flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ai to-purple-500"
            style={{ width: `${similarity}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Similar to an existing report</p>
      </div>
    </div>
  );
}

export function DuplicateComparison({ currentId, matched }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" data-testid="duplicate-comparison">
      <div className="rounded-lg border border-ai/25 bg-background/80 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ai-foreground">New report</p>
        <p className="mt-1 text-xs font-semibold text-foreground">Road Damage — Main Road</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{currentId}</p>
      </div>
      <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
          Possible match
        </p>
        <p className="mt-1 text-xs font-semibold text-foreground">{matched?.title}</p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{matched?.reportId}</p>
        <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} />
            {matched?.distance}{matched?.distanceUnit}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={10} />
            {matched?.timeAgo}
          </span>
          <span className="inline-flex items-center rounded-full bg-background/80 px-1.5 py-0.5 font-medium text-warning-foreground">
            {matched?.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DuplicateDetection({ duplicate }) {
  const [linked, setLinked] = useState(false);

  if (!duplicate?.detected) {
    return (
      <AnalysisPanel
        badge="Duplicate Detection"
        title="No clear duplicate found"
        dataTestId="ai-duplicate"
        icon={Link2Off}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {duplicate?.summary ??
            "CivicAI checked nearby reports and found nothing similar enough to merge with."}
        </p>
      </AnalysisPanel>
    );
  }

  const matched = duplicate.matched;

  return (
    <AnalysisPanel
      badge="Duplicate Detection"
      title="This may already be reported"
      dataTestId="ai-duplicate"
      icon={GitCompareArrows}
      action={
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-ai/25 bg-background/70 text-xs",
            linked ? "text-success-foreground" : "text-ai-foreground"
          )}
          onClick={() => {
            if (linked) {
              setLinked(false);
              return;
            }
            setLinked(true);
            toast.success(`Linked to ${matched?.reportId}`);
          }}
        >
          {linked ? <Link2Off size={13} /> : <Link2 size={13} />}
          {linked ? "Unlink" : "Link to Existing Report"}
        </Button>
      }
    >
      <SimilarityGauge similarity={duplicate.similarity} />
      <DuplicateComparison matched={matched} />
      {linked ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success-foreground">
          <Link2 size={13} />
          Linked to {matched?.reportId} — both reports will be handled in one visit.
        </p>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{duplicate.summary}</p>
      )}
    </AnalysisPanel>
  );
}
