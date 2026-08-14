import { motion } from "framer-motion";
import { Check, CalendarDays, Landmark, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShortDate } from "./format";

export function ResolutionCard({ report, onViewEvidence }) {
  const detail = report.resolvedDetail;

  return (
    <section className="overflow-hidden rounded-lg border border-success/25 bg-success/5 p-5">
      <div className="flex items-center gap-3">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"
        >
          <Check size={20} strokeWidth={3} aria-hidden />
        </motion.span>
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            Issue Resolved
          </h3>
          <p className="text-xs text-muted-foreground">
            This report was closed on {detail?.resolvedAt ? formatShortDate(detail.resolvedAt) : "—"}.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground">
        {detail?.description ?? report.description}
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md border bg-background p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarDays size={12} aria-hidden />
            Resolved
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {detail?.resolvedAt ? formatShortDate(detail.resolvedAt) : "—"}
          </dd>
        </div>
        <div className="rounded-md border bg-background p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Landmark size={12} aria-hidden />
            Department
          </dt>
          <dd className="mt-1 font-medium text-foreground">{detail?.department ?? report.department}</dd>
        </div>
        <div className="rounded-md border bg-background p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Camera size={12} aria-hidden />
            Evidence
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {report.hasEvidence ? "Before / After photos" : "Not uploaded"}
          </dd>
        </div>
      </dl>

      {report.hasEvidence && onViewEvidence && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onViewEvidence}>
            <Camera size={14} />
            View Before &amp; After
          </Button>
        </div>
      )}
    </section>
  );
}
