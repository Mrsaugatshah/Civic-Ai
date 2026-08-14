import { CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";

import { ANALYSIS_STATES } from "@/services/report/analysisService";
import { cn } from "@/lib/utils";

const STATE_STYLE = {
  complete: "bg-success/10 text-success-foreground",
  pending: "bg-muted text-muted-foreground",
  processing: "bg-ai/10 text-ai-foreground",
  partial: "bg-warning/10 text-warning-foreground",
  low_confidence: "bg-warning/10 text-warning-foreground",
  failed: "bg-error/10 text-error-foreground",
};

export function AnalysisStatesChip({ state = "complete", className }) {
  const label = ANALYSIS_STATES[state] ?? ANALYSIS_STATES.complete;
  const Icon =
    state === "complete" ? CheckCircle2 : state === "failed" ? MinusCircle : AlertTriangle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        STATE_STYLE[state],
        className
      )}
      data-testid="analysis-state"
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
