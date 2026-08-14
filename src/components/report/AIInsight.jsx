import { useState } from "react";
import { Sparkles, HelpCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PRIORITY_FACTORS } from "@/services/report/reportService";

export function AIInsight({ explanation, recommendedAction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
          <Sparkles size={12} className="text-ai" />
          AI explanation
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{explanation}</p>
      {recommendedAction && (
        <p className="mt-3 text-xs font-medium text-foreground">
          Recommended routing: <span className="text-ai-foreground">{recommendedAction}</span>
        </p>
      )}
      <Button variant="ghost" size="sm" className="mt-3 -ml-2 h-8 px-2 text-xs text-ai-foreground" onClick={() => setOpen(true)}>
        <HelpCircle size={13} />
        How is this calculated?
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How is the priority calculated?</DialogTitle>
            <DialogDescription>
              CivicAI weighs five signals from your report and similar ones nearby.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2.5">
            {PRIORITY_FACTORS.map((factor) => (
              <li key={factor.key} className="flex items-start gap-2.5 text-sm">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-ai" />
                <span>
                  <span className="font-medium text-foreground">{factor.label}.</span>{" "}
                  <span className="text-muted-foreground">{factor.description}.</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            AI priority is an estimate for routing — it never replaces an emergency hotline. You can
            correct anything before submitting.
          </p>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>
              <X size={14} />
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
