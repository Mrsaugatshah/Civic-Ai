import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SectionError } from "@/components/dashboard/SectionError";

export function AIInsights({ data, loading, error, onRetry }) {
  const navigate = useNavigate();

  return (
    <section id="insights" className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-ai" />
        <h2 className="font-display text-xl font-bold text-foreground">CivicAI Insights</h2>
      </div>

      {error ? (
        <SectionError title="Couldn't load AI insights" onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Insights will appear after citizens submit reports.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.map((insight) => (
            <div
              key={insight.id}
              className="relative overflow-hidden rounded-lg border border-ai/25 bg-ai-gradient p-5"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-ai/15 blur-2xl"
              />
              <h3 className="font-display relative text-sm font-semibold text-foreground">{insight.title}</h3>
              <p className="relative mt-1.5 text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
              <div className="relative mt-3 flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{insight.metric}</span>
                <span className="inline-flex items-center gap-0.5 text-ai-foreground">
                  <TrendingUp size={11} /> {insight.trend}
                </span>
              </div>
              <p className="relative mt-1 text-[11px] text-muted-foreground">{insight.period}</p>
              {insight.category && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative -ml-2 mt-2 w-fit text-ai-foreground hover:text-ai-foreground"
                  onClick={() => navigate("/map")}
                >
                  Explore on Map <ArrowRight size={13} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
