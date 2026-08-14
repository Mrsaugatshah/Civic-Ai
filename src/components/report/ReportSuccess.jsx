import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText, ArrowRight, Home, MapPin, Gauge, Sparkles, Map } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRACKING_STEPS } from "@/services/report/reportService";
import { reportCategoryMeta } from "./reportMeta";
import { cn } from "@/lib/utils";

export function ReportSuccess({ submission, onTrack, onHome }) {
  const [count, setCount] = useState(0);
  const doneCount = 1;

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 700);
      setCount(Math.round(doneCount * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const catMeta = submission?.categoryKey ? reportCategoryMeta(submission.categoryKey) : null;
  const CatIcon = catMeta?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-xl"
    >
      <Card className="overflow-hidden">
        <div className="bg-ai-gradient px-6 py-10 text-center sm:px-10">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-8 ring-background"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check size={28} strokeWidth={3} />
            </span>
          </motion.div>
          <h1 className="font-display mt-5 text-2xl font-bold tracking-tight text-foreground">
            Report submitted
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thanks for looking out for your neighborhood. Your report is safely stored and backend AI analysis is now queued.
          </p>
        </div>

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText size={12} />
                Report ID
              </p>
              <p className="mt-1 font-display text-lg font-bold tracking-tight text-foreground" data-testid="report-id">
                {submission?.id}
              </p>
              {CatIcon && (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <CatIcon size={11} />
                  {submission?.category ?? catMeta.label}
                </p>
              )}
            </div>
            <div className="rounded-lg border bg-background p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Gauge size={12} />
                AI priority
              </p>
              <p className="mt-1 font-display text-lg font-bold tracking-tight text-foreground">
                {submission?.priority == null ? "Pending" : `${submission.priority}/100`}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="gap-1 px-2 py-0 text-[11px] font-normal">
                  <MapPin size={10} className="text-primary" />
                  {submission?.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles size={12} className="text-ai" />
              What happens next
            </p>
            <ol className="space-y-0">
              {TRACKING_STEPS.map((step, i) => {
                const done = i < count;
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                          done
                            ? "border-success bg-success text-success-foreground"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                      </span>
                      {i < TRACKING_STEPS.length - 1 && (
                        <span className={cn("h-4 w-px", i < count - 1 ? "bg-success" : "bg-border")} />
                      )}
                    </div>
                    <span className={cn("pt-0.5 text-sm", done ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button onClick={onTrack} className="flex-1">
              Track report
              <ArrowRight size={15} />
            </Button>
            <Button variant="outline" onClick={onHome} className="flex-1">
              <Home size={15} />
              Back to home
            </Button>
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Track your report anytime from your dashboard. You'll be notified as its status changes.
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              data-testid="view-on-map"
            >
              <Map size={13} />
              See it on the city map
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
