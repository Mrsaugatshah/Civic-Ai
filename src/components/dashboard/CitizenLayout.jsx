import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Map, AlertCircle, FileText, Bell, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationsTrigger } from "./NotificationsMenu";
import { cn } from "@/lib/utils";

const SIDEBAR_NAV = [
  { key: "home", label: "Dashboard", icon: Home, id: "home" },
  { key: "map", label: "Map", icon: Map, id: "map" },
  { key: "issues", label: "Community Issues", icon: AlertCircle, id: "issues" },
  { key: "reports", label: "My Reports", icon: FileText, id: "reports" },
];

const MOBILE_NAV = [
  { key: "home", label: "Home", icon: Home, id: "home" },
  { key: "issues", label: "Issues", icon: AlertCircle, id: "issues" },
  { key: "reports", label: "My Reports", icon: FileText, id: "reports" },
  { key: "map", label: "Map", icon: Map, id: "map" },
  { key: "notifications", label: "Notify", icon: Bell, id: null },
];

function scrollTo(id) {
  if (id === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CitizenLayout({ children, unreadCount, onOpenNotifications }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const routeActive = pathname.startsWith("/issues") ? "issues"
    : pathname.startsWith("/reports") ? "reports"
      : pathname === "/map" ? "map" : "home";
  const active = routeActive;

  const handleNav = (key, id) => {
    if (key === "notifications") {
      onOpenNotifications?.();
      return;
    }
    if (key === "map") {
      navigate("/map");
      return;
    }
    if (key === "reports") {
      navigate("/reports");
      return;
    }
    if (key === "issues") {
      navigate("/issues");
      return;
    }
    scrollTo(id);
  };

  return (
    <div className="app-page min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-header hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleNav(item.key, item.id)}
                className={cn(
                  "w-full justify-start gap-2.5",
                  active === item.key
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Button>
            );
          })}
          <Separator className="my-3" />
          <button
            type="button"
            onClick={() => handleNav("notifications", null)}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span className="relative">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-error px-0.5 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            Notifications
          </button>
        </nav>
        <div className="space-y-3 border-t p-4">
          <Button asChild className="w-full">
            <Link to="/report">
              <Sparkles size={15} />
              Report an issue
            </Link>
          </Button>
          <div className="flex items-center justify-between gap-2">
            <UserMenu />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-header flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <NotificationsTrigger unreadCount={unreadCount} onClick={onOpenNotifications} />
            <UserMenu />
          </div>
        </header>

        <main className="page-content-transition mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-header border-t bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item.key, item.id)}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <Icon size={19} />
                  {item.key === "notifications" && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-error px-0.5 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </span>
                {item.label}
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="fixed bottom-24 right-4 z-header lg:hidden">
        <Button
          asChild
          size="icon"
          aria-label="Report an issue"
          className="h-14 w-14 rounded-full shadow-lift"
        >
          <Link to="/report">
            <Plus size={22} strokeWidth={2.25} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
