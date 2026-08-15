import { CheckCircle2, CircleDot, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "./SectionError";

const ITEMS = [
  ["My Reports", "reports", FileText],
  ["Active", "active", CircleDot],
  ["Completed", "completed", CheckCircle2],
];

export function CitizenSummary({ data, loading, error, onRetry }) {
  if (loading) return <div className="grid gap-3 sm:grid-cols-3">{ITEMS.map(([label]) => <Card key={label}><CardContent className="space-y-3 p-4"><Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-12" /></CardContent></Card>)}</div>;
  if (error || !data) return <Card><CardContent className="p-5"><SectionError title="Couldn't load your report summary" onRetry={onRetry} /></CardContent></Card>;

  const values = Object.fromEntries((data.breakdown || []).map((item) => [item.key, Number(item.value) || 0]));
  const completed = values.confirmed ?? 0;
  const total = values.reports ?? 0;
  const active = Math.max(0, total - completed);
  const resolved = { reports: total, active, completed };
  return <section aria-label="Your report summary" className="grid gap-3 sm:grid-cols-3">{ITEMS.map(([label, key, Icon]) => <Card key={label} className="shadow-soft"><CardContent className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold leading-none text-foreground">{resolved[key]}</p></div></CardContent></Card>)}</section>;
}
