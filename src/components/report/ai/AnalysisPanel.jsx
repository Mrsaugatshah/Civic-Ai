import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared AI panel shell — indigo border, soft gradient wash, badge.
 * Keeps every analysis card visually consistent without repeating markup.
 */
export function AnalysisPanel({ icon: Icon = Sparkles, badge, title, action, children, className, dataTestId }) {
  return (
    <section
      data-testid={dataTestId}
      className={cn(
        "relative overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ai/20 blur-2xl"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
            <Icon size={12} className="text-ai" />
            {badge}
          </span>
          {action}
        </div>
        {title && (
          <h3 className="font-display mt-3 text-base font-semibold text-foreground">{title}</h3>
        )}
        <div className="relative mt-3">{children}</div>
      </div>
    </section>
  );
}
