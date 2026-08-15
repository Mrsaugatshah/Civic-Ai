import {
  Send,
  Eye,
  Landmark,
  Clock,
  CheckCircle2,
  Archive,
  FileText,
  MapPinned,
  Users,
  Gauge,
  Loader2,
  Inbox,
} from "lucide-react";

export { reportCategoryMeta } from "@/components/report/reportMeta";

/* ------------------------------------------------------------------ */
/* Report status — Part 8 badge system                                 */
/*   Submitted: blue · Under Review: purple · Assigned: indigo          */
/*   In Progress: orange · Resolved: green · Closed: neutral            */
/* Color is never the only signal — every badge ships an icon + label.  */
/* ------------------------------------------------------------------ */

export const REPORT_STATUS_META = {
  submitted: {
    label: "Received",
    icon: Send,
    dot: "#2563EB",
    classes: "bg-blue-50 text-blue-800 border-blue-200",
  },
  under_review: {
    label: "Under Review",
    icon: Eye,
    dot: "#8B5CF6",
    classes: "bg-purple-500/10 text-purple-700 border-purple-500/25",
  },
  assigned: {
    label: "Assigned",
    icon: Landmark,
    dot: "#6366F1",
    classes: "bg-indigo-500/10 text-indigo-700 border-indigo-500/25",
  },
  in_progress: {
    label: "Work In Progress",
    icon: Clock,
    dot: "#F97316",
    classes: "bg-orange-500/10 text-orange-700 border-orange-500/25",
  },
  resolved: {
    label: "Completed",
    icon: CheckCircle2,
    dot: "#16A34A",
    classes: "bg-success/10 text-success-foreground border-success/25",
  },
  closed: {
    label: "Completed",
    icon: Archive,
    dot: "#64748B",
    classes: "bg-muted text-muted-foreground border-border",
  },
  rejected: {
    label: "Rejected",
    icon: Archive,
    dot: "#DC2626",
    classes: "bg-error/10 text-error-foreground border-error/25",
  },
};

export function statusMeta(status) {
  return REPORT_STATUS_META[status] ?? REPORT_STATUS_META.submitted;
}

/* ------------------------------------------------------------------ */
/* Stat + empty state icon registry                                    */
/* ------------------------------------------------------------------ */

export const REPORT_STAT_META = {
  total: { icon: FileText, tone: "bg-primary/10 text-primary" },
  inProgress: { icon: Clock, tone: "bg-orange-500/10 text-orange-700" },
  resolved: { icon: CheckCircle2, tone: "bg-success/10 text-success-foreground" },
  awaiting: { icon: Eye, tone: "bg-purple-500/10 text-purple-700" },
};

export const EMPTY_ICONS = { Inbox, MapPinned, Users, Gauge, Loader2 };
