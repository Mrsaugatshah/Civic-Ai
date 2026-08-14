import { useRef, useState } from "react";
import { Sparkles, Loader2, Pencil, CircleAlert } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateDescription, MAX_DESCRIPTION } from "@/services/report/reportService";
import { cn } from "@/lib/utils";

export function DescriptionStep({ value, onChange, error, disabled, transcript }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const previousRef = useRef(null);

  const runGenerate = async () => {
    if (generating) return;
    previousRef.current = value;
    setGenerating(true);
    setGenerated(false);
    try {
      const text = await generateDescription({ transcript, current: value });
      onChange(text);
      setGenerated(true);
      toast.success("Description drafted by CivicAI — edit anything you'd like.");
    } catch {
      toast.error("Couldn't generate a description. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              What's happening?
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              A few sentences help the AI route your report to the right team.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runGenerate}
            disabled={disabled || generating}
            aria-label="Generate description with AI"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="text-ai" />
            )}
            {generating ? "Drafting…" : "Generate description"}
          </Button>
        </div>

        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value.slice(0, MAX_DESCRIPTION));
              if (previousRef.current !== null && e.target.value !== previousRef.current) {
                setGenerated(false);
              }
            }}
            rows={7}
            maxLength={MAX_DESCRIPTION}
            placeholder="e.g. There's a deep pothole on the main road near the school gate. Motorcycles are swerving into oncoming traffic every morning, and it gets worse after rain."
            className="min-h-[180px] resize-y text-[15px] leading-relaxed"
            aria-label="Issue description"
            disabled={disabled}
          />
          <div
            className={cn(
              "pointer-events-none absolute bottom-2.5 right-3 text-[11px] tabular-nums",
              value.length >= MAX_DESCRIPTION - 20
                ? "font-semibold text-error-foreground"
                : "text-muted-foreground"
            )}
          >
            {value.length}/{MAX_DESCRIPTION}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {generated && (
            <Badge variant="secondary" className="font-normal">
              <Sparkles size={11} className="text-ai" />
              Drafted by CivicAI
            </Badge>
          )}
          {transcript && (
            <Badge variant="secondary" className="font-normal">
              <Pencil size={11} className="text-primary" />
              Based on your voice note
            </Badge>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: mention what, where, and roughly how long it's been happening.
          </p>
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-error-foreground">
            <CircleAlert size={15} />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
