import { FileText, Sparkles, Landmark, Clock, CheckCircle2, Camera, History } from "lucide-react";

import { formatDateTime } from "./format";
import { cn } from "@/lib/utils";

const ICON_META = {
  submitted: { icon: FileText, tone: "bg-primary/10 text-primary" },
  ai: { icon: Sparkles, tone: "bg-ai/10 text-ai" },
  assigned: { icon: Landmark, tone: "bg-indigo-500/10 text-indigo-700" },
  progress: { icon: Clock, tone: "bg-orange-500/10 text-orange-700" },
  resolved: { icon: CheckCircle2, tone: "bg-success/10 text-success-foreground" },
  evidence: { icon: Camera, tone: "bg-brand/10 text-brand-foreground" },
};

export function ReportActivity({ items }) {
  return (
    <ol className="space-y-4" aria-label="Report activity">
      {items.map((item) => {
        const meta = ICON_META[item.icon] ?? { icon: History, tone: "bg-muted text-muted-foreground" };
        const Icon = meta.icon;
        return (
          <li key={item.key} className="flex items-start gap-3">
            <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
              <Icon size={14} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{item.text}</p>
              {item.at && <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(item.at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
