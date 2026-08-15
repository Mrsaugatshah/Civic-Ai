import { Bell, Clock, Users, CheckCircle2, Sparkles, TrendingUp, CheckCheck, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  progress: { icon: Clock, tone: "bg-info/10 text-info-foreground" },
  users: { icon: Users, tone: "bg-brand/10 text-brand-foreground" },
  resolved: { icon: CheckCircle2, tone: "bg-success/10 text-success-foreground" },
  digest: { icon: Sparkles, tone: "bg-ai/10 text-ai-foreground" },
  score: { icon: TrendingUp, tone: "bg-primary/10 text-primary" },
};

function NotificationRow({ item }) {
  const meta = ICON_MAP[item.iconKey] ?? ICON_MAP.digest;
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        item.unread ? "border-primary/20 bg-primary/5" : "border-transparent"
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{item.time}</p>
      </div>
    </div>
  );
}

export function NotificationsTrigger({ unreadCount, onClick }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Notifications, ${unreadCount} unread`}
      className="relative text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white ring-2 ring-background">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}

export function NotificationsMenu({
  open,
  onOpenChange,
  notifications,
  unreadCount,
  loading,
  error,
  onRetry,
  onMarkAllRead,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-3 p-0 sm:rounded-lg">
        <DialogHeader className="px-5 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>Updates from your reports and community</DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllRead}>
                <CheckCheck size={14} />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="max-h-[22rem] overflow-y-auto px-5 pb-5">
          {loading ? (
            <SectionSkeleton rows={4} />
          ) : error || !notifications ? (
            <SectionError title="Couldn't load notifications" onRetry={onRetry} />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox size={22} />
              </span>
              <p className="text-sm font-medium text-foreground">You're all caught up</p>
              <p className="text-xs text-muted-foreground">New updates will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        <div className="border-t px-5 py-3">
          <div className="text-center text-[11px] text-muted-foreground">
            {unreadCount > 0 ? <><Badge variant="outline" className="font-normal">{unreadCount} unread</Badge> notification{unreadCount === 1 ? "" : "s"}</> : "You're up to date"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
