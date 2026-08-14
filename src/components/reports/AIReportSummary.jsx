import { Sparkles } from "lucide-react";

import { Separator } from "@/components/ui/separator";

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function AIReportSummary({ report }) {
  return (
    <section className="overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
          <Sparkles size={12} className="text-ai" aria-hidden />
          CivicAI Summary
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">{report.aiSummary}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Category" value={report.categoryLabel} />
        <Field
          label="Severity"
          value={report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
        />
        <Field label="Priority" value={`${report.priority} / 100`} />
        <Field label="Department" value={report.department} />
      </dl>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Estimated by CivicAI from your description and evidence.
        </p>
      </div>
    </section>
  );
}
