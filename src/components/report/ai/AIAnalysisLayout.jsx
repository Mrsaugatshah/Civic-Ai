import { Sparkles } from "lucide-react";

import { AnalysisStatesChip } from "./AnalysisStatesChip";

export function AIAnalysisLayout({ reportId, state = "complete", children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6" data-testid="ai-header">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display flex items-center gap-2 text-2xl font-bold text-foreground">
            <Sparkles size={20} className="text-ai" />
            CivicAI Analysis
          </h1>
          <span className="font-mono rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
            {reportId}
          </span>
          <AnalysisStatesChip state={state} />
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          CivicAI reviewed your evidence and routed this report to the team most likely to resolve
          it. Every decision below is explainable and can be corrected by a human reviewer.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">{children}</div>

      <footer className="mt-8 rounded-lg border border-ai/20 bg-ai-gradient px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-ai-foreground">Safety disclaimer.</span> AI-generated
          assessments are recommendations and may require human verification. CivicAI never blocks
          an emergency hotline call — for urgent hazards call your local emergency number.
        </p>
      </footer>
    </div>
  );
}
