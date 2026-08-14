import { useRef, useState } from "react";
import { ScanSearch, CheckCircle2, TriangleAlert, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { AnalysisPanel } from "./AnalysisPanel";

/* ------------------------------------------------------------------ */
/* Demo evidence image — inline SVG so no asset is needed and the      */
/* annotation boxes can be drawn at exact pixel coordinates.           */
/* ------------------------------------------------------------------ */

function DemoScene() {
  return (
    <svg
      viewBox="0 0 600 360"
      role="img"
      aria-label="Demo photo: a road with a large pothole near a pedestrian crossing"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="demo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="demo-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="600" height="360" fill="url(#demo-sky)" />
      {/* buildings */}
      <rect x="0" y="40" width="90" height="160" fill="#C7D2FE" />
      <rect x="18" y="70" width="24" height="26" fill="#A5B4FC" rx="2" />
      <rect x="50" y="70" width="24" height="26" fill="#A5B4FC" rx="2" />
      <rect x="18" y="110" width="24" height="26" fill="#A5B4FC" rx="2" />
      <rect x="50" y="110" width="24" height="26" fill="#A5B4FC" rx="2" />
      <rect x="510" y="30" width="90" height="170" fill="#E9D5FF" />
      <rect x="528" y="60" width="24" height="26" fill="#C4B5FD" rx="2" />
      <rect x="560" y="60" width="24" height="26" fill="#C4B5FD" rx="2" />
      <rect x="528" y="100" width="24" height="26" fill="#C4B5FD" rx="2" />

      {/* pavements */}
      <rect x="0" y="200" width="600" height="26" fill="#E2E8F0" />
      <rect x="0" y="282" width="600" height="20" fill="#CBD5E1" />

      {/* road surface */}
      <rect x="0" y="226" width="600" height="56" fill="url(#demo-road)" />
      <rect x="0" y="300" width="600" height="60" fill="url(#demo-road)" />
      {/* lane dashes */}
      {[40, 140, 240, 340, 440, 540].map((x) => (
        <rect key={x} x={x} y="250" width="34" height="8" rx="4" fill="#94A3B8" />
      ))}
      {[40, 140, 240, 340, 440, 540].map((x) => (
        <rect key={`b${x}`} x={x} y="324" width="34" height="8" rx="4" fill="#94A3B8" />
      ))}

      {/* crossing stripes */}
      {[100, 122, 144, 166, 188].map((x) => (
        <rect key={x} x={x} y="222" width="14" height="62" rx="2" fill="#F1F5F9" opacity="0.9" />
      ))}

      {/* pothole */}
      <ellipse cx="300" cy="250" rx="46" ry="18" fill="#0F172A" />
      <ellipse cx="300" cy="250" rx="46" ry="18" fill="#1E293B" />
      <ellipse cx="292" cy="246" rx="20" ry="8" fill="#0B1220" />
      <path d="M258 240 q6 8 2 20" stroke="#0F172A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M344 238 q-4 10 2 22" stroke="#0F172A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M262 262 q16 -6 26 2" stroke="#0F172A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* debris chips */}
      <circle cx="348" cy="262" r="4" fill="#94A3B8" />
      <circle cx="256" cy="266" r="3" fill="#CBD5E1" />

      {/* small car avoiding pothole */}
      <g transform="translate(150, 300)">
        <rect x="0" y="8" width="70" height="24" rx="6" fill="#6366F1" />
        <rect x="14" y="0" width="40" height="12" rx="6" fill="#4F46E5" />
        <circle cx="16" cy="34" r="8" fill="#0F172A" />
        <circle cx="54" cy="34" r="8" fill="#0F172A" />
      </g>
      <g transform="translate(380, 228)">
        <rect x="0" y="8" width="64" height="22" rx="6" fill="#EF4444" />
        <rect x="12" y="0" width="36" height="12" rx="6" fill="#DC2626" />
        <circle cx="14" cy="32" r="7" fill="#0F172A" />
        <circle cx="50" cy="32" r="7" fill="#0F172A" />
      </g>
    </svg>
  );
}

function DetectionOverlay({ detections }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {detections.map((d) => (
        <div
          key={d.label}
          className="absolute rounded border-2"
          style={{
            left: `${d.box.x}%`,
            top: `${d.box.y}%`,
            width: `${d.box.w}%`,
            height: `${d.box.h}%`,
            borderColor: "rgba(99,102,241,0.85)",
            boxShadow: "0 0 0 9999px rgba(15,23,42,0.12)",
          }}
        >
          <span className="absolute left-0 top-0 -translate-y-full rounded-t bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white">
            {d.label} {d.confidence}%
          </span>
        </div>
      ))}
    </div>
  );
}

function QualityBadge({ quality }) {
  if (!quality) return null;
  const good = quality.level === "good";
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
        good ? "bg-success/10 text-success-foreground" : "bg-warning/10 text-warning-foreground"
      )}
    >
      {good ? (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
      ) : (
        <TriangleAlert size={14} className="mt-0.5 shrink-0" />
      )}
      <div>
        <p className="font-semibold">
          Image quality: {good ? "Good" : "Limited"}
        </p>
        {!good && quality.issues?.length > 0 && (
          <p className="mt-0.5 text-muted-foreground">
            {quality.issues.map((i) => i.toLowerCase()).join(", ")} — CivicAI may miss details.
          </p>
        )}
      </div>
    </div>
  );
}

export function ImageDetection({ detections, quality }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [annotated, setAnnotated] = useState(true);
  const fileRef = useRef(null);

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info("Demo mode — extra images are recorded but not analyzed yet.");
    }
    event.target.value = "";
  };

  return (
    <AnalysisPanel
      badge="Visual Evidence"
      title="Image analysis"
      dataTestId="ai-image"
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-ai/25 bg-background/70 text-xs text-ai-foreground"
          onClick={() => setZoomOpen(true)}
        >
          <ScanSearch size={13} />
          Inspect
        </Button>
      }
    >
      <div className="relative overflow-hidden rounded-lg border border-ai/25 bg-background">
        <DemoScene />
        {annotated && <DetectionOverlay detections={detections} />}
        <span className="absolute bottom-2 right-2 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
          AI view · demo image
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {detections.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
              <span className="h-1.5 w-6 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-ai"
                  style={{ width: `${d.confidence}%` }}
                />
              </span>
              {d.confidence}%
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        <QualityBadge quality={quality} />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs text-ai-foreground"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus size={13} />
          Upload another image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-hidden
          onChange={onUpload}
        />
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanSearch size={16} className="text-ai" />
              Inspect evidence photo
            </DialogTitle>
            <DialogDescription>
              Toggle between the original photo and CivicAI's annotated view.
            </DialogDescription>
          </DialogHeader>
          <div className="relative overflow-hidden rounded-lg border border-ai/25 bg-background">
            <DemoScene />
            {annotated && <DetectionOverlay detections={detections} />}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setAnnotated(false)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  !annotated ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setAnnotated(true)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  annotated ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                AI view
              </button>
            </div>
            <Button size="sm" onClick={() => setZoomOpen(false)}>
              <X size={14} />
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnalysisPanel>
  );
}
