import { Check, Clock } from "lucide-react";

import { timelineFor } from "@/services/map/mapService";
import { cn } from "@/lib/utils";

function timeLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function IssueTimeline({ issue, className }) {
  const steps = timelineFor(issue);
  return (
    <div className={cn("space-y-0", className)}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lifecycle</p>
      <ol data-testid="issue-timeline" className="relative space-y-3 before:absolute before:left-[9px] before:top-1 before:h-[calc(100%-16px)] before:w-px before:bg-border">
        {steps.map((step) => {
          const done = step.done;
          const current = step.current;
          const reached = step.current || done;
          return (
            <li key={step.key} className="relative flex items-start gap-3 pl-0">
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                  reached ? "border-success bg-success text-white" : "border-border text-muted-foreground"
                )}
              >
                {reached ? <Check size={11} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", current ? "font-semibold text-foreground" : reached ? "font-medium text-foreground/80" : "text-muted-foreground")}>
                  {step.label}
                  {current && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info-foreground">
                      <Clock size={9} /> current
                    </span>
                  )}
                </p>
                {reached && step.at && (
                  <p className="text-[11px] text-muted-foreground">{timeLabel(step.at)}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
