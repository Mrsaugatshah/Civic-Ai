import { memo } from "react";

import { STATUS_META } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";

function ProgressMarkerInner({ issue, screen, selected = false, onSelect }) {
  const color = STATUS_META[issue.status]?.color ?? "#94A3B8";
  const Icon = categoryIcon(issue.category);

  return (
    <div
      className="pointer-events-auto absolute z-10"
      style={{ left: screen.sx, top: screen.sy, transform: "translate(-50%, -100%)" }}
    >
      <button
        type="button"
        aria-label={`${issue.title} — ${issue.status.replace("_", " ")}`}
        onClick={onSelect}
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform hover:scale-110 ${
          selected ? "scale-125 ring-2 ring-primary ring-offset-2" : ""
        }`}
        style={{ borderColor: color }}
      >
        <Icon size={14} style={{ color }} />
      </button>
    </div>
  );
}

export const ProgressMarker = memo(ProgressMarkerInner);
