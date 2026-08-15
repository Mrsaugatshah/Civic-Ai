import { toast } from "sonner";
import { Camera, Mic, FileText, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportCategoryMeta } from "./reportMeta";

function formatVoice(sec) {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `00:${m}${s}`;
}

export function ReportMedia({ report }) {
  const meta = reportCategoryMeta(report.category);
  const Icon = meta.icon;
  const voiceLabel = formatVoice(report.media?.voiceSec);

  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft">
      <h3 className="font-display text-sm font-semibold text-foreground">Your evidence</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        The material you submitted with this report.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Original photos */}
        <div className="rounded-md border bg-background p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Camera size={13} className="text-primary" aria-hidden />
            Original Photos
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(report.evidence || []).filter((item) => item.kind === "citizen").map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block h-16 w-16 overflow-hidden rounded-md border bg-accent/40">
                <img src={item.url} alt={item.originalName || "Report evidence"} className="h-full w-full object-cover" />
              </a>
            ))}
            {!report.evidence?.some((item) => item.kind === "citizen") && <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-accent/40" aria-label="No report image"><Icon size={20} className={meta.tone} /></div>}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {report.media?.photos ?? 1} image{report.media?.photos === 1 ? "" : "s"}
          </p>
        </div>

        {/* Voice report */}
        <div className="rounded-md border bg-background p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Mic size={13} className="text-brand" aria-hidden />
            Voice Report
          </p>
          {voiceLabel ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-8"
              onClick={() => toast.info("Voice playback is coming in a later part.")}
            >
              <Mic size={13} />
              {voiceLabel}
            </Button>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No voice note attached.</p>
          )}
        </div>
      </div>

      {report.description && (
        <div className="mt-3 rounded-md border bg-background p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <FileText size={13} className="text-muted-foreground" aria-hidden />
            Description
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock size={11} aria-hidden />
        Evidence can't be edited after submission.
      </p>
    </section>
  );
}
