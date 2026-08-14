import { Link } from "react-router-dom";
import { BadgeCheck, Construction } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardStub({ roleLabel, description }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar active="Dashboard" />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Construction size={26} />
          </span>
          <div className="mt-5 flex items-center justify-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              {roleLabel} dashboard
            </h1>
            <Badge variant="secondary">
              <BadgeCheck size={12} className="mr-1 text-success" />
              Protected
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
          <p className="mt-6 rounded-lg bg-accent px-4 py-3 text-xs font-medium text-accent-foreground">
            Built in Part 4 — this placeholder confirms that authentication,
            protected routes, and role-based redirects are working correctly.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/">Back to landing</Link>
            </Button>
            <Button asChild>
              <Link to="/design-system">Design system</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
