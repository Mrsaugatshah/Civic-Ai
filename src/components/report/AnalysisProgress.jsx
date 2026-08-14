import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check, Sparkles } from "lucide-react";

import { AIOrb } from "@/components/civic/AICard";
import { ANALYSIS_STAGES } from "@/services/report/reportService";
import { cn } from "@/lib/utils";

function Scanline() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      <motion.div
        className="h-px w-full bg-gradient-to-r from-transparent via-ai to-transparent"
        style={{ boxShadow: "0 0 18px 2px rgba(99,102,241,0.5)" }}
        animate={{ y: [0, 150] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function AnalysisProgress({ currentStage }) {
  const stage = ANALYSIS_STAGES[currentStage] ?? null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-ai/30 bg-ai-gradient p-6 shadow-ai-glow sm:p-8">
      <Scanline />
      <div className="relative flex flex-col items-center text-center">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <AIOrb size={92} />
        </motion.div>
        <h3 className="font-display mt-5 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Sparkles size={16} className="text-ai" />
          Analyzing your report
        </h3>
        <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
          {stage ? stage.label : "Preparing…"}
        </p>

        <ol className="mt-6 w-full max-w-sm space-y-2 text-left">
          {ANALYSIS_STAGES.map((s, i) => {
            const done = i < currentStage;
            const active = i === currentStage;
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-ai/40 bg-background/80 text-foreground"
                    : done
                      ? "border-transparent text-muted-foreground"
                      : "border-transparent text-muted-foreground/50"
                )}
              >
                {done ? (
                  <Check size={15} className="shrink-0 text-success-foreground" />
                ) : active ? (
                  <Loader2 size={15} className="shrink-0 animate-spin text-ai" />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                )}
                <span className={cn(done && "line-through decoration-muted-foreground/40")}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
