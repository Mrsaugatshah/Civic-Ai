import { Link } from "react-router-dom";
import { Plus, ArrowRight, Timer, Route, Lightbulb, Trash2, Droplets } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QUICK_CATEGORIES = [
  { label: "Road", icon: Route },
  { label: "Streetlight", icon: Lightbulb },
  { label: "Waste", icon: Trash2 },
  { label: "Water", icon: Droplets },
];

export function QuickReportCard() {
  return (
    <section id="report-card" className="scroll-mt-24">
      <Card className="relative h-full overflow-hidden border-brand/25 bg-gradient-to-br from-brand-light/50 via-background to-background">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/15 blur-2xl" />
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Plus size={20} strokeWidth={2.25} />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Spot an issue?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Report it in under a minute. Our AI helps verify, prioritize, and route it to the
              right team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button key={cat.label} asChild variant="outline" size="sm" className="bg-background/70">
                  <Link to="/report?quick=1">
                    <Icon size={13} className="text-primary" />
                    {cat.label}
                  </Link>
                </Button>
              );
            })}
          </div>
          <Button asChild className="mt-auto w-full">
            <Link to="/report?quick=1">
              <Plus size={15} />
              Report an issue
              <ArrowRight size={14} />
            </Link>
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Timer size={12} />
            Average time to report: 1 minute
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
