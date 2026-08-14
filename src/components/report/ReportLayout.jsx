import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportProgress } from "./ReportProgress";
import { cn } from "@/lib/utils";

export function ReportLayout({
  step,
  title,
  subtitle,
  onBack,
  onContinue,
  continueLabel = "Continue",
  canContinue = true,
  busy = false,
  backLabel = "Back",
  children,
  aside,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-10">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="mt-5">
          <ReportProgress current={step} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        <main className="min-w-0">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>

          {onContinue && (
            <div
              className={cn(
                "sticky bottom-0 z-10 mt-6 flex items-center justify-between gap-3 border-t bg-background/90 px-1 py-4 backdrop-blur-sm md:static md:border-0 md:px-0 md:py-0 md:pt-2"
              )}
            >
              {onBack ? (
                <Button variant="ghost" size="sm" onClick={onBack} disabled={busy}>
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">{backLabel}</span>
                </Button>
              ) : (
                <span />
              )}
              <Button size="sm" onClick={onContinue} disabled={!canContinue || busy}>
                {busy && <Loader2 size={15} className="animate-spin" />}
                {continueLabel}
                {!busy && <ArrowRight size={15} />}
              </Button>
            </div>
          )}
        </main>

        {aside && (
          <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Report summary">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
