import { statusMeta } from "./reportMeta";
import { cn } from "@/lib/utils";

/**
 * ReportStatusBadge — icon + label + soft color chip.
 * Color never carries meaning alone (accessibility requirement).
 */
export function ReportStatusBadge({ status, className, iconClassName }) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.classes,
        className
      )}
    >
      <Icon size={13} strokeWidth={2} className={iconClassName} aria-hidden />
      {meta.label}
    </span>
  );
}
