import { HelpCircle } from "lucide-react";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { Card, CardContent } from "@/components/ui/card";

const topics = [["How to report an issue", "Choose Report an Issue, add a description, photo, and location, then submit the report."], ["Community verification", "Registered citizens can Agree or Disagree with public reports. You cannot vote on your own report."], ["How to track a report", "Use My Reports to follow citizen reports, or use the private tracking details provided after a guest submission."], ["What statuses mean", "Received means the report was submitted, Under Review means it is being assessed, Work In Progress means work has started, and Completed means the issue was resolved."]];

export function Help() {
  return <CitizenLayout><div className="mx-auto max-w-3xl space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CivicAI support</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Help</h1><p className="mt-1 text-sm text-muted-foreground">A quick guide to CivicAI.</p></header><div className="grid gap-3 sm:grid-cols-2">{topics.map(([title, body]) => <Card key={title}><CardContent className="p-5"><HelpCircle size={18} className="text-primary" /><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></CardContent></Card>)}</div></div></CitizenLayout>;
}
