import { Zap } from "lucide-react";

import { PriorityScore } from "../PriorityScore";
import { PriorityBreakdown } from "../PriorityBreakdown";
import { AnalysisPanel } from "./AnalysisPanel";
import { priorityLevelForScore } from "@/services/report/analysisService";

export function PriorityCard({ priority }) {
  const level = priorityLevelForScore(priority?.score ?? 0);

  return (
    <AnalysisPanel
      badge="Priority Score"
      title={priority?.label ?? "Priority"}
      dataTestId="ai-priority"
      icon={Zap}
    >
      <div className="rounded-lg border border-ai/25 bg-background/80 p-4">
        <PriorityScore score={priority?.score ?? 0} />
      </div>

      <p className="mt-3 inline-flex items-center rounded-full bg-ai/10 px-2.5 py-1 text-xs font-bold text-ai-foreground">
        {priority?.score ?? 0}/100 · {level.level}
      </p>

      <div className="mt-4">
        <PriorityBreakdown factors={priority?.factors} />
      </div>

      {priority?.summary && (
        <p className="mt-4 rounded-lg bg-background/70 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {priority.summary}
        </p>
      )}
    </AnalysisPanel>
  );
}
