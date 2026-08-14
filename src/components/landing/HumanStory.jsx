import { Camera, Sparkles, Users, Building2, CheckCircle2, MessageSquareQuote } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { BeforeAfterSlider } from "@/components/reports/BeforeAfterSlider";

const STORY = [
  {
    icon: Camera,
    tone: "text-warning",
    title: "A citizen notices",
    body: "“I pass this road every day. It keeps getting worse.”",
  },
  {
    icon: Sparkles,
    tone: "text-ai",
    title: "CivicAI understands it",
    body: "Detects Pothole · Severity High · Priority 91/100",
  },
  {
    icon: Users,
    tone: "text-info",
    title: "The community agrees",
    body: "17 people confirm the same problem nearby.",
  },
  {
    icon: Building2,
    tone: "text-success",
    title: "The city acts",
    body: "Public Works receives the issue and schedules the repair.",
  },
];

export function HumanStory() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="space-y-2.5">
        {STORY.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex gap-3 rounded-lg p-2">
              <div className="flex flex-col items-center">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent ${step.tone}`}>
                  <Icon size={16} />
                </span>
                {i < STORY.length - 1 && <span aria-hidden className="mt-1 h-full w-px flex-1 bg-border" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">One report, end to end</p>
              <Badge variant="secondary" className="text-[10px] font-medium">
                <CheckCircle2 size={11} className="mr-1 text-success" />
                Problem resolved
              </Badge>
            </div>
            <BeforeAfterSlider
              before={{ label: "Before — damaged road", src: null }}
              after={{ label: "After — repaired road", src: null }}
              className="aspect-video"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquareQuote size={13} className="text-ai" />
                17 confirmations
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">AI priority</span>
                <PriorityMeter score={91} className="w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="px-1 text-xs text-muted-foreground">
          Illustrative demo — sample photos are placeholders, not real repairs.
        </p>
      </div>
    </div>
  );
}
