import { SEVERITY_LEVELS } from "@/services/report/reportService";
import { SEVERITY_META } from "./reportMeta";
import { cn } from "@/lib/utils";

export function SeverityIndicator({ value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        Tap to correct the severity estimate
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SEVERITY_LEVELS.map((level) => {
          const meta = SEVERITY_META[level.key];
          const active = value === level.key;
          return (
            <button
              key={level.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(level.key)}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.dot }}
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">{level.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {level.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Severity drives routing. If this is an emergency, call your local hotline instead.
      </p>
    </div>
  );
}
