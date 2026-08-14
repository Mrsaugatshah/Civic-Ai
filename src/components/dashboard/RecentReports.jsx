import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText, MapPinned, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { categoryMeta } from "./categoryMeta";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { ReportTimeline } from "./ReportTimeline";
import { priorityBarClass } from "@/components/civic/PriorityMeter";
import { cn } from "@/lib/utils";

export function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function ReportRow({ report }) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta(report.category);
  const Icon = meta.icon;
  const doneSteps = report.timeline.filter((s) => s.done).length;

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-start gap-3 p-3.5">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{report.title}</p>
            <StatusBadge status={report.status} className="shrink-0 px-2 py-0.5 text-[10px]" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{report.id}</span>
            <span>{report.location}</span>
            <span>{formatRelativeTime(report.reportedAt)}</span>
            <span>
              AI <span className="font-semibold text-foreground">{report.priority}</span>/100
            </span>
          </div>
          <Progress
            value={report.priority}
            indicatorClassName={priorityBarClass(report.priority)}
            className="mt-2 h-1"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {doneSteps} of {report.timeline.length} steps complete · {report.eta}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={open}
              aria-label={`View timeline for ${report.title}`}
              className="h-7 px-2 text-xs text-primary"
              onClick={() => setOpen((o) => !o)}
            >
              Timeline
              <ChevronDown size={13} className={cn("transition-transform duration-fast", open && "rotate-180")} />
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t bg-accent/30 px-5 py-4"
          >
            <ReportTimeline steps={report.timeline} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function RecentReports({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent reports</CardTitle>
          <CardDescription>Loading your submissions…</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionSkeleton rows={3} />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <SectionError title="Couldn't load your reports" onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  const items = data.items;

  return (
    <section id="reports" className="scroll-mt-24">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent reports</CardTitle>
            <CardDescription>Track each report through its lifecycle</CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            <FileText size={12} className="text-primary" />
            {items.length} submitted
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-accent/40 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPinned size={22} />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Your civic journey starts here.
                </p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                  Report your first issue and start earning civic score for your neighborhood.
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/report">
                  <Plus size={14} />
                  Report an issue
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {items.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary">
                  <Link to="/reports">
                    View all my reports
                    <ChevronDown size={13} className="rotate-[-90deg]" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
