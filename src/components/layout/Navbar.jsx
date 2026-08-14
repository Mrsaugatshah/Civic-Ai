import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  Sparkles,
  Map,
  LayoutDashboard,
  AlertCircle,
  Landmark,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/contexts/AuthContext";
import { roleHome } from "@/utils/roles";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", icon: Landmark, href: "/" },
  { label: "City map", icon: Map, href: "/map" },
  { label: "Issues", icon: AlertCircle, href: "/map" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
];

export function Logo({ className }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-soft">
        <Landmark size={18} strokeWidth={2.25} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Civic<span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

export function Navbar({ active = "Home" }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardTarget = isAuthenticated ? roleHome(user.role) : "/login";
  const reportTarget = user?.role === "citizen" ? "/report" : dashboardTarget;

  return (
    <header className="sticky top-0 z-header border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "h-9 text-sm font-medium",
                active === item.label
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link to={item.label === "Dashboard" ? dashboardTarget : item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error ring-2 ring-background" />
              </Button>
              <UserMenu />
            </>
          ) : (
            <Button variant="ghost" asChild className="hidden text-muted-foreground hover:text-foreground sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
          )}

          <Button asChild className="ml-1 hidden sm:inline-flex">
            <Link to={reportTarget}>
              <Sparkles size={15} />
              Report an issue
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    asChild
                    onClick={() => setOpen(false)}
                    className={cn(
                      "w-full justify-start gap-2.5",
                      active === item.label
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Link to={item.href}>
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
              <Separator className="my-2" />
              <Button asChild onClick={() => setOpen(false)} className="w-full">
                <Link to={reportTarget}>
                  <Sparkles size={15} />
                  Report an issue
                </Link>
              </Button>
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-normal">SDG 11</Badge>
                </span>
                <span className="text-xs text-muted-foreground">v0.1 · demo</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
