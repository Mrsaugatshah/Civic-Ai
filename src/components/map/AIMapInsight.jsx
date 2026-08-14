import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, MapPin, Target } from "lucide-react";

import { cn } from "@/lib/utils";

export function AIMapInsight({ insights, onExplore, className }) {
  const [index, setIndex] = useState(0);
  if (!insights || insights.length === 0) return null;
  const insight = insights[index % insights.length];

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient text-ai-foreground shadow-ai-glow", className)} data-testid="ai-map-insight">
      <div className="flex items-start gap-2 p-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15">
          <Sparkles size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ai-foreground/70">
            AI city insight · {insight.confidence ?? "Data-driven"}
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug">{insight.headline}</p>
          <p className="mt-1 text-xs leading-relaxed text-ai-foreground/80">{insight.body}</p>
          {insight.focus && (
            <button
              type="button"
              onClick={() => onExplore?.(insight.focus)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-white/25"
            >
              {insight.kind === "area" ? <MapPin size={12} /> : <Target size={12} />}
              {insight.kind === "area" ? "Explore this cluster" : "View area"}
            </button>
          )}
        </div>
      </div>
      {insights.length > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-1.5">
          <button
            type="button"
            aria-label="Previous insight"
            onClick={() => setIndex((i) => (i - 1 + insights.length) % insights.length)}
            className="rounded p-0.5 text-ai-foreground/80 hover:bg-white/15"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex gap-1">
            {insights.map((_, i) => (
              <span key={i} className={cn("h-1 w-3 rounded-full", i === index ? "bg-white" : "bg-white/30")} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next insight"
            onClick={() => setIndex((i) => (i + 1) % insights.length)}
            className="rounded p-0.5 text-ai-foreground/80 hover:bg-white/15"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
