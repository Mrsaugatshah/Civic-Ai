import { CheckCircle2, Clock, Hourglass, Eye, AlertTriangle, UserCheck, Archive, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const STATUS = {
  reported: { label: "Received", icon: FileText, className: "bg-blue-50 text-blue-800 border-blue-200" },
  submitted: { label: "Received", icon: FileText, className: "bg-blue-50 text-blue-800 border-blue-200" },
  resolved: { label: "Completed", icon: CheckCircle2, className: "bg-success/10 text-success-foreground border-success/25" },
  closed: { label: "Completed", icon: CheckCircle2, className: "bg-success/10 text-success-foreground border-success/25" },
  in_progress: { label: "Work In Progress", icon: Clock, className: "bg-info/10 text-info-foreground border-info/25" },
  pending: { label: "Pending", icon: Hourglass, className: "bg-warning/10 text-warning-foreground border-warning/25" },
  under_review: { label: "Under Review", icon: Eye, className: "bg-ai/10 text-ai-foreground border-ai/25" },
  verified: { label: "Under Review", icon: Eye, className: "bg-ai/10 text-ai-foreground border-ai/25" },
  assigned: { label: "Assigned", icon: UserCheck, className: "bg-primary/10 text-primary border-primary/25" },
  rejected: { label: "Rejected", icon: Archive, className: "bg-error/10 text-error-foreground border-error/25" },
  reopened: { label: "Reopened", icon: FileText, className: "bg-warning/10 text-warning-foreground border-warning/25" },
  critical: { label: "Critical", icon: AlertTriangle, className: "bg-error/10 text-error-foreground border-error/25" },
};

export function StatusBadge({ status = "pending", className, iconClassName }) {
  const cfg = STATUS[status] ?? STATUS.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.className,
        className
      )}
    >
      <Icon size={13} strokeWidth={2} className={iconClassName} />
      {cfg.label}
    </span>
  );
}
