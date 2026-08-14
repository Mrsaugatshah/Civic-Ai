import { MapPin, CheckCircle2, Wrench, UserRound } from "lucide-react";

const ACTIVITY = [
  { icon: MapPin, name: "Asha reported a pothole", time: "2 minutes ago", tone: "bg-warning/10 text-warning-foreground" },
  { icon: UserRound, name: "Ravi confirmed a streetlight issue", time: "8 minutes ago", tone: "bg-info/10 text-info-foreground" },
  { icon: Wrench, name: "Public Works resolved a water leak", time: "24 minutes ago", tone: "bg-success/10 text-success-foreground" },
  { icon: CheckCircle2, name: "Community confirmed a road repair", time: "42 minutes ago", tone: "bg-primary/10 text-primary-foreground" },
];

export function CommunityPulse() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-2.5">
        {ACTIVITY.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-lg border bg-background p-3.5 transition-colors hover:border-primary/25"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon size={16} />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.name}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Sample activity from the demo city — every action here is a real workflow in CivicAI.
      </p>
    </div>
  );
}
