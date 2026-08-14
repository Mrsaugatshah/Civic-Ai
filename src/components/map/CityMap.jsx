import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

import { CANVAS_W, CANVAS_H, KM_PER_UNIT } from "@/services/map/mapService";
import { BaseCityMap } from "./BaseCityMap";
import { IssueMarker } from "./IssueMarker";
import { IssueCluster } from "./IssueCluster";
import { UserLocationMarker } from "./UserLocationMarker";
import { IssuePreview } from "./IssuePreview";
import { HeatmapLayer } from "./HeatmapLayer";
import { ProgressMarker } from "./ProgressMarker";

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 4.5;
const CLUSTER_CELL_PX = 56;
const PREVIEW_W = 250;

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function clampCenter(cx, cy, s, cw, ch) {
  return {
    cx: clamp(cx, (cw * 0.25 - 500 * s) / s, (cw * 0.75 + 500 * s) / s),
    cy: clamp(cy, (ch * 0.25 - 300 * s) / s, (ch * 0.75 + 300 * s) / s),
  };
}

export const CityMap = forwardRef(function CityMap(
  { issues = [], layers = {}, userLocation = null, selectedId = null, onSelect, highlightId = null, onViewChange },
  ref
) {
  const reduce = useReducedMotion();
  const containerRef = useRef(null);
  const [size, setSize] = useState({ cw: 800, ch: 520 });
  const [view, setView] = useState({ zoom: 1, cx: CANVAS_W / 2, cy: CANVAS_H / 2 });
  const [hovered, setHovered] = useState(null);
  const [clusterList, setClusterList] = useState(null);
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ cw: r.width, ch: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    onViewChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.cx, view.cy, view.zoom]);

  const baseScale = Math.min(size.cw / CANVAS_W, size.ch / CANVAS_H);
  const s = baseScale * view.zoom;
  const { cx, cy, zoom } = view;

  const setViewClamped = useCallback(
    (next, immediateClamp = true) => {
      setView((v) => {
        const merged = { ...v, ...next };
        if (immediateClamp) {
          const c = clampCenter(merged.cx, merged.cy, baseScale * merged.zoom, size.cw, size.ch);
          return { ...merged, ...c };
        }
        return merged;
      });
    },
    [baseScale, size.cw, size.ch]
  );

  const flyTo = useCallback(
    (x, y, nextZoom, duration = 500) => {
      const from = viewRef.current;
      const nz = clamp(nextZoom, ZOOM_MIN, ZOOM_MAX);
      const c = clampCenter(x, y, baseScale * nz, size.cw, size.ch);
      if (reduce) {
        setView({ zoom: nz, cx: c.cx, cy: c.cy });
        return;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = clamp((now - t0) / duration, 0, 1);
        const k = ease(t);
        setView({
          zoom: from.zoom + (nz - from.zoom) * k,
          cx: from.cx + (c.cx - from.cx) * k,
          cy: from.cy + (c.cy - from.cy) * k,
        });
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [baseScale, size.cw, size.ch, reduce]
  );

  const zoomAt = useCallback(
    (factor, px = null, py = null) => {
      const sNow = baseScale * viewRef.current.zoom;
      const nz = clamp(viewRef.current.zoom * factor, ZOOM_MIN, ZOOM_MAX);
      const cxNow = viewRef.current.cx;
      const cyNow = viewRef.current.cy;
      if (px == null) {
        flyTo(cxNow, cyNow, nz, 220);
        return;
      }
      const c = { x: (px - size.cw / 2) / sNow + cxNow, y: (py - size.ch / 2) / sNow + cyNow };
      const sNext = baseScale * nz;
      const clamped = clampCenter(
        c.x - (px - size.cw / 2) / sNext,
        c.y - (py - size.ch / 2) / sNext,
        sNext,
        size.cw,
        size.ch
      );
      setView({ zoom: nz, cx: clamped.cx, cy: clamped.cy });
    },
    [baseScale, size.cw, size.ch, flyTo]
  );

  useImperativeHandle(ref, () => ({
    flyTo,
    zoomBy: (factor) => zoomAt(factor),
    getView: () => viewRef.current,
    zoomLevel: () => viewRef.current.zoom,
  }), [flyTo, zoomAt]);

  /* ------------------------- pointer drag ------------------------- */

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, cx: viewRef.current.cx, cy: viewRef.current.cy };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setClusterList(null);
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const sNow = baseScale * viewRef.current.zoom;
    const moved = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    if (moved > 3) setHovered(null);
    setViewClamped({
      cx: d.cx - (e.clientX - d.startX) / sNow,
      cy: d.cy - (e.clientY - d.startY) / sNow,
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.0016), e.clientX - rect.left, e.clientY - rect.top);
  };

  const onDoubleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    zoomAt(1.6, e.clientX - rect.left, e.clientY - rect.top);
  };

  /* --------------------------- markers ---------------------------- */

  const toScreen = useCallback(
    (x, y) => ({ sx: (x - viewRef.current.cx) * s + size.cw / 2, sy: (y - viewRef.current.cy) * s + size.ch / 2 }),
    [s, size.cw, size.ch]
  );

  const clustered = useMemo(() => {
    const visible = issues.filter((i) => {
      const { sx, sy } = toScreen(i.x, i.y);
      return sx > -60 && sx < size.cw + 60 && sy > -60 && sy < size.ch + 60;
    });
    if (layers.heatmap || layers.progress) return { clusters: [], singles: visible };

    const cell = CLUSTER_CELL_PX / s;
    const grid = new Map();
    for (const issue of visible) {
      const gx = Math.floor(issue.x / cell);
      const gy = Math.floor(issue.y / cell);
      const key = `${gx}:${gy}`;
      const bucket = grid.get(key) ?? [];
      bucket.push(issue);
      grid.set(key, bucket);
    }
    const clusters = [];
    const singles = [];
    for (const bucket of grid.values()) {
      if (bucket.length === 1) {
        singles.push(bucket[0]);
      } else {
        const cxSum = bucket.reduce((a, i) => a + i.x, 0);
        const cySum = bucket.reduce((a, i) => a + i.y, 0);
        const breakdown = {};
        for (const i of bucket) breakdown[i.category] = (breakdown[i.category] ?? 0) + 1;
        clusters.push({
          x: cxSum / bucket.length,
          y: cySum / bucket.length,
          count: bucket.length,
          breakdown,
          issues: bucket,
        });
      }
    }
    return { clusters, singles };
  }, [issues, s, size.cw, size.ch, toScreen, layers.heatmap, layers.progress]);

  const handleSelect = (issue) => {
    setClusterList(null);
    onSelect?.(issue);
  };

  const handleCluster = (cluster) => {
    if (zoom >= ZOOM_MAX - 0.2) {
      setClusterList(cluster);
      return;
    }
    flyTo(cluster.x, cluster.y, zoom + 1.1, 420);
  };

  const showHeatmap = layers.heatmap;
  const showProgress = layers.progress;

  const previewPos = hovered
    ? toScreen(hovered.x, hovered.y)
    : null;

  return (
    <div
      ref={containerRef}
      data-testid="city-map"
      className="relative h-full w-full touch-none select-none overflow-hidden bg-[#EEF2F7]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      onDoubleClick={onDoubleClick}
      role="application"
      aria-label={`Interactive city map showing ${issues.length} issues`}
    >
      {/* base map, scaled around the view center */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: size.cw / 2 - cx * s,
          top: size.ch / 2 - cy * s,
          width: CANVAS_W * s,
          height: CANVAS_H * s,
        }}
      >
        <BaseCityMap showNeighborhoods={layers.neighborhoods} />
      </div>

      {/* heatmap concentration layer */}
      {showHeatmap && <HeatmapLayer issues={issues} view={view} size={size} baseScale={baseScale} />}

      {/* markers / clusters */}
      <div className="pointer-events-none absolute inset-0">
        {layers.issues && !showProgress &&
          clustered.clusters.map((cluster) => (
            <IssueCluster
              key={`${cluster.x.toFixed(1)}-${cluster.y.toFixed(1)}`}
              cluster={cluster}
              screen={toScreen(cluster.x, cluster.y)}
              onClick={() => handleCluster(cluster)}
            />
          ))}
        {layers.issues &&
          (showProgress ? (
            clustered.singles.map((issue) => (
              <ProgressMarker
                key={issue.id}
                issue={issue}
                screen={toScreen(issue.x, issue.y)}
                selected={issue.id === selectedId}
                onSelect={() => handleSelect(issue)}
              />
            ))
          ) : (
            clustered.singles.map((issue) => (
              <IssueMarker
                key={issue.id}
                issue={issue}
                screen={toScreen(issue.x, issue.y)}
                selected={issue.id === selectedId}
                highlighted={issue.id === highlightId}
                onSelect={() => handleSelect(issue)}
                onHover={setHovered}
              />
            ))
          ))}
      </div>

      {userLocation && (
        <UserLocationMarker screen={toScreen(userLocation.x, userLocation.y)} accuracyPx={userLocation.accuracyKm / KM_PER_UNIT * s} />
      )}

      {/* hover preview */}
      {hovered && previewPos && layers.issues && !showProgress && !showHeatmap && (
        <IssuePreview
          issue={hovered}
          screen={previewPos}
          flip={previewPos.sx > size.cw - PREVIEW_W - 16}
          flipY={previewPos.sy > size.ch - 150}
        />
      )}

      {/* cluster list popover */}
      {clusterList && (
        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-3 shadow-lift">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">
                {clusterList.count} issues in this area
              </p>
              <button
                type="button"
                aria-label="Close cluster list"
                onClick={() => setClusterList(null)}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {clusterList.issues.slice(0, 8).map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(issue)}
                    className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
                  >
                    <span className="truncate font-medium text-foreground">{issue.title}</span>
                    <span className="shrink-0 text-muted-foreground">{issue.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});
