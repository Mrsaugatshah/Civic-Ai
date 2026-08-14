import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReportLocation({ report }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-soft">
      <div className="bg-grid relative h-28 border-b">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary shadow-lift">
            <MapPin size={15} aria-hidden />
            <span className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-primary/40" />
          </span>
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Report Location
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
          <MapPin size={14} className="text-primary" aria-hidden />
          {report.location}
        </p>
        <div className="mt-3">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/map">
              <Navigation size={14} />
              View on Civic Map
            </Link>
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Only the area name is shown here — your exact drop-off point stays private.
        </p>
      </div>
    </section>
  );
}
