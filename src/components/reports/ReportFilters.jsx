import { ArrowDownWideNarrow, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusMeta } from "./reportMeta";
import { cn } from "@/lib/utils";

export const REPORT_STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export const REPORT_SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "priority", label: "Highest Priority" },
  { key: "updated", label: "Recently Updated" },
];

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        <X size={12} />
      </button>
    </span>
  );
}

export function ReportFilters({
  status,
  onStatusChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
}) {
  const activeFilters = [];
  if (status !== "all") {
    const meta = statusMeta(status);
    activeFilters.push({
      label: meta.label,
      onRemove: () => onStatusChange("all"),
    });
  }
  if (sort !== "newest") {
    activeFilters.push({
      label: REPORT_SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Newest",
      onRemove: () => onSortChange("newest"),
    });
  }
  if (query.trim()) {
    activeFilters.push({ label: `“${query.trim()}”`, onRemove: () => onQueryChange("") });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          role="tablist"
          aria-label="Filter reports by status"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-1 sm:flex-wrap sm:pb-0"
        >
          {REPORT_STATUS_OPTIONS.map((option) => {
            const active = status === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onStatusChange(option.key)}
                className={cn(
                  "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="shrink-0">
          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 w-full gap-2 text-xs sm:w-44" aria-label="Sort reports">
              <ArrowDownWideNarrow size={13} aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Active filters
          </span>
          {activeFilters.map((filter, i) => (
            <FilterChip key={`${filter.label}-${i}`} label={filter.label} onRemove={filter.onRemove} />
          ))}
          {activeFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-primary"
              onClick={() => {
                onStatusChange("all");
                onSortChange("newest");
                onQueryChange("");
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
