import { Flame, AlertTriangle, CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const SEVERITY = {
  critical: { label: "Critical", icon: Flame, className: "bg-error/10 text-error-foreground border-error/25" },
  high: { label: "High", icon: AlertTriangle, className: "bg-warning/10 text-warning-foreground border-warning/25" },
  medium: { label: "Medium", icon: CircleAlert, className: "bg-info/10 text-info-foreground border-info/25" },
  low: { label: "Low", icon: CircleCheck, className: "bg-success/10 text-success-foreground border-success/25" },
};

export function SeverityBadge({ severity = "medium", className }) {
  const cfg = SEVERITY[severity] ?? SEVERITY.medium;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.className,
        className
      )}
    >
      <Icon size={13} strokeWidth={2} />
      {cfg.label}
    </span>
  );
}
