import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function PriorityScore({ score = 0 }) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  const r = 54;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    if (reduce) {
      setValue(score);
      return;
    }
    const start = performance.now();
    const duration = 1300;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, reduce]);

  const offset = c * (1 - value / 100);

  return (
    <div className="flex items-center gap-4" data-testid="priority-score">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
          <motion.circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            stroke="url(#priority-gauge-grad)"
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.2 }}
          />
          <defs>
            <linearGradient id="priority-gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="55%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold tabular-nums text-foreground">{value}</span>
          <span className="text-[11px] font-medium text-muted-foreground">out of 100</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-foreground">AI priority</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Higher means the responsible team should act sooner. Based on severity, impact and
          safety risk.
        </p>
        <p className="mt-2 inline-flex items-center rounded-full bg-ai/10 px-2.5 py-1 text-xs font-semibold text-ai-foreground">
          Priority {score}/100
        </p>
      </div>
    </div>
  );
}
