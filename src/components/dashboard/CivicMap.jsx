import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Map, MapPin, Flame, ZoomIn, ZoomOut, LocateFixed, X, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { matchesFilter } from "./issueFilters";
import { cn } from "@/lib/utils";

const W = 800;
const H = 500;

export function markerTone(issue) {
  if (issue.status === "resolved") return { label: "Resolved", color: "#16A34A" };
  if (issue.status === "under_review") return { label: "Under review", color: "#0EA5E9" };
  if (issue.severity === "critical") return { label: "Critical", color: "#DC2626" };
  if (issue.severity === "high") return { label: "High", color: "#F97316" };
  if (issue.severity === "medium") return { label: "Medium", color: "#EAB308" };
  return { label: "Low", color: "#64748B" };
}

const LEGEND = [
  { label: "Critical", color: "#DC2626" },
  { label: "High", color: "#F97316" },
  { label: "Medium", color: "#EAB308" },
  { label: "Under review", color: "#0EA5E9" },
  { label: "Resolved", color: "#16A34A" },
];

export function BaseMap() {
  return (
    <g>
      <rect x="0" y="0" width={W} height={H} fill="#F1F5F9" />
      <ellipse cx="180" cy="90" rx="62" ry="42" fill="#DCFCE7" stroke="#BBF7D0" />
      <ellipse cx="700" cy="120" rx="58" ry="46" fill="#DCFCE7" stroke="#BBF7D0" />
      <ellipse cx="240" cy="430" rx="72" ry="44" fill="#DCFCE7" stroke="#BBF7D0" />
      <path
        d="M 120 -20 C 100 90, 175 190, 145 310 C 125 390, 155 445, 135 520"
        stroke="#BAE6FD"
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="#FFFFFF" strokeWidth="3" opacity="0.85">
        <path d="M -20 90 H 820" />
        <path d="M -20 200 H 820" />
        <path d="M -20 320 H 820" />
        <path d="M -20 420 H 820" />
        <path d="M 120 -20 V 520" />
        <path d="M 260 -20 V 520" />
        <path d="M 420 -20 V 520" />
        <path d="M 580 -20 V 520" />
        <path d="M 720 -20 V 520" />
      </g>
      <path
        d="M -20 300 C 150 280, 300 225, 820 185"
        stroke="#E2E8F0"
        strokeWidth="15"
        fill="none"
      />
      <path
        d="M -20 300 C 150 280, 300 225, 820 185"
        stroke="#FFFFFF"
        strokeWidth="10"
        fill="none"
      />
      <path
        d="M 400 -20 C 380 150, 430 340, 400 520"
        stroke="#E2E8F0"
        strokeWidth="15"
        fill="none"
      />
      <path
        d="M 400 -20 C 380 150, 430 340, 400 520"
        stroke="#FFFFFF"
        strokeWidth="10"
        fill="none"
      />
      <g fill="#94A3B8" fontSize="13" fontWeight="500">
        <text x="120" y="160">Bharatpur</text>
        <text x="170" y="240">Narayangadh</text>
        <text x="520" y="260">Tandi</text>
        <text x="300" y="380">Khairhani</text>
        <text x="620" y="320">Sauraha</text>
        <text x="560" y="440">Madi</text>
      </g>
    </g>
  );
}

function MapMarker({ issue, selected, onSelect }) {
  const tone = markerTone(issue);
  const { x, y } = { x: (issue.mapX / 100) * W, y: (issue.mapY / 100) * H };
  const r = selected ? 11 : 8;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Map marker: ${issue.title}`}
      className="cursor-pointer"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(issue);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(issue);
        }
      }}
    >
      <circle cx={x} cy={y} r={r + 6} fill={tone.color} opacity="0.18" />
      <circle cx={x} cy={y} r={r} fill={tone.color} stroke="#FFFFFF" strokeWidth="2" />
    </g>
  );
}

export function CivicMap({ data, loading, error, onRetry, filter }) {
  const [view, setView] = useState("map");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const visible = (data ?? []).filter((issue) => matchesFilter(issue, filter));
  const visibleIds = visible.map((i) => i.id).join(",");

  useEffect(() => {
    setSelected((cur) => (cur && visibleIds.split(",").includes(cur.id) ? cur : null));
  }, [visibleIds]);

  const zoomBy = (factor, point) => {
    const next = Math.min(3, Math.max(1, zoom * factor));
    if (next === zoom) return;
    const p = point ?? { x: W / 2, y: H / 2 };
    setOffset((o) => ({
      x: p.x * (zoom - next) + o.x,
      y: p.y * (zoom - next) + o.y,
    }));
    setZoom(next);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e) => {
    if (e.target.closest?.("[data-marker]")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSelected(null);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({
      x: drag.ox + (e.clientX - drag.startX),
      y: drag.oy + (e.clientY - drag.startY),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const pos = (issue) => ({ x: (issue.mapX / 100) * W, y: (issue.mapY / 100) * H });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interactive map</CardTitle>
          <CardDescription>Loading your neighborhood map…</CardDescription>
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
          <SectionError title="Couldn't load the map" onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  return (
    <section id="map" className="scroll-mt-24">
      <Card className="h-full">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Interactive map</CardTitle>
            <CardDescription>Drag to pan · click a marker to inspect</CardDescription>
          </div>
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-9">
              <TabsTrigger value="map" className="px-3 py-1 text-xs">
                <Map size={13} className="mr-1" />
                Map
              </TabsTrigger>
              <TabsTrigger value="issues" className="px-3 py-1 text-xs">
                <MapPin size={13} className="mr-1" />
                Issues
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="px-3 py-1 text-xs">
                <Flame size={13} className="mr-1" />
                Heatmap
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-lg border bg-slate-50">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="h-80 w-full cursor-grab touch-none select-none active:cursor-grabbing md:h-96"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              role="img"
              aria-label={`Interactive map showing ${visible.length} nearby issues`}
            >
              <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
                <BaseMap />
                {view === "heatmap" ? (
                  <g>
                    <defs>
                      <radialGradient id="heat-blob">
                        <stop offset="0%" stopColor="#DC2626" stopOpacity="0.5" />
                        <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {visible.map((issue) => {
                      const p = pos(issue);
                      const r = 16 + issue.priority * 0.22;
                      return (
                        <circle key={issue.id} cx={p.x} cy={p.y} r={r} fill="url(#heat-blob)" />
                      );
                    })}
                  </g>
                ) : (
                  <g data-marker>
                    {visible.map((issue) => (
                      <MapMarker
                        key={issue.id}
                        issue={issue}
                        selected={selected?.id === issue.id}
                        onSelect={setSelected}
                      />
                    ))}
                  </g>
                )}
              </g>
            </svg>

            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom in"
                className="h-9 w-9 bg-background"
                onClick={() => zoomBy(1.3)}
              >
                <ZoomIn size={15} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom out"
                className="h-9 w-9 bg-background"
                onClick={() => zoomBy(1 / 1.3)}
              >
                <ZoomOut size={15} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Reset map view"
                className="h-9 w-9 bg-background"
                onClick={resetView}
              >
                <LocateFixed size={15} />
              </Button>
            </div>

            {visible.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="rounded-lg border bg-background/95 px-5 py-4 text-center shadow-soft backdrop-blur-sm">
                  <MapPin size={20} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold text-foreground">No new report markers</p>
                  <p className="mt-1 text-xs text-muted-foreground">Newly submitted problems will appear here.</p>
                </div>
              </div>
            )}

            {visible.length > 0 && <div className="pointer-events-none absolute bottom-3 left-3 hidden flex-wrap gap-2 sm:flex">
              <div className="pointer-events-auto rounded-md border bg-background/90 p-2 shadow-soft backdrop-blur-sm">
                <div className="flex flex-col gap-1.5">
                  {LEGEND.map((item) => (
                    <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>}

            {view === "heatmap" && (
              <Badge variant="secondary" className="absolute left-3 top-3 font-normal">
                <Sparkles size={11} className="text-ai" />
                Density of reports
              </Badge>
            )}

            {view === "issues" && (
              <Badge variant="secondary" className="absolute left-3 top-3 font-normal">
                <MapPin size={11} className="text-primary" />
                {visible.length} active markers
              </Badge>
            )}

            <AnimatedPopup
              issue={selected}
              onClose={() => setSelected(null)}
              view={view}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function AnimatedPopup({ issue, onClose, view }) {
  if (!issue) return null;
  const tone = markerTone(issue);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-3 bottom-3 z-10 rounded-lg border bg-background p-3.5 shadow-lift sm:inset-x-auto sm:bottom-3 sm:left-3 sm:w-72"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.color }} />
          <p className="text-sm font-semibold text-foreground">{issue.title}</p>
        </div>
        <Button size="icon" variant="ghost" aria-label="Close marker details" className="h-6 w-6" onClick={onClose}>
          <X size={13} />
        </Button>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{issue.description}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} className="px-2 py-0.5 text-[10px]" />
        <SeverityBadge severity={issue.severity} className="px-2 py-0.5 text-[10px]" />
        <span className="text-xs text-muted-foreground">{issue.location} · {issue.distance}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{issue.id}</span>
        <span className={cn("font-semibold")}>
          AI <span className="text-foreground">{issue.priority}</span>/100
        </span>
      </div>
      {view === "heatmap" && (
        <p className="mt-2 text-[11px] text-muted-foreground">Shown in density heatmap</p>
      )}
    </motion.div>
  );
}
