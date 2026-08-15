import { Landmark } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "./Navbar";
import { Badge } from "@/components/ui/badge";

const COLUMNS = [
  {
    title: "Platform",
    links: [["Report an issue", "/report"], ["City map", "/map"], ["Priority queue", "/admin/dashboard#queue"], ["AI analysis", "/admin/dashboard#insights"]],
  },
  {
    title: "Resources",
    links: [["How it works", "/#how-it-works"], ["For authorities", "/login"], ["Data & privacy", "/#faq"], ["Status", "/"]],
  },
  {
    title: "Community",
    links: [["Community issues", "/issues"], ["Report an issue", "/report"], ["Contact", "mailto:civicai@example.com"]],
  },
];

export function Footer() {
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
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("/") ? <Link to={href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{label}</Link> : <a href={href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CivicAI. Built for sustainable cities.
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
