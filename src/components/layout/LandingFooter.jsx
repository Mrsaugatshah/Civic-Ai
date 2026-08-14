import { Link } from "react-router-dom";
import { Landmark, Map, Send } from "lucide-react";

import { Logo } from "./Navbar";
import { Badge } from "@/components/ui/badge";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Report an issue", href: "/report" },
      { label: "City map", href: "/map" },
      { label: "AI analysis", href: "#ai" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Platform overview", href: "#platform" },
      { label: "Data & privacy", href: "#faq" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Community impact", href: "#impact" },
      { label: "Questions & answers", href: "#faq" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

function FooterLink({ href, children, className }) {
  if (href.startsWith("/")) return <Link to={href} className={className}>{children}</Link>;
  return <a href={href} className={className}>{children}</a>;
}

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered civic problem intelligence. Report it, understand it, and get it
              fixed — together.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
                All systems operational
              </Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/report" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <Send size={14} /> Report an issue
              </Link>
              <Link to="/map" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary">
                <Map size={14} /> View city map
              </Link>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 CivicAI — Made with <span aria-hidden>❤️</span>{" "}
            <span className="sr-only">love</span> for smarter cities.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Landmark size={13} className="text-brand" />
              SDG 11 — Sustainable Cities &amp; Communities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
