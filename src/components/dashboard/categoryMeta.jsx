import {
  Route,
  Lightbulb,
  Trash2,
  Droplets,
  Trees,
  Pencil,
  Navigation,
  ShieldAlert,
  Building2,
  Wind,
  CircleAlert,
} from "lucide-react";

export const CATEGORY_META = {
  road: { label: "Road Damage", icon: Route, tone: "bg-warning/10 text-warning-foreground" },
  streetlight: { label: "Streetlight", icon: Lightbulb, tone: "bg-primary/10 text-primary" },
  waste: { label: "Garbage & Waste", icon: Trash2, tone: "bg-error/10 text-error-foreground" },
  water: { label: "Water & Sewage", icon: Droplets, tone: "bg-info/10 text-info-foreground" },
  park: { label: "Park & Greenery", icon: Trees, tone: "bg-success/10 text-success-foreground" },
  vandalism: { label: "Vandalism", icon: Pencil, tone: "bg-ai/10 text-ai-foreground" },
  vehicle: { label: "Vehicle & Parking", icon: Navigation, tone: "bg-brand/10 text-brand-foreground" },
  safety: { label: "Public Safety", icon: ShieldAlert, tone: "bg-warning/10 text-warning-foreground" },
  building: { label: "Public Building", icon: Building2, tone: "bg-secondary text-secondary-foreground" },
  air: { label: "Air Quality", icon: Wind, tone: "bg-info/10 text-info-foreground" },
  other: { label: "Other", icon: CircleAlert, tone: "bg-muted text-muted-foreground" },
};

export function categoryMeta(key) {
  return CATEGORY_META[key] ?? CATEGORY_META.other;
}
