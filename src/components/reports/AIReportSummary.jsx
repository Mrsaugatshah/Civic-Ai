import { AlertTriangle, Clock3, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function Field({ label, value }) { return <div><dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-0.5 text-sm font-medium text-foreground">{value ?? "—"}</dd></div>; }
const title = (value) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";

export function AIReportSummary({ report }) {
  const status = report.aiStatus || "pending";
  if (["pending", "processing"].includes(status)) return <section className="rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow"><div className="flex items-center gap-2 font-semibold"><Clock3 size={16} className="text-ai" />{status === "processing" ? "AI is analyzing your report…" : "Preparing AI analysis…"}</div><p className="mt-2 text-sm text-muted-foreground">Your report is already stored safely. This page will refresh when the advisory analysis is ready.</p></section>;
  if (status === "failed") return <section className="rounded-lg border border-warning/30 bg-warning/5 p-5"><div className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} className="text-warning-foreground" />AI analysis is temporarily unavailable</div><p className="mt-2 text-sm text-muted-foreground">Your report remains stored and available to authority staff. An administrator can retry the analysis.</p></section>;
  return (
    <section className="overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground"><Sparkles size={12} className="text-ai" />AI Analysis · Advisory</span>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{report.aiSummary}</p>
      {report.aiReasoningSummary && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{report.aiReasoningSummary}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="AI category" value={title(report.aiCategory)} />
        <Field label="AI severity" value={title(report.aiSeverity)} />
        <Field label="AI priority" value={report.aiPriorityLevel ? title(report.aiPriorityLevel) : null} />
        <Field label="AI department" value={report.aiDepartment} />
        <Field label="AI confidence" value={typeof report.aiConfidence === "number" ? `${Math.round(report.aiConfidence * 100)}%` : null} />
        <Field label="Safety risk" value={title(report.aiSafetyRisk)} />
        <Field label="Language" value={report.aiDetectedLanguage} />
        <Field label="Analyzed" value={report.aiAnalyzedAt ? new Date(report.aiAnalyzedAt).toLocaleString() : null} />
      </dl>
      <Separator className="my-4" />
      <p className="text-xs text-muted-foreground">AI recommendations are not official verification or an emergency determination. Authorized staff make final decisions.</p>
    </section>
  );
}
