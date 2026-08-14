import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export function ConfidenceIndicator({ confidence = 0, className, showLabel = true }) {
  const reduce = useReducedMotion();
  const tone =
    confidence >= 80
      ? "bg-success"
      : confidence >= 60
        ? "bg-warning"
        : confidence >= 45
          ? "bg-info"
          : "bg-muted-foreground/40";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">Confidence</span>
        {showLabel && (
          <span className="font-semibold tabular-nums text-foreground">{confidence}%</span>
        )}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={reduce ? { width: `${confidence}%` } : { width: "0%" }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
