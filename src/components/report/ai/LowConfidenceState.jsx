import { AlertTriangle, Camera, Mic, MapPin } from "lucide-react";

import { AnalysisPanel } from "./AnalysisPanel";
import { ConfidenceIndicator } from "./ConfidenceIndicator";

export function LowConfidenceState({ result }) {
  const confidence = result?.classification?.confidence ?? 0;

  return (
    <AnalysisPanel
      badge="Low Confidence"
      title="AI confidence is limited"
      dataTestId="ai-low-confidence"
      icon={AlertTriangle}
      className="lg:col-span-12"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        CivicAI could not reach a confident assessment. The results below are softer estimates —
        they will be flagged for a human reviewer before any action is taken.
      </p>
      <div className="mt-3 max-w-sm">
        <ConfidenceIndicator confidence={confidence} />
      </div>
      <div className="mt-4 rounded-lg border border-ai/20 bg-background/70 p-3">
        <p className="text-xs font-semibold text-foreground">Want a sharper assessment?</p>
        <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-3">
          <li className="flex items-center gap-1.5">
            <Camera size={12} className="text-ai" /> Add a clearer photo
          </li>
          <li className="flex items-center gap-1.5">
            <Mic size={12} className="text-ai" /> Add a voice note
          </li>
          <li className="flex items-center gap-1.5">
            <MapPin size={12} className="text-ai" /> Pin an exact location
          </li>
        </ul>
      </div>
    </AnalysisPanel>
  );
}
