import {
  Route,
  Trash2,
  Droplets,
  Zap,
  Lightbulb,
  ShieldAlert,
  Waves,
  Trees,
  Building2,
  Navigation,
  CircleAlert,
  CircleDot,
  Cable,
  BadgeDollarSign,
} from "lucide-react";

export const REPORT_CATEGORY_META = {
  road: { label: "Road & Infrastructure", icon: Route, tone: "bg-warning/10 text-warning-foreground" },
  pothole: { label: "Pothole", icon: CircleDot, tone: "bg-warning/10 text-warning-foreground" },
  electric_line: { label: "Electric Line", icon: Cable, tone: "bg-error/10 text-error-foreground" },
  light_pole: { label: "Light Pole", icon: Lightbulb, tone: "bg-primary/10 text-primary" },
  garbage_overflow: { label: "Garbage Overflow", icon: Trash2, tone: "bg-error/10 text-error-foreground" },
  corruption: { label: "Corruption", icon: BadgeDollarSign, tone: "bg-ai/10 text-ai" },
  waste: { label: "Waste Management", icon: Trash2, tone: "bg-error/10 text-error-foreground" },
  water: { label: "Water & Sewage", icon: Droplets, tone: "bg-info/10 text-info-foreground" },
  electricity: { label: "Electricity & Power", icon: Zap, tone: "bg-warning/10 text-warning-foreground" },
  streetlight: { label: "Street Lighting", icon: Lightbulb, tone: "bg-primary/10 text-primary" },
  safety: { label: "Public Safety", icon: ShieldAlert, tone: "bg-error/10 text-error-foreground" },
  drainage: { label: "Drainage & Flooding", icon: Waves, tone: "bg-info/10 text-info-foreground" },
  environment: { label: "Environment", icon: Trees, tone: "bg-success/10 text-success-foreground" },
  public_property: { label: "Public Property", icon: Building2, tone: "bg-secondary text-secondary-foreground" },
  transportation: { label: "Transportation", icon: Navigation, tone: "bg-brand/10 text-brand-foreground" },
  other: { label: "Other", icon: CircleAlert, tone: "bg-muted text-muted-foreground" },
};

export function reportCategoryMeta(key) {
  return REPORT_CATEGORY_META[key] ?? REPORT_CATEGORY_META.other;
}

export const SEVERITY_META = {
  low: {
    label: "Low",
    dot: "#16A34A",
    bar: "bg-success",
    chip: "bg-success/10 text-success-foreground",
  },
  medium: {
    label: "Medium",
    dot: "#EAB308",
    bar: "bg-warning",
    chip: "bg-warning/10 text-warning-foreground",
  },
  high: {
    label: "High",
    dot: "#F97316",
    bar: "bg-orange-500",
    chip: "bg-error/10 text-error-foreground",
  },
  critical: {
    label: "Critical",
    dot: "#DC2626",
    bar: "bg-error",
    chip: "bg-error/10 text-error-foreground",
  },
};

export const PRIORITY_FACTOR_META = {
  severity: { label: "Severity", color: "#F97316" },
  publicImpact: { label: "Public impact", color: "#6366F1" },
  safetyRisk: { label: "Safety risk", color: "#DC2626" },
  locationSensitivity: { label: "Location sensitivity", color: "#0EA5E9" },
  similarReports: { label: "Similar nearby", color: "#8B5CF6" },
  reportFrequency: { label: "Report frequency", color: "#EC4899" },
};
