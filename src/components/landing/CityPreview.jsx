import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

import { BaseCityMap } from "@/components/map/BaseCityMap";
import { categoryIcon } from "@/components/map/mapMeta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_ISSUES = [
  { id: "road", category: "road", label: "Road damage", place: "Narayangadh Rd", x: "48%", y: "42%", tone: "text-warning", dot: "bg-warning" },
  { id: "water", category: "water", label: "Water leak", place: "Devghat", x: "16%", y: "30%", tone: "text-info", dot: "bg-info" },
  { id: "waste", category: "waste", label: "Waste overflow", place: "Tandi Market", x: "70%", y: "60%", tone: "text-brand", dot: "bg-brand" },
  { id: "streetlight", category: "streetlight", label: "Streetlight", place: "Kalika", x: "27%", y: "56%", tone: "text-warning", dot: "bg-warning" },
];

const SUMMARY = [
  { label: "Active issues", value: "342", dot: "bg-primary" },
  { label: "Critical", value: "18", dot: "bg-error" },
  { label: "In progress", value: "126", dot: "bg-warning" },
  { label: "Resolved", value: "816", dot: "bg-success" },
];

export function CityPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative h-64 sm:h-80 lg:h-96" aria-hidden>
        <BaseCityMap />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
        {SAMPLE_ISSUES.map((issue) => {
          const Icon = categoryIcon(issue.category);
          return (
            <span
              key={issue.id}
              className="absolute flex items-center gap-1.5 rounded-full border border-border bg-white/95 px-2 py-1 shadow-card"
              style={{ left: issue.x, top: issue.y }}
            >
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span
                  className={cn("absolute h-3.5 w-3.5 animate-pulse-soft rounded-full opacity-30", issue.dot)}
                />
                <Icon size={12} className={cn("relative", issue.tone)} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-slate-700">{issue.label}</span>
                <span className="text-[9px] font-medium text-slate-400">{issue.place}</span>
              </span>
            </span>
          );
        })}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {SUMMARY.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              <span className="font-semibold text-foreground">{s.value}</span>
              {s.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground md:block">
            Sample markers — illustrative demo data.
          </p>
          <Button asChild size="sm" className="group">
            <Link to="/map">
              <MapPin size={14} />
              Explore City Map
              <ArrowRight
                size={14}
                className="transition-transform duration-fast group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
