import { MapPin, Flame, ListChecks, Map as MapIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const LAYER_DEFS = [
  { key: "issues", label: "Issues", hint: "Issue markers by severity", icon: MapPin },
  { key: "heatmap", label: "Report heatmap", hint: "Concentration of reports", icon: Flame },
  { key: "progress", label: "Work progress", hint: "Color markers by status", icon: ListChecks },
  { key: "neighborhoods", label: "Neighborhoods", hint: "District boundaries & labels", icon: MapIcon },
];

export function MapLayers({ layers, onChange, className }) {
  return (
    <div className={cn("w-60 rounded-md border bg-popover p-3 shadow-lift", className)} data-testid="map-layers-panel">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Layers</p>
      <ul className="space-y-1">
        {LAYER_DEFS.map((layer) => {
          const Icon = layer.icon;
          const enabled = Boolean(layers[layer.key]);
          return (
            <li key={layer.key} className="flex items-center gap-3 rounded-md p-2 hover:bg-accent">
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                <Icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{layer.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{layer.hint}</p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => onChange({ ...layers, [layer.key]: checked })}
                aria-label={`Toggle ${layer.label} layer`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
