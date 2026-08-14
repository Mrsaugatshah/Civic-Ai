import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function formatStepTime(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ReportTimeline({ steps }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-5 h-full w-px",
                  step.done ? "bg-success/50" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                step.done && "border-success bg-success text-white",
                step.current && !step.done && "border-primary bg-primary text-white animate-pulse-soft",
                !step.done && !step.current && "border-border bg-background text-muted-foreground"
              )}
            >
              {step.done && <Check size={12} strokeWidth={3} />}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.done || step.current ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {step.current && !step.done && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    In progress
                  </span>
                )}
              </p>
              {step.at && (
                <p className="text-xs text-muted-foreground">{formatStepTime(step.at)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
