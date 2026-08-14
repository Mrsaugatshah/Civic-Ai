import { useState } from "react";
import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { AIOrb } from "@/components/civic/AICard";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { cn } from "@/lib/utils";

const RANKED = [
  {
    rank: "01",
    title: "Broken Traffic Signal",
    location: "Main Road",
    priority: 97,
    severity: "critical",
    reports: 18,
    summary:
      "High safety risk, 18 citizen reports, and a location near a school and major intersection make this issue a high priority.",
    signals: [
      { label: "Safety risk", value: "High" },
      { label: "Community reports", value: "18" },
      { label: "Near school", value: "120m" },
      { label: "Traffic level", value: "High" },
    ],
  },
  {
    rank: "02",
    title: "Large Road Pothole",
    location: "Highway",
    priority: 91,
    severity: "high",
    reports: 17,
    summary:
      "A wide pothole on the highway with 17 citizen reports — it slows morning traffic for hundreds of commuters every day.",
    signals: [
      { label: "Severity", value: "High" },
      { label: "Community reports", value: "17" },
      { label: "Road type", value: "Highway" },
      { label: "Traffic impact", value: "High" },
    ],
  },
  {
    rank: "03",
    title: "Overflowing Waste",
    location: "Central Market",
    priority: 84,
    severity: "high",
    reports: 14,
    summary:
      "Overflowing waste near the Central Market affects public health and draws repeated reports from residents and vendors.",
    signals: [
      { label: "Health risk", value: "High" },
      { label: "Community reports", value: "14" },
      { label: "Near", value: "Market" },
      { label: "Repeat reports", value: "6" },
    ],
  },
];

export function PriorityQueue() {
  const [selected, setSelected] = useState(0);
  const issue = RANKED[selected];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {RANKED.map((item, i) => (
          <button
            key={item.rank}
            type="button"
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            className={cn(
              "block w-full rounded-xl border bg-background p-4 text-left transition-colors",
              selected === i ? "border-primary/40 shadow-soft" : "border-border hover:border-primary/25"
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "font-display text-2xl font-bold tabular-nums",
                  selected === i ? "text-primary" : "text-muted-foreground/60"
                )}
              >
                #{item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
                    {item.title}
                  </p>
                  <span className="text-xs text-muted-foreground">· {item.location}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-display text-lg font-bold tabular-nums text-foreground">
                    {item.priority}
                    <span className="text-xs font-medium text-muted-foreground">/100</span>
                  </span>
                  <SeverityBadge severity={item.severity} className="px-2 py-0.5 text-[10px]" />
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users size={12} />
                    {item.reports} reports
                  </span>
                </div>
                <PriorityMeter score={item.priority} className="mt-2" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card className="lg:col-span-2">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why this needs attention</p>
            <h3 className="font-display mt-2 text-lg font-semibold tracking-tight text-foreground">
              {issue.title}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-3xl font-bold tabular-nums text-foreground">
                {issue.priority}
                <span className="text-base font-medium text-muted-foreground">/100</span>
              </span>
              <PriorityMeter score={issue.priority} className="flex-1" />
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{issue.summary}</p>

          <div className="grid grid-cols-2 gap-2">
            {issue.signals.map((signal) => (
              <div key={signal.label} className="rounded-lg border bg-background/60 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">{signal.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{signal.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-ai/15 bg-ai-gradient p-3">
            <AIOrb size={48} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-ai-foreground">Severity + Reports + Location + Public Impact</span>{" "}
              combine into one priority score.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
