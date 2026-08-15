import { MapPin, FilterX } from "lucide-react";

import { CATEGORY_LABEL, priorityLevel } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";

function reportedLabel(iso) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ListIssues({ issues, onSelect, onBackToMap, onClearFilters, className }) {
  return (
    <div className={className} data-testid="issues-list">
      <div className="flex items-center justify-between gap-2 px-4 pb-3">
        <p className="text-sm font-semibold text-foreground">
          {issues.length} issue{issues.length === 1 ? "" : "s"} match
        </p>
        <button
          type="button"
          onClick={onBackToMap}
          data-testid="back-to-map"
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Back to map
        </button>
      </div>
      {issues.length === 0 ? (
        <div className="mx-4 rounded-lg border border-dashed bg-accent/40 p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No civic issues found in this area.</p>
          <p className="mt-1 text-xs">No issues match the current filters.</p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <FilterX size={13} /> Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2 px-4 pb-6">
          {issues.slice(0, 50).map((issue) => {
            const Icon = categoryIcon(issue.category);
            const level = priorityLevel(issue.priority);
            return (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(issue)}
                  className="flex w-full items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{issue.title}</span>
                      <StatusBadge status={issue.status} className="shrink-0 px-2 py-0.5 text-[10px]" />
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {issue.location} · {reportedLabel(issue.reportedAt)}
                      </span>
                      <SeverityBadge severity={issue.severity} className="px-2 py-0 text-[10px]" />
                      <span className="font-semibold text-foreground">{issue.priority == null ? "AI analysis pending" : level.label}</span>
                    </span>
                    {issue.priority != null && <span className="mt-2 block"><PriorityMeter score={issue.priority} className="!space-y-1" /></span>}
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {CATEGORY_LABEL[issue.category] ?? "Issue"} · {issue.id}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
