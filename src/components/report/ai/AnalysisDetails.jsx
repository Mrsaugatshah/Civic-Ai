import { ChevronDown, FileSearch } from "lucide-react";

import { AnalysisPanel } from "./AnalysisPanel";
import { AnalysisStatesChip } from "./AnalysisStatesChip";

function Row({ label, value }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-1.5 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </li>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-lg border border-border bg-background/80 p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ai-foreground">{title}</h4>
      <ul className="mt-1">{children}</ul>
    </section>
  );
}

export function AnalysisDetails({ result, override }) {
  const sec = result?.classification;
  const sev = result?.severity;
  const dup = result?.duplicate;
  const dep = result?.department;
  const pri = result?.priority;

  return (
    <AnalysisPanel
      badge="Analysis Details"
      title="Technical breakdown"
      dataTestId="ai-details"
      icon={FileSearch}
      className="lg:col-span-12"
      action={<AnalysisStatesChip state={result?.state} />}
    >
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-ai/20 bg-background/70 px-3 py-2.5 text-xs font-medium text-ai-foreground [&::-webkit-details-marker]:hidden">
          <span>Expand evidence, classification, severity, duplicate, routing and priority</span>
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailSection title="Evidence">
            <Row label="Items reviewed" value={result?.evidence?.items?.length ?? 0} />
            <Row label="Summary" value={result?.evidence?.summary ?? "—"} />
          </DetailSection>
          <DetailSection title="Classification">
            <Row label="Category" value={sec?.category ?? "—"} />
            <Row label="Subcategory" value={sec?.subcategory ?? "—"} />
            <Row label="Confidence" value={`${sec?.confidence}%`} />
          </DetailSection>
          <DetailSection title="Severity">
            <Row label="Level" value={sev?.label ?? "—"} />
            <Row label="Confidence" value={`${sev?.confidence}%`} />
            <Row
              label="Factors"
              value={(sev?.factors ?? []).map((f) => `${f.label} ${f.score}%`).join(" · ")}
            />
          </DetailSection>
          <DetailSection title="Duplicate">
            <Row label="Detected" value={dup?.detected ? "Yes" : "No"} />
            {dup?.detected && (
              <>
                <Row label="Similarity" value={`${dup.similarity}%`} />
                <Row label="Matched report" value={dup.matchedReportId} />
              </>
            )}
          </DetailSection>
          <DetailSection title="Routing">
            <Row label="Department" value={dep?.name ?? "—"} />
            <Row label="Confidence" value={`${dep?.confidence}%`} />
          </DetailSection>
          <DetailSection title="Priority">
            <Row label="Score" value={`${pri?.score}/100`} />
            <Row label="Level" value={pri?.level ?? "—"} />
          </DetailSection>
        </div>

        {override && (
          <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5">
            <p className="text-xs font-semibold text-warning-foreground">Human override recorded</p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-foreground">
              {override.note}
            </p>
            {override.by && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                by {override.by}
                {override.at ? ` · ${new Date(override.at).toLocaleString()}` : ""}
              </p>
            )}
          </div>
        )}
      </details>
    </AnalysisPanel>
  );
}
