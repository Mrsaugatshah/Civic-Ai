import { useState } from "react";
import { Gauge, CircleCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { SEVERITY_META } from "../reportMeta";
import { AnalysisPanel } from "./AnalysisPanel";
import { cn } from "@/lib/utils";

const SCALE = ["Low", "Medium", "High", "Critical"];

function SeverityScale({ level }) {
  const idx = Math.max(0, SCALE.indexOf(level ?? "Low"));
  return (
    <div className="relative mt-5" data-testid="severity-scale">
      <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
        {SCALE.map((s, i) => (
          <span key={s} className={cn(i === idx && "font-bold text-foreground")}>
            {s}
          </span>
        ))}
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-gradient-to-r from-success via-warning to-error">
        <span
          aria-hidden
          className="absolute -top-[3px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-foreground shadow"
          style={{ left: `${(idx / (SCALE.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function SeverityCard({ severity }) {
  const [open, setOpen] = useState(false);
  const meta = SEVERITY_META[severity?.level] ?? SEVERITY_META.medium;

  return (
    <AnalysisPanel
      badge="Severity Assessment"
      title="How urgent is this?"
      dataTestId="ai-severity"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-ai-foreground"
          onClick={() => setOpen(true)}
        >
          <Gauge size={13} />
          Review assessment
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
          <CircleCheck size={12} />
          {severity?.label ?? "Uncertain"} severity
        </span>
        <span className="text-xs text-muted-foreground">
          AI confidence <span className="font-semibold tabular-nums text-foreground">{severity?.confidence}%</span>
        </span>
      </div>
      <SeverityScale level={severity?.level} />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        AI assessment factors
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(severity?.factors ?? []).map((f) => (
          <li key={f.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{f.score}%</span>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Why this severity?</DialogTitle>
            <DialogDescription>
              CivicAI combines visual damage, safety risk, disruption and accessibility.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">{severity?.explanation}</p>
          <div className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            AI severity is an estimate for routing — it never replaces an emergency hotline. You can
            correct it before the report is acted on.
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>
              <X size={14} />
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnalysisPanel>
  );
}
