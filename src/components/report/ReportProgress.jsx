import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const REPORT_STEPS = ["Evidence", "Details", "Location", "AI Analysis", "Review"];

export function ReportProgress({ current }) {
  return (
    <nav aria-label="Report progress" className="w-full">
      <p className="mb-2 text-xs font-semibold text-primary lg:hidden" aria-live="polite">
        Step {current + 1} of {REPORT_STEPS.length} — {REPORT_STEPS[current]}
      </p>
      <div className="flex items-center gap-1.5 lg:gap-2">
        {REPORT_STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex flex-1 items-center gap-1.5 lg:gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors lg:h-7 lg:w-7",
                  active && "border-primary bg-primary text-primary-foreground shadow-soft",
                  done && "border-primary/40 bg-primary/10 text-primary",
                  !active && !done && "border-border bg-background text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium md:block",
                  active ? "text-foreground" : done ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {i < REPORT_STEPS.length - 1 && (
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: done ? "100%" : active ? "50%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
