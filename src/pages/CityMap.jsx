import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Map as MapIcon, List, Navigation } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

import { CITY_CENTER, KM_PER_UNIT, fetchCityIssues, matchesFilters, computeInsights } from "@/services/map/mapService";
import { CityMap } from "@/components/map/CityMap";
import { MapSearch } from "@/components/map/MapSearch";
import { MapControls } from "@/components/map/MapControls";
import { MapFilters, FilterChips, DEFAULT_FILTERS } from "@/components/map/MapFilters";
import { MapLayers } from "@/components/map/MapLayers";
import { MapLegend } from "@/components/map/MapLegend";
import { AreaSummary } from "@/components/map/AreaSummary";
import { AIMapInsight } from "@/components/map/AIMapInsight";
import { IssueDetailDrawer } from "@/components/map/IssueDetailDrawer";
import { IssueBottomSheet } from "@/components/map/IssueBottomSheet";
import { ListIssues } from "@/components/map/ListIssues";
import { Button } from "@/components/ui/button";

const CITY_REF = { lat: 27.68, lon: 84.43 };
const KM_PER_DEG_LAT = 111.32;
const KM_PER_DEG_LON = 111.32 * Math.cos((27.704 * Math.PI) / 180);

function gpsToCanvas(lat, lon) {
  return {
    x: CITY_CENTER.x + ((lon - CITY_REF.lon) * KM_PER_DEG_LON) / KM_PER_UNIT,
    y: CITY_CENTER.y - ((lat - CITY_REF.lat) * KM_PER_DEG_LAT) / KM_PER_UNIT,
  };
}

const DEFAULT_LAYERS = { issues: true, heatmap: false, progress: false, neighborhoods: true };

export function CityMapPage() {
  const mapRef = useRef(null);
  const location = useLocation();
  const [mode, setMode] = useState("map");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [view, setView] = useState({ zoom: 1, cx: CITY_CENTER.x, cy: CITY_CENTER.y });
  const notifShown = useRef(false);

  const [allIssues,setAllIssues]=useState([]);
  const [mapLoading,setMapLoading]=useState(true);
  const [mapError,setMapError]=useState("");
  const loadIssues = useCallback(async () => {
    setMapLoading(true); setMapError("");
    try { setAllIssues(await fetchCityIssues()); }
    catch (error) { setMapError(error.message || "Unable to load civic reports."); }
    finally { setMapLoading(false); }
  }, []);
  useEffect(() => { loadIssues(); }, [loadIssues]);
  const filtered = useMemo(() => allIssues.filter((issue) => matchesFilters(issue, filters)), [allIssues, filters]);
  const insights = useMemo(() => computeInsights(allIssues), [allIssues]);

  const flyTo = useCallback((x, y, zoom, duration) => {
    mapRef.current?.flyTo(x, y, zoom, duration);
  }, []);

  const selectIssue = useCallback((issue, { fly = true, zoom = 3 } = {}) => {
    setSelected(issue);
    setFiltersOpen(false);
    setLayersOpen(false);
    if (fly) flyTo(issue.x, issue.y, zoom, 450);
    setHighlightId(issue.id);
    window.clearTimeout(selectIssue.timeout);
    selectIssue.timeout = window.setTimeout(() => setHighlightId(null), 2600);
  }, [flyTo]);

  /* Focus an issue requested via navigation state (e.g. admin "View on Map"). */
  const focusId = location.state?.focusIssueId;
  useEffect(() => {
    if (!focusId) return;
    let target = allIssues.find((issue) => issue.id === focusId);
    if (!target) {
      const { category } = location.state ?? {};
      target = [...allIssues]
        .filter((issue) => (category ? issue.category === category : true))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
    }
    if (target) selectIssue(target, { zoom: 3.4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, allIssues.length]);

  const handleViewChange = useCallback((v) => {
    setView((prev) =>
      prev.cx !== v.cx || prev.cy !== v.cy || prev.zoom !== v.zoom ? v : prev
    );
  }, []);

  /* New-report notification on first load. */
  useEffect(() => {
    if (notifShown.current) return;
    notifShown.current = true;
    const newest = [...allIssues].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))[0];
    if (!newest) return undefined;
    toast(`New report nearby: “${newest.title}”`, {
      description: `${newest.location} · ${newest.id} · awaiting review`,
      action: { label: "View", onClick: () => selectIssue(newest, { zoom: 3.4 }) },
      duration: 8000,
    });
    return undefined;
  }, [allIssues, selectIssue]);

  const locate = useCallback(() => {
    setLocating(true);
    const finish = (pos) => {
      const p = gpsToCanvas(pos.lat, pos.lon);
      const clamped = {
        x: Math.min(1000, Math.max(0, p.x)),
        y: Math.min(600, Math.max(0, p.y)),
      };
      setUserLocation({ ...clamped, accuracyKm: (pos.accuracy ?? 300) / 1000 });
      flyTo(clamped.x, clamped.y, 2.2, 600);
      setLocating(false);
    };
    const failed = () => { setLocating(false); toast.error("Your location could not be determined. Check permission and try again."); };
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (g) => finish({ lat: g.coords.latitude, lon: g.coords.longitude, accuracy: g.coords.accuracy }),
        failed,
        { timeout: 4000, maximumAge: 120000 }
      );
    } else {
      failed();
    }
  }, [flyTo]);

  const applyFiltersFromSearch = useCallback((parsed) => {
    const next = { ...filters };
    if (parsed.statuses?.length) next.statuses = [...new Set([...next.statuses, ...parsed.statuses])];
    if (parsed.priorities?.length) next.priorities = [...new Set([...next.priorities, ...parsed.priorities])];
    if (parsed.maxKm) next.distance = true;
    if (parsed.nearMe && userLocation) {
      next.distance = true;
      next.center = { x: userLocation.x, y: userLocation.y };
      next.maxKm = next.maxKm ?? 2;
    } else if (parsed.nearMe) {
      locate();
      toast.info("Allow location access to filter nearby reports.");
    }
    if (parsed.center && parsed.maxKm) {
      next.center = parsed.center;
      next.maxKm = parsed.maxKm;
    }
    if (parsed.statuses?.length || parsed.priorities?.length || next.distance) {
      setFilters(next);
      toast.success("Filters applied from your search.");
    }
  }, [filters, locate, userLocation]);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar active="City map" />

      <div className="h-[calc(100dvh-4rem)]">
        {/* map toolbar */}
        <div className="flex items-center gap-3 border-b bg-background px-3 py-2.5 sm:px-4">
          <div className="hidden shrink-0 lg:block">
            <h1 className="font-display text-base font-bold leading-tight text-foreground">City map</h1>
            <p className="text-xs text-muted-foreground">Every report, one view</p>
          </div>

          <MapSearch
            className="w-full max-w-md flex-1"
            allIssues={allIssues}
            onSelectIssue={(issue) => selectIssue(issue)}
            onSelectPlace={(place) => flyTo(place.x, place.y, 2.6, 500)}
            onApplyFilters={applyFiltersFromSearch}
          />

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success-foreground sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                {filtered.length} authorized
            </span>
            <div className="flex rounded-md border bg-background p-0.5" role="tablist" aria-label="Map or list view">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "map"}
                data-testid="view-map"
                onClick={() => setMode("map")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                  mode === "map" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MapIcon size={14} /> Map
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "list"}
                data-testid="view-list"
                onClick={() => setMode("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors",
                  mode === "list" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={14} /> List
              </button>
            </div>
          </div>
        </div>

        {/* map area */}
        <div className="relative h-[calc(100dvh-8rem)]">
          {mode === "map" ? (
            <>
              <CityMap
                ref={mapRef}
                issues={filtered}
                layers={layers}
                userLocation={userLocation}
                selectedId={selected?.id ?? null}
                highlightId={highlightId}
                onSelect={selectIssue}
                onViewChange={handleViewChange}
              />
              {mapLoading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/35 backdrop-blur-[1px]"><div className="rounded-lg border bg-background/95 px-4 py-3 text-sm text-muted-foreground shadow-lift">Loading authorized civic reports…</div></div>}
              {!mapLoading && mapError && <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/35 px-4"><div className="max-w-sm rounded-lg border bg-background p-5 text-center shadow-lift"><p className="font-semibold text-foreground">Unable to load civic reports</p><p className="mt-1 text-sm text-muted-foreground">{mapError}</p><Button variant="outline" className="mt-4" onClick={loadIssues}>Retry</Button></div></div>}
              {!mapLoading && !mapError && allIssues.length === 0 && <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4"><div className="rounded-lg border bg-background/95 px-4 py-3 text-center text-sm text-muted-foreground shadow-lift">No reported issues in this area yet.</div></div>}

              {/* left column */}
              <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-2 lg:bottom-3 lg:top-auto">
                <MapLegend mode={layers.progress ? "progress" : "severity"} className="pointer-events-auto w-56 lg:w-60" />
                <AreaSummary
                  view={view}
                  className="pointer-events-auto hidden w-64 rounded-md border bg-background/95 p-3 shadow-lift backdrop-blur lg:block"
                  onExplore={() => flyTo(view.cx, view.cy, Math.max(view.zoom, 1.7), 450)}
                />
              </div>

              {/* AI insight (desktop) */}
              <div className="pointer-events-none absolute bottom-3 left-3 z-20 hidden lg:block">
                <AIMapInsight
                  insights={insights}
                  className="pointer-events-auto w-80"
                  onExplore={(focus) => flyTo(focus.cx, focus.cy, 2.6, 550)}
                />
              </div>

              {/* controls */}
              <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
                <MapControls
                  onZoomIn={() => mapRef.current?.zoomBy(1.3)}
                  onZoomOut={() => mapRef.current?.zoomBy(1 / 1.3)}
                  onLocate={locate}
                  locating={locating}
                  onReset={() => {
                    setUserLocation(null);
                    flyTo(CITY_CENTER.x, CITY_CENTER.y, 1, 500);
                  }}
                  layersOpen={layersOpen}
                  onLayers={() => {
                    setLayersOpen((v) => !v);
                    setFiltersOpen(false);
                  }}
                  filtersOpen={filtersOpen}
                  onFilters={() => {
                    setFiltersOpen((v) => !v);
                    setLayersOpen(false);
                  }}
                />
                {layersOpen && <MapLayers layers={layers} onChange={setLayers} className="pointer-events-auto w-60" />}
                {filtersOpen && (
                  <MapFilters
                    filters={filters}
                    onChange={setFilters}
                    userLocation={userLocation}
                    onRequestLocation={locate}
                    className="pointer-events-auto max-h-[60dvh] overflow-y-auto"
                  />
                )}
              </div>

              {/* filter chips */}
              <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
                <div className="pointer-events-auto">
                  <FilterChips filters={filters} onChange={setFilters} resultCount={filtered.length} />
                </div>
              </div>

              {/* progress-mode hint */}
              {layers.progress && (
                <div className="pointer-events-none absolute bottom-3 right-3 z-10 hidden sm:block">
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lift backdrop-blur">
                    <Navigation size={12} className="text-info" />
                    Markers colored by work status
                  </span>
                </div>
              )}

              <IssueDetailDrawer
                issue={selected}
                onClose={() => setSelected(null)}
                onSelectRelated={(issue) => selectIssue(issue)}
              />
              <IssueBottomSheet
                issue={selected}
                onClose={() => setSelected(null)}
                onSelectRelated={(issue) => selectIssue(issue)}
              />
            </>
          ) : (
            <>
              <div className="h-full overflow-y-auto bg-accent/30 pb-8">
                <ListIssues
                  issues={filtered}
                  onSelect={(issue) => selectIssue(issue, { fly: false })}
                  onBackToMap={() => setMode("map")}
                  onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                />
              </div>
              <IssueDetailDrawer
                issue={selected}
                onClose={() => setSelected(null)}
                onSelectRelated={(issue) => selectIssue(issue, { fly: false })}
              />
              <IssueBottomSheet
                issue={selected}
                onClose={() => setSelected(null)}
                onSelectRelated={(issue) => selectIssue(issue, { fly: false })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
