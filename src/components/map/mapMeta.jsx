import { Route, Trash2, Droplets, Zap, Lightbulb, BusFront, Recycle, ShieldAlert, Trees, CircleAlert } from "lucide-react";

export const MAP_CATEGORY_ICONS = {
  road: Route,
  waste: Trash2,
  water: Droplets,
  electricity: Zap,
  streetlight: Lightbulb,
  transportation: BusFront,
  environment: Recycle,
  safety: ShieldAlert,
  park: Trees,
  other: CircleAlert,
};

export function categoryIcon(key) {
  return MAP_CATEGORY_ICONS[key] ?? CircleAlert;
}
