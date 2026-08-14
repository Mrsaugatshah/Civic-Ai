import { motion, useReducedMotion } from "framer-motion";

import { PRIORITY_FACTOR_META } from "./reportMeta";

export function PriorityBreakdown({ factors = {} }) {
  const reduce = useReducedMotion();
  const entries = Object.entries(factors);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">How this score is built</p>
      {entries.map(([key, value], i) => {
        const meta = PRIORITY_FACTOR_META[key] ?? { label: key, color: "#64748B" };
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">{meta.label}</span>
              <span className="font-semibold tabular-nums text-foreground">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: meta.color }}
                initial={reduce ? { width: `${value}%` } : { width: "0%" }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
