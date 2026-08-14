import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";

export function CivicInsight({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
        <SectionSkeleton rows={3} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
        <SectionError title="Couldn't load your AI insight" onRetry={onRetry} />
      </div>
    );
  }

  return (
    <section id="insight" className="scroll-mt-24">
      <div className="relative h-full overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ai/20 blur-2xl" />
        <div className="relative flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
            <Sparkles size={12} className="text-ai" />
            {data.badge}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ai-foreground/70">
            <ShieldCheck size={12} />
            {data.confidence}
          </span>
        </div>
        <h3 className="font-display mt-3 text-lg font-semibold leading-snug text-foreground">
          {data.headline}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.body}</p>
        <ul className="mt-4 space-y-2">
          {data.points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ai" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
