import { X } from "lucide-react";

import { MAP_CATEGORIES, MAP_STATUSES, PRIORITY_LEVELS } from "@/services/map/mapService";
import { cn } from "@/lib/utils";

export const TIME_OPTIONS = [
  { key: "all", label: "Any time" },
  { key: "today", label: "Last 24 hours" },
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "90d", label: "Last 90 days" },
];

export const DEFAULT_FILTERS = {
  categories: [],
  statuses: [],
  priorities: [],
  time: "all",
  distance: false,
};

export function countActiveFilters(filters) {
  return (
    filters.categories.length +
    filters.statuses.length +
    filters.priorities.length +
    (filters.time !== "all" ? 1 : 0) +
    (filters.distance ? 1 : 0)
  );
}

function ToggleChip({ active, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </button>
  );
}

export function MapFilters({ filters, onChange, className, userLocation, onRequestLocation }) {
  const toggle = (field, value) => {
    const list = filters[field];
    onChange({
      ...filters,
      [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  };

  return (
    <div className={cn("w-64 rounded-md border bg-popover p-3 shadow-lift", className)} data-testid="map-filters-panel">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MAP_CATEGORIES.map((cat) => (
          <ToggleChip key={cat.key} active={filters.categories.includes(cat.key)} onClick={() => toggle("categories", cat.key)}>
            {cat.label}
          </ToggleChip>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MAP_STATUSES.map((st) => (
          <ToggleChip key={st.key} active={filters.statuses.includes(st.key)} onClick={() => toggle("statuses", st.key)}>
            {st.label}
          </ToggleChip>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priority</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PRIORITY_LEVELS.map((p) => (
          <ToggleChip key={p.key} active={filters.priorities.includes(p.key)} onClick={() => toggle("priorities", p.key)}>
            {p.label}
          </ToggleChip>
        ))}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reported</p>
      <div className="flex flex-wrap gap-1.5">
        {TIME_OPTIONS.map((t) => (
          <ToggleChip
            key={t.key}
            active={filters.time === t.key}
            onClick={() => onChange({ ...filters, time: t.key })}
          >
            {t.label}
          </ToggleChip>
        ))}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <label className="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
          Near my location
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(filters.distance)}
            onClick={() => {
              if (filters.distance) onChange({ ...filters, distance: false });
              else if (userLocation) onChange({ ...filters, distance: true, center: { x: userLocation.x, y: userLocation.y }, maxKm: 2 });
              else onRequestLocation?.();
            }}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              filters.distance ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                filters.distance ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </label>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Show only issues within 2 km of you.
        </p>
      </div>
    </div>
  );
}

export function FilterChips({ filters, onChange, resultCount }) {
  const chips = [];

  filters.categories.forEach((key) => chips.push({ key: `c-${key}`, label: MAP_CATEGORIES.find((c) => c.key === key)?.label ?? key, field: "categories", value: key }));
  filters.statuses.forEach((key) => chips.push({ key: `s-${key}`, label: MAP_STATUSES.find((c) => c.key === key)?.label ?? key, field: "statuses", value: key }));
  filters.priorities.forEach((key) => chips.push({ key: `p-${key}`, label: PRIORITY_LEVELS.find((c) => c.key === key)?.label ?? key, field: "priorities", value: key }));
  if (filters.time !== "all") chips.push({ key: "t", label: TIME_OPTIONS.find((t) => t.key === filters.time)?.label ?? "Time", field: "time", value: filters.time });
  if (filters.distance) chips.push({ key: "d", label: "Within 2 km", field: "distance", value: true });

  if (chips.length === 0) return null;

  const remove = (chip) => {
    if (chip.field === "time") onChange({ ...filters, time: "all" });
    else if (chip.field === "distance") onChange({ ...filters, distance: null });
    else {
      onChange({ ...filters, [chip.field]: filters[chip.field].filter((v) => v !== chip.value) });
    }
  };

  return (
    <div data-testid="filter-chips" className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-foreground shadow-sm"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter ${chip.label}`}
            onClick={() => remove(chip)}
            className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_FILTERS })}
        className="text-xs font-medium text-primary hover:underline"
      >
        Clear all
      </button>
      <span className="ml-1 text-xs text-muted-foreground">{resultCount} shown</span>
    </div>
  );
}
