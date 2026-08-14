import { useEffect, useRef, useState } from "react";
import {
  LocateFixed,
  Search,
  MapPin,
  ZoomIn,
  ZoomOut,
  Loader2,
  Check,
  CircleAlert,
  MapPinOff,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BaseMap } from "@/components/dashboard/CivicMap";
import { REPORT_PLACES, placeNameForCoords } from "@/services/report/reportService";

const W = 800;
const H = 500;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function nearestPlaceName(x, y) {
  let best = null;
  let bestDist = 36;
  for (const place of REPORT_PLACES) {
    const dist = Math.hypot(place.mapX * (W / 100) - x, place.mapY * (H / 100) - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = place;
    }
  }
  return best ? placeNameForCoords(best.mapX, best.mapY) : null;
}

export function LocationStep({ value, onChange, error, disabled }) {
  const svgRef = useRef(null);
  const [pin, setPin] = useState(
    value?.mapX != null ? { x: (value.mapX / 100) * W, y: (value.mapY / 100) * H } : null
  );
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    if (value?.mapX != null) {
      setPin({ x: (value.mapX / 100) * W, y: (value.mapY / 100) * H });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.mapX, value?.mapY]);

  const toSvgPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const applyPin = (rawX, rawY) => {
    const x = clamp(rawX, 0, W);
    const y = clamp(rawY, 0, H);
    setPin({ x, y });
    const mapX = Math.round((x / W) * 100);
    const mapY = Math.round((y / H) * 100);
    const name = placeNameForCoords(mapX, mapY) ?? nearestPlaceName(x, y);
    const longitude = 84.34 + (mapX / 100) * 0.18;
    const latitude = 27.78 - (mapY / 100) * 0.12;
    onChange({ name: name || "Selected map location", mapX, mapY, latitude, longitude, confirmed: true });
  };

  const zoomBy = (factor) => {
    const next = clamp(zoom * factor, 1, 3);
    if (next === zoom) return;
    setOffset((o) => ({
      x: (W / 2) * (zoom - next) + o.x,
      y: (H / 2) * (zoom - next) + o.y,
    }));
    setZoom(next);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e) => {
    if (e.target.closest?.("[data-pin]")) {
      dragRef.current = {
        mode: "pin",
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        pinX: pin?.x ?? W / 2,
        pinY: pin?.y ?? H / 2,
      };
      e.currentTarget.setPointerCapture?.(e.pointerId);
      return;
    }
    dragRef.current = {
      mode: "pan",
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.mode === "pin") {
      const x = clamp(drag.pinX + (e.clientX - drag.startX) / zoom, 0, W);
      const y = clamp(drag.pinY + (e.clientY - drag.startY) / zoom, 0, H);
      setPin({ x, y });
      return;
    }
    setOffset({ x: drag.ox + (e.clientX - drag.startX), y: drag.oy + (e.clientY - drag.startY) });
  };

  const endDrag = (e) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.mode === "pin") {
      const x = drag.pinX + (e.clientX - drag.startX) / zoom;
      const y = drag.pinY + (e.clientY - drag.startY) / zoom;
      applyPin(x, y);
      onChange({ name: value?.name || "Current GPS location", mapX: Math.round((clamp(x,0,W)/W)*100), mapY: Math.round((clamp(y,0,H)/H)*100), latitude: lat, longitude: lng, confirmed: true });
      return;
    }
    if (
      drag?.mode === "pan" &&
      Math.abs(e.clientX - drag.startX) < 4 &&
      Math.abs(e.clientY - drag.startY) < 4
    ) {
      const p = toSvgPoint(e.clientX, e.clientY);
      if (p) applyPin((p.x - offset.x) / zoom, (p.y - offset.y) / zoom);
    }
  };

  const selectPlace = (place) => {
    setQuery("");
    applyPin((place.mapX / 100) * W, (place.mapY / 100) * H);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      fallbackLocation();
      return;
    }
    setLocating(true);
    let settled = false;
    const once = (fn) => () => {
      if (settled) return;
      settled = true;
      fn();
    };
    const onSuccess = once((pos) => {
      const lng = pos.coords.longitude;
      const lat = pos.coords.latitude;
      const x = ((lng - 84.34) / 0.18) * W;
      const y = ((27.78 - lat) / 0.12) * H;
      applyPin(x, y);
      setSimulated(false);
      setLocating(false);
      toast.success("Location updated to your current position.");
    });
    const onError = once(() => fallbackLocation());
    try {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 6000 });
      // Some browsers hang instead of resolving permission — fall back anyway.
      setTimeout(once(() => fallbackLocation()), 5000);
    } catch {
      fallbackLocation();
    }
  };

  const fallbackLocation = () => {
    setSimulated(false);
    setLocating(false);
    toast.error("Location sharing is unavailable. Search for an area or drop the pin manually.");
  };

  const matches = query
    ? REPORT_PLACES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const name = value?.name ?? (pin ? nearestPlaceName(pin.x, pin.y) : null);
  const confirmed = Boolean(value?.confirmed);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">
                Where is the issue?
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Drop the pin on the exact spot so the right team can find it.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={useMyLocation} disabled={disabled || locating}>
              {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              {locating ? "Locating…" : "Use current location"}
            </Button>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a street or area, e.g. Narayangadh"
              className="pl-9"
              aria-label="Search for a location"
              disabled={disabled}
            />
            {matches.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lift">
                {matches.map((place) => (
                  <button
                    key={place.name}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent"
                  >
                    <MapPin size={14} className="text-primary" />
                    {place.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-lg border bg-slate-50">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="h-72 w-full cursor-crosshair touch-none select-none md:h-80"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              role="img"
              aria-label="Map for dropping the location pin"
            >
              <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
                <BaseMap />
                {pin && (
                  <g
                    data-pin
                    aria-label="Location pin"
                    style={{ cursor: "grab" }}
                    transform={`translate(${pin.x} ${pin.y})`}
                  >
                    <circle r="20" fill="#4F46E5" opacity="0.18" />
                    <circle r="11" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="3" />
                    <circle r="4" fill="#FFFFFF" />
                  </g>
                )}
              </g>
            </svg>

            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              <Button size="icon" variant="outline" aria-label="Zoom in" className="h-8 w-8 bg-background" onClick={() => zoomBy(1.3)}>
                <ZoomIn size={14} />
              </Button>
              <Button size="icon" variant="outline" aria-label="Zoom out" className="h-8 w-8 bg-background" onClick={() => zoomBy(1 / 1.3)}>
                <ZoomOut size={14} />
              </Button>
              <Button size="icon" variant="outline" aria-label="Reset map view" className="h-8 w-8 bg-background" onClick={resetView}>
                <LocateFixed size={14} />
              </Button>
            </div>

            {!pin && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border bg-background/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-soft backdrop-blur-sm">
                Tap or drag anywhere to drop the pin
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {name && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <MapPin size={11} className="text-primary" />
                {name}
                {confirmed && <Check size={11} className="text-success-foreground" />}
              </Badge>
            )}
            {simulated && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <MapPinOff size={11} className="text-muted-foreground" />
                Nearby location (position sharing off)
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {confirmed ? "Location confirmed — you can change it later." : "Confirm the location before continuing."}
            </p>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-error-foreground">
              <CircleAlert size={15} />
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
