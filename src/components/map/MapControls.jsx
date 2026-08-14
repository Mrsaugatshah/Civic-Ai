import { Plus, Minus, LocateFixed, Layers, SlidersHorizontal, Crosshair } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function ControlButton({ label, active = false, onClick, children, testId }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          data-testid={testId}
          onClick={onClick}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-lift transition-colors hover:bg-accent",
            active && "border-primary bg-primary/10 text-primary"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onReset,
  locating = false,
  layersOpen,
  onLayers,
  filtersOpen,
  onFilters,
  className,
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex flex-col gap-1 rounded-lg border bg-background/95 p-1 shadow-lift backdrop-blur", className)}>
        <ControlButton label="Zoom in" onClick={onZoomIn} testId="map-zoom-in">
          <Plus size={16} />
        </ControlButton>
        <ControlButton label="Zoom out" onClick={onZoomOut} testId="map-zoom-out">
          <Minus size={16} />
        </ControlButton>
        <div className="mx-2 my-0.5 border-t border-border" />
        <ControlButton label="Locate me" onClick={onLocate} testId="map-locate" active={locating}>
          {locating ? <Crosshair size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        </ControlButton>
        <ControlButton label="Reset view" onClick={onReset} testId="map-reset">
          <Minus size={16} className="rotate-45" />
        </ControlButton>
        <div className="mx-2 my-0.5 border-t border-border" />
        <ControlButton label="Layers" onClick={onLayers} testId="map-layers" active={layersOpen}>
          <Layers size={16} />
        </ControlButton>
        <ControlButton label="Filters" onClick={onFilters} testId="map-filters" active={filtersOpen}>
          <SlidersHorizontal size={16} />
        </ControlButton>
      </div>
    </TooltipProvider>
  );
}
