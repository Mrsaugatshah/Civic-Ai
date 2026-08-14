import { memo } from "react";
import { motion } from "framer-motion";

import { CATEGORY_LABEL, markerColor, shouldPulse } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";
import { cn } from "@/lib/utils";

function IssueMarkerInner({ issue, screen, selected = false, highlighted = false, onSelect, onHover }) {
  const color = markerColor(issue);
  const Icon = categoryIcon(issue.category);
  const pulse = shouldPulse(issue) && !selected;
  const dim = issue.status === "resolved" || issue.status === "closed";

  return (
    <div
      className="pointer-events-auto absolute z-10"
      style={{
        left: screen.sx,
        top: screen.sy,
        transform: "translate(-50%, -100%)",
      }}
    >
      {pulse && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 block h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: `2px solid ${color}` }}
          animate={{ scale: [1, 2.1, 1], opacity: [0.65, 0, 0.65] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <button
        type="button"
        tabIndex={0}
        aria-label={`${issue.title}. ${CATEGORY_LABEL[issue.category] ?? "Issue"}. Priority ${issue.priority} of 100.`}
        onClick={onSelect}
        onMouseEnter={() => onHover?.(issue)}
        onMouseLeave={() => onHover?.(null)}
        onFocus={() => onHover?.(issue)}
        onBlur={() => onHover?.(null)}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          selected ? "scale-125" : "hover:scale-110"
        )}
        style={{
          backgroundColor: color,
          borderColor: "#FFFFFF",
          transformOrigin: "bottom center",
        }}
      >
        <Icon size={15} strokeWidth={2.4} className="text-white" />
        {dim && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-success text-white shadow">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </button>
      {selected && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary"
          layoutId="selected-marker-ring"
        />
      )}
      {highlighted && !selected && (
        <span aria-hidden className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ai animate-ping" />
      )}
    </div>
  );
}

export const IssueMarker = memo(IssueMarkerInner);
