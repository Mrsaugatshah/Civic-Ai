import { Sparkles, Check } from "lucide-react";

import { AnalysisPanel } from "./AnalysisPanel";

export function AIExplanation({ explanation }) {
  return (
    <AnalysisPanel
      badge="AI Explanation"
      title={explanation?.title ?? "Why CivicAI thinks this matters"}
      dataTestId="ai-explanation"
      className="lg:col-span-12"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        CivicAI's recommendation is built from every signal in this report:
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(explanation?.points ?? []).map((point) => (
          <li
            key={point.key}
            className="flex items-start gap-2.5 rounded-lg border border-ai/20 bg-background/70 px-3 py-2.5"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ai/10">
              <Check size={12} className="text-ai-foreground" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">{point.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{point.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <Sparkles size={13} className="mt-0.5 shrink-0 text-ai" />
        AI-generated assessments are recommendations and may require human verification.
      </p>
    </AnalysisPanel>
  );
}
