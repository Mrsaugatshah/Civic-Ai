import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, FileText, Clock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { reportCategoryMeta } from "./reportMeta";
import { priorityLevelForScore } from "@/services/report/analysisService";
import { priorityBarClass } from "@/components/civic/PriorityMeter";
import { formatRelativeTime } from "./format";
import { cn } from "@/lib/utils";

function PriorityChip({ score }) {
  if (score == null) {
    return <Badge variant="outline" className="border-transparent bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">AI analysis pending</Badge>;
  }
  const level = priorityLevelForScore(score);
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-transparent px-2 py-0.5 text-[10px] font-semibold", level.chip)}
    >
      {level.level} priority
      <span className="font-bold">{score}/100</span>
    </Badge>
  );
}

export function ReportCard({ report, index = 0, detailPath = "/reports" }) {
  const meta = reportCategoryMeta(report.category);
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`${detailPath}/${report.id}`}
        className="card-lift group block rounded-lg border bg-card p-3.5 shadow-soft sm:p-4"
        aria-label={`View report ${report.id}: ${report.title}`}
      >
        <div className="flex gap-3.5">
          {/* Issue image / category tile */}
          <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-md border bg-accent/40 sm:block">
            {report.imageUrl ? <img src={report.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Icon size={28} className={cn(meta.tone)} aria-hidden /></div>}
            <span className="absolute bottom-0 left-0 right-0 truncate bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground backdrop-blur-sm">
              {meta.label}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                  {report.title}
                </h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} aria-hidden />
                    {report.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} aria-hidden />
                    Reported {formatRelativeTime(report.reportedAt)}
                  </span>
                </p>
              </div>
              <ReportStatusBadge status={report.status} className="shrink-0 px-2 py-0.5 text-[10px]" />
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
              {report.description}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <PriorityChip score={report.priority} />
              {report.reporterType === "guest" && <Badge variant="outline" className="px-2 py-0.5 text-[10px]">Guest Report</Badge>}
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <FileText size={10} aria-hidden />
                {report.id}
              </span>
            </div>

            {report.confirmed != null && <p className="mt-2 text-[11px] text-muted-foreground">Legit {report.confirmed} · Not Legit {report.rejected} · {report.legitimacyPercent == null ? "No verification yet" : `${report.legitimacyPercent}% legitimate`}</p>}
            {report.communityStatus === "community_supported" && <p className="mt-1 text-[11px] font-medium text-success-foreground">Community Supported · priority boost applied</p>}

            {report.priority != null && <Progress
              value={report.priority}
              indicatorClassName={priorityBarClass(report.priority)}
              className="mt-2 h-1"
              aria-hidden
            />}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                Last updated {formatRelativeTime(report.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                View Report
                <ArrowRight size={13} className="transition-transform duration-fast group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
