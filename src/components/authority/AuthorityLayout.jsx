import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListChecks, Map } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { getDepartmentNotifications } from "@/services/authority/authorityService";
import { markNotificationsRead } from "@/services/citizen/citizenService";

import { Logo } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationsTrigger, NotificationsMenu } from "@/components/dashboard/NotificationsMenu";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, id: "overview" },
  { key: "tasks", label: "Assigned Tasks", icon: ListChecks, id: "tasks" },
  { key: "map", label: "City Map", icon: Map, external: "/map" },
];

export function AuthorityLayout({ children }) {
  const [active, setActive] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const department = user?.department || "Your Department";

  const notifications = useAsync(() => getDepartmentNotifications(department), [department]);
  const unreadCount = notifications.data?.filter((n) => n.unread).length ?? 0;

  const handleNav = (item) => {
    if (item.external) {
      navigate(item.external);
      return;
    }
    setActive(item.key);
    if (location.pathname !== "/authority/dashboard") {
      navigate(`/authority/dashboard#${item.id}`);
      return;
    }
    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMarkAllRead = async () => {
    await markNotificationsRead({ all: true });
    notifications.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-header hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Logo />
          <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary text-[10px]">
            Department
          </Badge>
        </div>
        <div className="border-b px-5 py-3">
          <p className="text-xs text-muted-foreground">Signed in for</p>
          <p className="truncate text-sm font-semibold text-foreground">{department}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleNav(item)}
                className={cn(
                  "w-full justify-start gap-2.5",
                  active === item.key && !item.external
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Button>
            );
          })}
        </nav>
        <div className="space-y-3 border-t p-4">
          <UserMenu />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-header flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo />
            <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary text-[10px]">
              Department
            </Badge>
          </div>
          <span className="hidden text-sm font-medium text-muted-foreground lg:block">{department}</span>
          <div className="flex items-center gap-1">
            <NotificationsTrigger unreadCount={unreadCount} onClick={() => setNotifOpen(true)} />
            <div className="lg:hidden">
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>

      <nav
        aria-label="Department navigation"
        className="fixed inset-x-0 bottom-0 z-header border-t bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key && !item.external;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item)}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </nav>

      <NotificationsMenu
        open={notifOpen}
        onOpenChange={setNotifOpen}
        notifications={notifications.data}
        unreadCount={unreadCount}
        loading={notifications.loading}
        error={notifications.error}
        onRetry={notifications.reload}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
