import { Sparkles, Mic, FileImage, MapPin, FileText, Gauge, RotateCcw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { reportCategoryMeta, SEVERITY_META } from "./reportMeta";
import { cn } from "@/lib/utils";

function EmptyRow({ label }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/60">Not added yet</span>
    </div>
  );
}

export function ReportPreview({ report, analysis }) {
  const { media = [], transcript = "", description = "", location } = report;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
        <p className="text-xs font-semibold text-muted-foreground">Your report, so far</p>
      </div>
      <CardContent className="divide-y divide-border/70 p-0">
        <div className="px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FileImage size={13} className="text-primary" />
            Evidence
          </p>
          {media.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {media.map((m) => (
                <img
                  key={m.id}
                  src={m.preview}
                  alt=""
                  className="h-12 w-12 rounded-md border object-cover"
                />
              ))}
              {transcript && (
                <span className="flex h-12 w-12 items-center justify-center rounded-md border border-ai/30 bg-ai-gradient text-ai">
                  <Mic size={16} />
                </span>
              )}
            </div>
          ) : transcript ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mic size={13} className="text-ai" /> Voice note recorded
            </p>
          ) : (
            <EmptyRow label="Photos or voice note" />
          )}
        </div>

        <div className="px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FileText size={13} className="text-primary" />
            Description
          </p>
          {description ? (
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : transcript ? (
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {transcript}
            </p>
          ) : (
            <EmptyRow label="Description" />
          )}
        </div>

        <div className="px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MapPin size={13} className="text-primary" />
            Location
          </p>
          {location ? (
            <p className="mt-1 text-xs font-medium text-foreground">{location.name}</p>
          ) : (
            <EmptyRow label="Location" />
          )}
        </div>

        <div className="px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={13} className="text-ai" />
            AI analysis
          </p>
          {analysis ? (
            <div className="mt-2 space-y-2">
              {(() => {
                const cat = reportCategoryMeta(analysis.category);
                const CatIcon = cat.icon;
                const sev = SEVERITY_META[analysis.severity];
                return (
                  <>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        cat.tone
                      )}
                    >
                      <CatIcon size={12} />
                      {cat.label}
                    </span>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Severity{" "}
                        <span className="font-semibold" style={{ color: sev.dot }}>
                          {sev.label}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Gauge size={13} className="text-ai" />
                        {analysis.priorityScore}/100
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-ai" />
              Runs after details &amp; location
            </p>
          )}
        </div>

        <div className="px-5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <RotateCcw size={13} className="text-primary" />
            Citizen review
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can correct the AI before it's submitted.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
