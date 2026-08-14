import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Check, Sparkles } from "lucide-react";

import { AIOrb } from "@/components/civic/AICard";
import { ANALYSIS_PIPELINE_STAGES } from "@/services/report/analysisService";
import { cn } from "@/lib/utils";

function Scanline() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden">
      <motion.div
        className="h-px w-full bg-gradient-to-r from-transparent via-ai to-transparent"
        style={{ boxShadow: "0 0 18px 2px rgba(99,102,241,0.5)" }}
        animate={{ y: [0, 190] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function AIProcessingState({ currentStage = 0, stages = ANALYSIS_PIPELINE_STAGES }) {
  const activeStage = stages[Math.min(currentStage, stages.length - 1)];
  const progress = Math.round((Math.min(currentStage, stages.length) / stages.length) * 100);

  return (
    <div
      data-testid="ai-processing"
      className="relative overflow-hidden rounded-xl border border-ai/30 bg-ai-gradient p-6 shadow-ai-glow sm:p-8"
    >
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
          AI Analysis in Progress
        </h3>
        <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
          {activeStage?.label ?? "Preparing…"}
        </p>

        <div className="mt-4 w-full max-w-sm" aria-hidden>
          <div className="h-2 overflow-hidden rounded-full bg-ai/15">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ai to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <ol className="mt-6 w-full max-w-sm space-y-2 text-left">
          {stages.map((s, i) => {
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
                  <Check size={15} className="shrink-0 text-success" />
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
