import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Landmark, Clock } from "lucide-react";

import { formatDateTime } from "./format";
import { cn } from "@/lib/utils";

const STAGE_ICON = {
  submitted: null, // rendered as a numbered/check circle
  ai_analysis: null,
  assigned: Landmark,
  in_progress: Clock,
  resolved: null,
};

function TimelineItem({ step, open, onToggle }) {
  const Icon = STAGE_ICON[step.key];
  const last = false;
  const isCurrent = step.current && !step.done;

  return (
    <li className="relative flex gap-3.5" aria-current={isCurrent ? "step" : undefined}>
      {/* connector line */}
      {!last && (
        <span
          aria-hidden
          className={cn(
            "absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px",
            step.done ? "bg-success/40" : "bg-border"
          )}
        />
      )}

      {/* marker */}
      <span
        className={cn(
          "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          step.done && "border-success bg-success text-white",
          isCurrent && "border-primary bg-primary text-primary-foreground",
          !step.done && !isCurrent && "border-border bg-background text-muted-foreground"
        )}
      >
        {step.done ? (
          <Check size={13} strokeWidth={3} aria-hidden />
        ) : Icon ? (
          <Icon size={12} aria-hidden />
        ) : (
          <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
        )}
      </span>

      {/* content */}
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium",
              step.done || isCurrent ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {step.label}
          </p>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary animate-pulse-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Current stage
            </span>
          )}
          {step.at && (
            <span className="text-xs text-muted-foreground">{formatDateTime(step.at)}</span>
          )}
        </div>

        {(step.done || isCurrent) && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.note}</p>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`timeline-detail-${step.key}`}
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {open ? "Hide details" : "Show details"}
          <ChevronDown
            size={13}
            className={cn("transition-transform duration-fast", open && "rotate-180")}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`timeline-detail-${step.key}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-md border bg-accent/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {step.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {step.detail ?? step.note}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {step.at && (
                    <span>
                      Updated: <span className="font-medium text-foreground">{formatDateTime(step.at)}</span>
                    </span>
                  )}
                  {step.department && (
                    <span>
                      Responsible department:{" "}
                      <span className="font-medium text-foreground">{step.department}</span>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] italic text-muted-foreground">
                  Internal authority notes are not shown here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

export function StatusTimeline({ steps = [], selectedKey = null, onSelect }) {
  const [localOpen, setLocalOpen] = useState({});

  const openKey = selectedKey ?? null;
  const isOpen = (key) => (openKey ? openKey === key : Boolean(localOpen[key]));

  const toggle = (key) => {
    if (onSelect) {
      onSelect(key);
      return;
    }
    setLocalOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ol className="space-y-0" aria-label="Report status timeline">
      {steps.map((step) => (
        <TimelineItem
          key={step.key}
          step={step}
          open={isOpen(step.key)}
          onToggle={() => toggle(step.key)}
        />
      ))}
    </ol>
  );
}
