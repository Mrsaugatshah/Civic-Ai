import { useState } from "react";
import { HelpCircle, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { AnalysisPanel } from "./AnalysisPanel";
import { reportCategoryMeta } from "../reportMeta";

export function ClassificationCard({ classification }) {
  const [open, setOpen] = useState(false);
  const meta = reportCategoryMeta(classification?.categoryKey);
  const Icon = meta.icon;

  return (
    <AnalysisPanel
      badge="Issue Classification"
      title={classification?.category ?? "Unclassified"}
      dataTestId="ai-classification"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-ai-foreground"
          onClick={() => setOpen(true)}
        >
          <HelpCircle size={13} />
          Why this category?
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.tone}`}>
          <Icon size={12} />
          {meta.label}
        </span>
        {classification?.subcategory && (
          <span className="inline-flex items-center rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
            {classification.subcategory}
          </span>
        )}
      </div>
      <div className="mt-4">
        <ConfidenceIndicator confidence={classification?.confidence} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Why did CivicAI pick this category?</DialogTitle>
            <DialogDescription>
              The model weighs your image, text, voice note and location together.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2.5">
            {(classification?.reasons ?? []).map((reason) => (
              <li key={reason} className="flex items-start gap-2.5 text-sm">
                <Check size={14} className="mt-0.5 shrink-0 text-success" />
                <span className="text-muted-foreground">{reason}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            You can change the category at any time — CivicAI keeps your choice.
          </p>
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
