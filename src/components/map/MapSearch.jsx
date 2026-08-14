import { useMemo, useRef, useState, useEffect } from "react";
import { Search, MapPin, CornerDownLeft, X, Loader2, SlidersHorizontal } from "lucide-react";

import { parseSearchQuery } from "@/services/map/mapService";
import { cn } from "@/lib/utils";
import { categoryIcon } from "./mapMeta";

export function MapSearch({ allIssues, onSelectIssue, onSelectPlace, onApplyFilters, className, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    return parseSearchQuery(query, allIssues);
  }, [query, allIssues]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setLoading(false), 240);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, []);

  const showPanel = open && results !== null;
  const noHits = results && results.places.length === 0 && results.issues.length === 0;

  const pickIssue = (issue) => {
    onSelectIssue?.(issue);
    setQuery("");
    setOpen(false);
  };

  const pickPlace = (place) => {
    onSelectPlace?.(place);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 shadow-lift">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          data-testid="map-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results?.issues[0]) pickIssue(results.issues[0]);
          }}
          placeholder={placeholder ?? "Search roads, issues, places…"}
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-label="Search map"
          aria-expanded={showPanel}
          aria-controls="map-search-results"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="hidden items-center gap-0.5 rounded border px-1 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <CornerDownLeft size={10} /> to jump
          </span>
        )}
      </div>

      {showPanel && (
        <div
          id="map-search-results"
          data-testid="map-search-results"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-80 overflow-y-auto rounded-md border bg-popover p-1.5 shadow-lift"
        >
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              Searching…
            </div>
          )}

          {!loading && results.places.length > 0 && (
            <div>
              <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Places
              </p>
              {results.places.map((place) => (
                <button
                  key={place.key}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickPlace(place)}
                  className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <MapPin size={15} className="shrink-0 text-primary" />
                  <span className="font-medium text-foreground">{place.label}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.issues.length > 0 && (
            <div>
              <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Issues
              </p>
              {results.issues.map((issue) => {
                const Icon = categoryIcon(issue.category);
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickIssue(issue)}
                    className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-foreground">
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{issue.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {issue.location} · AI {issue.priority}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{issue.id}</span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && noHits && (
            <p className="px-3 py-3 text-center text-sm text-muted-foreground">
              No places or issues match “{query}”.
            </p>
          )}

          {!loading && results.filters && (results.filters.statuses?.length || results.filters.priorities?.length || results.filters.maxKm || results.filters.nearMe) && (
            <div className="mt-1 border-t border-border pt-1.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onApplyFilters?.(results.filters);
                  setQuery("");
                  setOpen(false);
                }}
                data-testid="apply-search-filters"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm font-medium text-primary hover:bg-accent"
              >
                <SlidersHorizontal size={14} />
                Apply natural-language filters
                <span className="ml-auto text-[11px] font-normal text-muted-foreground">
                  {[
                    results.filters.statuses?.length ? results.filters.statuses.join(", ") : null,
                    results.filters.priorities?.length ? results.filters.priorities.join(", ") : null,
                    results.filters.maxKm ? `within ${results.filters.maxKm} km` : null,
                    results.filters.nearMe ? "near me" : null,
                  ].filter(Boolean).join(" · ")}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {focused && results && `${results.places.length} places, ${results.issues.length} issues found`}
      </span>
    </div>
  );
}

export const SEARCH_FILTER_HINTS = [
  "“near me”",
  "“within 2 km”",
  "“resolved”",
  "“critical”",
  "“streetlight”",
  "“Ratnanagar”",
];
