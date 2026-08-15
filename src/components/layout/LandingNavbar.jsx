import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { Logo } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { reportDestination, reportDestinationState } from "@/utils/reportNavigation";

const LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
];

export function LandingNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const reportTarget = reportDestination(isAuthenticated ? user : null);
  const reportState = reportDestinationState(isAuthenticated ? user : null);
  const communityTarget = isAuthenticated ? "/issues" : "/map";

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    const outside = (event) => { if (headerRef.current && !headerRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, [open]);

  return (
    <header ref={headerRef} className="sticky top-0 z-[60] isolate border-b bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => <a key={link.label} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{link.label}</a>)}
        </nav>
          <div className="flex items-center gap-1">
            <ThemeSelector compact />
          {isAuthenticated ? <UserMenu /> : <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/login">Sign In</Link></Button>}
          <Button asChild className="hidden sm:inline-flex"><Link to={reportTarget} state={reportState}>Report an Issue</Link></Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="landing-mobile-nav">{open ? <X size={20} /> : <Menu size={20} />}</Button>
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.nav id="landing-mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="overflow-hidden border-t bg-background md:hidden"><div className="space-y-1 px-4 py-3">{LINKS.map((link) => <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{link.label}</a>)}<Link to={communityTarget} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">Community Issues</Link>{!isAuthenticated && <Button variant="outline" asChild className="mt-2 w-full" onClick={() => setOpen(false)}><Link to="/login">Sign In</Link></Button>}<Button asChild className="mt-2 w-full" onClick={() => setOpen(false)}><Link to={reportTarget} state={reportState}>Report an Issue</Link></Button></div></motion.nav>}
      </AnimatePresence>
    </header>
  );
}
