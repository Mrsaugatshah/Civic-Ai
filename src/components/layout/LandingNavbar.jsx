import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI", href: "#ai" },
  { label: "Impact", href: "#impact" },
  { label: "FAQ", href: "#faq" },
];

const EASE = [0.16, 1, 0.3, 1];

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const headerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Solid background + subtle shadow only after scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy — a quiet active indicator for the section in view.
  useEffect(() => {
    const ids = LINKS.map((link) => link.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape or an outside click.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-header border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border bg-background/95 shadow-sm backdrop-blur-md"
          : "border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-primary"
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-base",
                    isActive && "scale-x-100"
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              variant="ghost"
              asChild
              className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          )}

          <Button asChild className="px-3 sm:px-4">
            <Link to="/report" aria-label="Report a problem">
              <MapPin size={15} />
              <span className="hidden min-[360px]:inline">Report a Problem</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" asChild className="flex-1" onClick={() => setOpen(false)}>
                    <Link to="/login">Sign in</Link>
                  </Button>
                </div>
              )}
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link to="/report">
                  <MapPin size={15} />
                  Report a Problem
                </Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
