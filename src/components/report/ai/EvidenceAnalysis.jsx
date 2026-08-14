import { Camera, Mic, FileText, Layers } from "lucide-react";

import { AnalysisPanel } from "./AnalysisPanel";

const KIND_META = {
  image: { label: "Photo", icon: Camera, chip: "bg-info/10 text-info-foreground" },
  voice: { label: "Voice note", icon: Mic, chip: "bg-purple-500/10 text-purple-700" },
  text: { label: "Description", icon: FileText, chip: "bg-success/10 text-success-foreground" },
};

export function EvidenceAnalysis({ evidence }) {
  const items = evidence?.items ?? [];

  return (
    <AnalysisPanel badge="Evidence Processing" title="What CivicAI reviewed" dataTestId="ai-evidence">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const meta = KIND_META[item.kind] ?? KIND_META.text;
          const Icon = meta.icon;
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-ai/20 bg-background/70 px-3 py-2.5"
            >
              <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.chip}`}>
                <Icon size={15} />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  {item.label}
                  {item.kind === "voice" && (
                    <span className="tabular-nums text-muted-foreground">
                      · {item.durationSec}s
                    </span>
                  )}
                </p>
                {item.detail && (
                  <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {evidence?.summary && (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Layers size={13} className="mt-0.5 shrink-0 text-ai" />
          {evidence.summary}
        </p>
      )}
    </AnalysisPanel>
  );
}
