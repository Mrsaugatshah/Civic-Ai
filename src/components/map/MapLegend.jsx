import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";

import { SEVERITY_MARKER_COLORS } from "@/services/map/mapService";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Critical", color: SEVERITY_MARKER_COLORS.critical, hint: "priority ≥ 85 · pulses" },
  { label: "High", color: SEVERITY_MARKER_COLORS.high, hint: "priority 70–84" },
  { label: "Medium", color: SEVERITY_MARKER_COLORS.medium, hint: "priority 50–69" },
  { label: "Low", color: SEVERITY_MARKER_COLORS.low, hint: "priority < 50" },
  { label: "Completed", color: "#16A34A", hint: "completed / closed" },
];

export function MapLegend({ className, mode }) {
  const [open, setOpen] = useState(true);
  const items = mode === "progress"
    ? [
        { label: "Completed", color: "#16A34A" },
        { label: "Work In Progress", color: "#0EA5E9" },
        { label: "Under Review", color: "#F59E0B" },
        { label: "Assigned", color: "#8B5CF6" },
        { label: "Received", color: "#94A3B8" },
      ]
    : ITEMS;

  return (
    <div className={cn("rounded-md border bg-background/95 p-2.5 shadow-lift backdrop-blur", className)} data-testid="map-legend">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-xs font-semibold text-foreground"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-1.5">
          <Layers size={13} className="text-muted-foreground" />
          {mode === "progress" ? "Work status" : "Issue severity"}
        </span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-foreground">{item.label}</span>
              {item.hint && <span className="ml-auto text-[10px] text-muted-foreground">{item.hint}</span>}
            </li>
          ))}
          <li className="flex items-center gap-2 border-t border-border pt-1.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">5</span>
            <span className="text-xs text-foreground">Grouped cluster</span>
            <span className="ml-auto text-[10px] text-muted-foreground">tap to zoom in</span>
          </li>
        </ul>
      )}
    </div>
  );
}
