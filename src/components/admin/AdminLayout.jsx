import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ListOrdered, AlertTriangle, Map, Sparkles, BarChart3, Tags, Users,
} from "lucide-react";

import { Logo } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, id: "overview" },
  { key: "all-reports", label: "All Reports", icon: ListOrdered, route: "/admin/reports" },
  { key: "queue", label: "Priority Queue", icon: ListOrdered, id: "queue" },
  { key: "critical", label: "Critical Issues", icon: AlertTriangle, id: "critical" },
  { key: "categories", label: "Categories", icon: Tags, id: "categories" },
  { key: "users", label: "User Management", icon: Users, route: "/admin/users" },
  { key: "map", label: "City Map", icon: Map, external: "/map" },
  { key: "insights", label: "AI Insights", icon: Sparkles, id: "insights" },
  { key: "analytics", label: "Analytics", icon: BarChart3, route: "/admin/analytics" },
];

export function AdminLayout({ children, initialActive = "overview" }) {
  const [active, setActive] = useState(initialActive);
  const navigate = useNavigate();
  const location = useLocation();
  const routeActive = location.pathname === "/admin/analytics"
    ? "analytics"
    : location.pathname === "/admin/reports"
      ? "all-reports"
    : location.pathname === "/admin/users"
      ? "users"
    : location.pathname.startsWith("/admin/issues")
      ? "queue"
      : active;

  useEffect(() => {
    if (location.pathname !== "/admin/dashboard") return undefined;
    const sectionIds = NAV.filter((item) => item.id).map((item) => item.id);
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(() => {
      const headerOffset = 80;
      const midpoint = headerOffset + (window.innerHeight - headerOffset) * 0.35;
      const current = sections
        .map((section) => ({ section, rect: section.getBoundingClientRect() }))
        .filter(({ rect }) => rect.top <= midpoint && rect.bottom > headerOffset)
        .sort((a, b) => Math.abs(a.rect.top - headerOffset) - Math.abs(b.rect.top - headerOffset));
      if (current[0]) setActive(current[0].section.id);
    }, { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNav = (item) => {
    if (item.route) {
      setActive(item.key);
      navigate(item.route);
      return;
    }
    if (item.external) {
      navigate(item.external);
      return;
    }
    setActive(item.key);
    if (location.pathname !== "/admin/dashboard") {
      navigate(`/admin/dashboard#${item.id}`);
      return;
    }
    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-header hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Logo />
          <Badge variant="outline" className="border-ai/25 bg-ai/10 text-ai-foreground text-[10px]">
            Admin
          </Badge>
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
                  routeActive === item.key && !item.external
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
        <header className="sticky top-0 z-header flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <Logo />
            <Badge variant="outline" className="border-ai/25 bg-ai/10 text-ai-foreground text-[10px]">
              Admin
            </Badge>
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>

      <nav
        aria-label="Admin navigation"
        className="fixed inset-x-0 bottom-0 z-header border-t bg-background/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-xl overflow-x-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = routeActive === item.key && !item.external;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNav(item)}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[3.5rem] min-w-20 flex-1 flex-col items-center justify-center gap-1 text-[9px] font-medium transition-colors",
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
    </div>
  );
}
