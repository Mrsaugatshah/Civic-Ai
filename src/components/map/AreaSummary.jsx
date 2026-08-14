import { Activity, TrendingUp, TrendingDown, CheckCircle2, MapPin } from "lucide-react";

import { areaSummary, neighborhoodAt } from "@/services/map/mapService";
import { CATEGORY_LABEL } from "@/services/map/mapService";

export function AreaSummary({ view, onExplore, className }) {
  const summary = areaSummary(view.cx, view.cy);
  const hood = neighborhoodAt(view.cx, view.cy);
  const topCategory = Object.entries(summary.breakdown).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={className} data-testid="area-summary">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
          <MapPin size={12} className="text-primary" />
          {hood ? `${hood.name} area` : "This area"}
        </p>
        {typeof summary.trendPct === "number" && summary.trendPct !== 0 && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              summary.trendPct > 0 ? "bg-success/10 text-success-foreground" : "bg-warning/10 text-warning-foreground"
            }`}
          >
            {summary.trendPct > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {summary.trendPct > 0 ? "+" : ""}{summary.trendPct}% this week
          </span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="rounded-md border bg-background p-2">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Activity size={10} /> Active
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{summary.active}</p>
        </div>
        <div className="rounded-md border bg-background p-2">
          <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <CheckCircle2 size={10} /> Resolved
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-success-foreground">{summary.resolvedThisWeek}</p>
        </div>
        <div className="rounded-md border bg-background p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{summary.total}</p>
        </div>
      </div>

      {topCategory && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Most reported here: <span className="font-semibold text-foreground">{CATEGORY_LABEL[topCategory[0]] ?? topCategory[0]}</span> ({topCategory[1]})
        </p>
      )}

      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="mt-2 w-full rounded-md border border-dashed bg-accent/40 px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
        >
          Explore this area
        </button>
      )}
    </div>
  );
}
