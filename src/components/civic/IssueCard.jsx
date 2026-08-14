import { motion } from "framer-motion";
import { MapPin, CalendarDays, Building2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { SeverityBadge } from "./SeverityBadge";
import { PriorityMeter } from "./PriorityMeter";
import { cn } from "@/lib/utils";

export function IssueCard({ issue, className }) {
  const {
    category = "Streetlight",
    icon: Icon = Building2,
    title,
    description,
    location,
    date,
    status = "pending",
    severity = "medium",
    priority = 50,
    image,
  } = issue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card className="card-lift h-full overflow-hidden border-border bg-card">
        {image ? (
          <img src={image} alt={category} className="h-40 w-full object-cover" />
        ) : (
          <div className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-accent via-background to-ai/10">
            <Icon size={40} strokeWidth={1.5} className="text-ai/50" />
          </div>
        )}

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {category}
            </span>
            <SeverityBadge severity={severity} className="px-2 py-0.5 text-[11px]" />
          </div>

          <div>
            <h4 className="font-display text-base font-semibold leading-snug text-foreground">
              {title}
            </h4>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {location}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} /> {date}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <StatusBadge status={status} className="px-2 py-0.5 text-[11px]" />
            <PriorityMeter score={priority} className="flex-1 max-w-32" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
