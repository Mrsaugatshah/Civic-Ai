import { motion } from "framer-motion";
import { FileText, HandHeart, CircleCheck, TrendingUp, Gauge, Sparkles, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "./DashboardSkeleton";
import { SectionError } from "./SectionError";
import { CIVIC_LEVELS, levelForScore } from "@/services/citizen/citizenService";
import { cn } from "@/lib/utils";

const BREAKDOWN_ICONS = {
  reports: FileText,
  helpful: HandHeart,
  confirmed: CircleCheck,
  impact: TrendingUp,
};

const TONE_CLASS = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
  ai: "bg-ai/10 text-ai",
  brand: "bg-brand/10 text-brand",
};

function ScoreRing({ score, max }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const pct = score / max;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={R} fill="none" strokeWidth="10" className="stroke-muted" />
        <motion.circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#score-gradient)"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tracking-tight text-foreground">{score}</span>
        <span className="text-xs font-medium text-muted-foreground">of {max}</span>
      </div>
    </div>
  );
}

export function CivicScoreCard({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Gauge size={16} className="mr-1.5 inline text-primary" />
            Civic Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SectionSkeleton rows={3} />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <SectionError onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  const { score, max, nextLevel, pointsToNext, percentile, breakdown } = data;
  const level = levelForScore(score);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ai/10 text-ai">
            <Gauge size={18} />
          </span>
          <div>
            <CardTitle className="text-base">Civic Score</CardTitle>
            <CardDescription>Community contribution</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="font-normal">
          <Sparkles size={12} className="text-ai" />
          Top {percentile}% in your city
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} max={max} />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-foreground">
                {level.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy size={12} className="text-warning" />
                {pointsToNext} points to {nextLevel}
              </span>
            </div>
            <Progress value={(score / max) * 100} className="mt-3 h-2" />
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              {CIVIC_LEVELS.map((l) => (
                <span key={l.min} className={cn(score >= l.min && "font-semibold text-foreground")}>
                  {l.min}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {breakdown.map((item) => {
              const Icon = BREAKDOWN_ICONS[item.key] ?? TrendingUp;
              return (
                <div key={item.key} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", TONE_CLASS[item.tone])}>
                      <Icon size={13} />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mt-1.5 font-display text-xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
