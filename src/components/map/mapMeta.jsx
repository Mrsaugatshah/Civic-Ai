import { Route, Trash2, Droplets, Zap, Lightbulb, BusFront, Recycle, ShieldAlert, Trees, CircleAlert, Waves, Landmark } from "lucide-react";

export const MAP_CATEGORY_ICONS = {
  road: Route,
  pothole: Route,
  waste: Trash2,
  garbage_overflow: Trash2,
  water: Droplets,
  drainage: Waves,
  electricity: Zap,
  electric_line: Zap,
  streetlight: Lightbulb,
  light_pole: Lightbulb,
  transportation: BusFront,
  environment: Recycle,
  safety: ShieldAlert,
  park: Trees,
  public_property: Landmark,
  other: CircleAlert,
};

export function categoryIcon(key) {
  return MAP_CATEGORY_ICONS[key] ?? CircleAlert;
}
