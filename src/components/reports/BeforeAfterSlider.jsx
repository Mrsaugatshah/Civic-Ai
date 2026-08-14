import { useCallback, useRef, useState } from "react";
import { ChevronsLeftRight, MoveHorizontal, Camera } from "lucide-react";

import { cn } from "@/lib/utils";

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

/**
 * BeforeAfterSlider — accessible image comparison.
 * Works with mouse, touch (pointer events) and keyboard.
 * When a side has no real image (src null) it renders an honest
 * labeled placeholder — the UI never fabricates evidence.
 */
export function BeforeAfterSlider({ before, after, className, loading }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const updateFromClientX = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    setPos(clamp(ratio * 100));
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    updateFromClientX(event.clientX);
  };

  const stopDragging = () => setDragging(false);

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPos((p) => clamp(p - 2.5));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPos((p) => clamp(p + 2.5));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPos(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPos(100);
    }
  };

  const renderSide = (side) => {
    if (loading) return null;
    if (side?.src) {
      return (
        <img
          src={side.src}
          alt={side.label ?? "Comparison photo"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      );
    }
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/60 to-muted/40 p-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-soft">
          <Camera size={20} aria-hidden />
        </span>
        <p className="text-xs font-medium text-foreground">{side?.label}</p>
        <p className="max-w-[220px] text-[11px] leading-relaxed text-muted-foreground">
          Resolution photo will appear here once the backend uploads it.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="relative aspect-video w-full animate-pulse overflow-hidden rounded-lg border bg-muted"
        role="status"
        aria-label="Loading before and after photos"
      >
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Before and after comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)} percent toward after`}
        onKeyDown={onKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className="relative aspect-video w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-lg border bg-background shadow-soft"
      >
        {/* AFTER (base layer) */}
        <div className="absolute inset-0" aria-hidden>
          {renderSide(after)}
        </div>

        {/* BEFORE (clipped layer) */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
            transition: dragging ? "none" : "clip-path 180ms ease",
          }}
        >
          {renderSide(before)}
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
          After
        </span>

        {/* Handle */}
        <div
          className="absolute inset-y-0 z-10"
          style={{ left: `${pos}%`, transition: dragging ? "none" : "left 180ms ease" }}
          aria-hidden
        >
          <span className="absolute inset-y-0 -left-px w-0.5 bg-background shadow-[0_0_0_1px_rgba(15,23,42,0.15)]" />
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-lift">
            <ChevronsLeftRight size={16} />
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Before</span>
          {before?.date &&
            ` · ${new Date(before.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </span>
        <span className="inline-flex items-center gap-1">
          <MoveHorizontal size={12} aria-hidden />
          Drag or use arrow keys
        </span>
        <span>
          <span className="font-medium text-foreground">After</span>
          {after?.date &&
            ` · ${new Date(after.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </span>
      </div>
    </div>
  );
}
