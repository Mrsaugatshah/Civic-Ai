import { ArrowRight, Landmark } from "lucide-react";

import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { AnalysisPanel } from "./AnalysisPanel";

export function DepartmentRecommendation({ department }) {
  const route = department?.route ?? [];

  return (
    <AnalysisPanel
      badge="Department Recommendation"
      title={department?.name ?? "Routing…"}
      dataTestId="ai-department"
      icon={Landmark}
    >
      <div className="mt-1">
        <ConfidenceIndicator confidence={department?.confidence} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Proposed routing
      </p>
      <ol className="mt-3" data-testid="routing-visual">
        {route.map((step, i) => (
          <li key={step} className="flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai/10 font-mono text-[10px] font-bold text-ai-foreground">
              {i + 1}
            </span>
            <span
              className={
                i === route.length - 1
                  ? "text-xs font-semibold text-foreground"
                  : "text-xs text-muted-foreground"
              }
            >
              {step}
            </span>
            {i < route.length - 1 && (
              <ArrowRight size={12} className="shrink-0 text-muted-foreground/60" />
            )}
          </li>
        ))}
      </ol>
    </AnalysisPanel>
  );
}
