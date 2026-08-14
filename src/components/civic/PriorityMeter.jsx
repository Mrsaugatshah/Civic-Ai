import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function priorityTone(score) {
  if (score >= 80) return "text-error";
  if (score >= 60) return "text-warning";
  if (score >= 35) return "text-info";
  return "text-success";
}

export function priorityBarClass(score) {
  if (score >= 80) return "bg-error";
  if (score >= 60) return "bg-warning";
  if (score >= 35) return "bg-info";
  return "bg-success";
}

export function PriorityMeter({ score = 0, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles size={13} className="text-ai" />
          AI priority
        </span>
        <span className={cn("font-display text-sm font-semibold", priorityTone(score))}>
          {score}
          <span className="text-xs font-medium text-muted-foreground">/100</span>
        </span>
      </div>
      <Progress
        value={score}
        indicatorClassName={priorityBarClass(score)}
        className="h-1.5"
      />
    </div>
  );
}
