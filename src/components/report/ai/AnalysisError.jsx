import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AnalysisPanel } from "./AnalysisPanel";

export function AnalysisError({ error, onRetry }) {
  return (
    <AnalysisPanel
      badge="Analysis Failed"
      title="CivicAI couldn't finish"
      dataTestId="ai-error"
      icon={TriangleAlert}
      className="lg:col-span-12"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        {error?.message ??
          "Something went wrong while analyzing this report. Please try again."}
      </p>
      {error?.retryable !== false && (
        <Button className="mt-4" onClick={onRetry}>
          <RotateCcw size={14} />
          Try Again
        </Button>
      )}
    </AnalysisPanel>
  );
}
