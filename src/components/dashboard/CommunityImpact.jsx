import { CheckCircle2, FileText, Users, Clock, TrendingUp, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  ai: "bg-ai/10 text-ai",
  brand: "bg-brand/10 text-brand",
};

const STAT_META = {
  success: { key: "issues", icon: CheckCircle2 },
  primary: { key: "reports", icon: FileText },
  brand: { key: "volunteers", icon: Users },
  ai: { key: "time", icon: Clock },
};

export function CommunityImpact({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Community impact</CardTitle>
          <CardDescription>Loading neighborhood stats…</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionSkeleton rows={2} />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <SectionError title="Couldn't load community impact" onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  const stats = Array.isArray(data.stats) ? data.stats : [];
  const chart = Array.isArray(data.chart) ? data.chart : [];
  const note = data.note;
  const maxValue = chart.length > 0 ? Math.max(...chart.map((c) => Number(c.resolved) || 0), 1) : 1;
  const last = chart.at(-1);
  const prev = chart.at(-2);
  const change = last && prev && Number(prev.resolved) > 0
    ? Math.round(((Number(last.resolved) - Number(prev.resolved)) / Number(prev.resolved)) * 100)
    : 0;

  return (
    <section id="impact" className="scroll-mt-24">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Community impact</CardTitle>
            <CardDescription>Neighborhood outcomes this quarter</CardDescription>
          </div>
          {last && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success-foreground">
              <TrendingUp size={12} />
              {change >= 0 ? `+${change}%` : `${change}%`} this month
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const meta = STAT_META[stat.tone] ?? STAT_META.success;
              const Icon = meta.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE_CLASS[stat.tone])}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold leading-none text-foreground">{stat.value}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {last ? <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Issues resolved per month</p>
              <p className="text-xs font-medium text-muted-foreground">
                <span className="text-foreground">{last.month}</span> · {last.resolved}
              </p>
            </div>
            <div className="flex h-28 items-end gap-2">
              {chart.map((c) => (
                <div key={c.month} className="group relative flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-colors",
                      c.month === last.month ? "bg-gradient-to-t from-primary to-ai" : "bg-primary/25 group-hover:bg-primary/40"
                    )}
                    style={{ height: `${Math.max(8, (c.resolved / maxValue) * 100)}%` }}
                    title={`${c.month}: ${c.resolved} resolved`}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">{c.month}</span>
                </div>
              ))}
            </div>
          </div> : (
            <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
              Resolution trends will appear after your reports begin to be resolved.
            </div>
          )}

          <p className="flex items-start gap-2 rounded-lg bg-ai/5 p-3 text-xs leading-relaxed text-ai-foreground">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-ai" />
            {note}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
