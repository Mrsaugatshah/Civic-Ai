import { Link } from "react-router-dom";
import {
  Bell,
  Bot,
  Landmark,
  Construction,
  CheckCircle2,
  Camera,
  Users,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const NOTIFICATION_ICON_META = {
  received: { icon: Bell, tone: "bg-primary/10 text-primary" },
  analysis: { icon: Bot, tone: "bg-ai/10 text-ai" },
  assigned: { icon: Landmark, tone: "bg-indigo-500/10 text-indigo-700" },
  progress: { icon: Construction, tone: "bg-orange-500/10 text-orange-700" },
  resolved: { icon: CheckCircle2, tone: "bg-success/10 text-success-foreground" },
  evidence: { icon: Camera, tone: "bg-brand/10 text-brand-foreground" },
  community: { icon: Users, tone: "bg-purple-500/10 text-purple-700" },
  score: { icon: TrendingUp, tone: "bg-warning/10 text-warning-foreground" },
};

export function NotificationCard({ item, onSelect, onMarkRead }) {
  const meta = NOTIFICATION_ICON_META[item.iconKey] ?? NOTIFICATION_ICON_META.received;
  const Icon = meta.icon;
  const href = item.reportId ? `/reports/${item.reportId}` : null;

  const inner = (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        item.unread ? "border-primary/20 bg-primary/5" : "border-transparent"
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
        <Icon size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {item.unread && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">{item.time}</span>
          {item.reportId && (
            <span className="text-[11px] font-medium text-primary">{item.reportId}</span>
          )}
        </div>
      </div>
    </div>
  );

  const onSelectHandler = () => {
    onMarkRead?.(item.id);
    onSelect?.(item);
  };

  if (href) {
    return (
      <Link to={href} onClick={onSelectHandler} aria-label={`${item.title}: ${item.body}`}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onSelectHandler} aria-label={`${item.title}: ${item.body}`}>
      {inner}
    </button>
  );
}
