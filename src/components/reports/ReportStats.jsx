import { motion } from "framer-motion";

import { REPORT_STAT_META } from "./reportMeta";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "total", label: "Total Reports" },
  { key: "inProgress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "awaiting", label: "Awaiting Review" },
];

export function ReportStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.key} className="rounded-lg border bg-card p-4 shadow-soft">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-3 h-6 w-10" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const valueFor = (key) => {
    switch (key) {
      case "total":
        return stats?.total ?? 0;
      case "inProgress":
        return stats?.inProgress ?? 0;
      case "resolved":
        return stats?.resolved ?? 0;
      default:
        return stats?.awaiting ?? 0;
    }
  };

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS.map((item, i) => {
        const meta = REPORT_STAT_META[item.key];
        const Icon = meta.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-soft">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                <Icon size={16} aria-hidden />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">{item.label}</dt>
                <dd className="font-display text-xl font-bold leading-tight text-foreground">
                  {valueFor(item.key)}
                </dd>
              </div>
            </div>
          </motion.div>
        );
      })}
    </dl>
  );
}
