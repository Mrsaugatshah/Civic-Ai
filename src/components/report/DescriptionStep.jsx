import { Pencil, CircleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MAX_DESCRIPTION } from "@/services/report/reportService";
import { cn } from "@/lib/utils";

export function DescriptionStep({ value, onChange, error, disabled, transcript }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">What's happening?</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Describe what you observed. Your original wording is stored unchanged.</p>
        </div>
        <div className="relative">
          <Textarea value={value} onChange={(event) => onChange(event.target.value.slice(0, MAX_DESCRIPTION))} rows={7} maxLength={MAX_DESCRIPTION} placeholder="e.g. There's a deep pothole on the main road near the school gate. Motorcycles are swerving into oncoming traffic every morning, and it gets worse after rain." className="min-h-[180px] resize-y text-[15px] leading-relaxed" aria-label="Issue description" disabled={disabled} />
          <div className={cn("pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums",value.length>=MAX_DESCRIPTION-20?"font-semibold text-error-foreground":"text-muted-foreground")}>{value.length}/{MAX_DESCRIPTION}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {transcript && <Badge variant="secondary" className="font-normal"><Pencil size={11} className="text-primary" />Based on your voice note</Badge>}
          <p className="text-xs text-muted-foreground">Tip: mention what, where, and roughly how long it has been happening.</p>
        </div>
        {error && <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-error-foreground"><CircleAlert size={15} />{error}</p>}
      </CardContent>
    </Card>
  );
}
