import { Sparkles, Building2, Link2, ArrowRight } from "lucide-react";

import { AnalysisPanel } from "./AnalysisPanel";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { AnalysisStatesChip } from "./AnalysisStatesChip";
import { reportCategoryMeta, SEVERITY_META } from "../reportMeta";
import { priorityLevelForScore } from "@/services/report/analysisService";
import { cn } from "@/lib/utils";

function pickCategory(analysis) {
  if (analysis.classification) return analysis.classification.categoryKey ?? "other";
  return analysis.category ?? "other";
}

function pickSeverity(analysis) {
  if (analysis.severity) return analysis.severity.level ?? analysis.severity;
  return analysis.severity ?? "medium";
}

function pickPriority(analysis) {
  if (typeof analysis.priority === "number") return analysis.priority;
  if (analysis.priority?.score != null) return analysis.priority.score;
  return analysis.priorityScore ?? 0;
}

/**
 * Shared AI analysis summary card — one consistent rendering of the
 * analysis contract for citizen step 4, admin issue details, priority
 * queue rows and department tasks. Handles both the structured contract
 * (analysisService.runAnalysis) and the flat citizen shape
 * (reportService.analyzeReport).
 */
export function AIAnalysisCard({ analysis, onOpenReport, className }) {
  const category = pickCategory(analysis);
  const catMeta = reportCategoryMeta(category);
  const CatIcon = catMeta.icon;

  const sevKey = pickSeverity(analysis);
  const sevMeta = SEVERITY_META[sevKey] ?? SEVERITY_META.medium;

  const priorityScore = pickPriority(analysis);
  const prioMeta = priorityLevelForScore(priorityScore);

  const confidence =
    analysis.classification?.confidence ?? analysis.aiConfidence?.classification;

  const state = analysis.state ?? "complete";
  const department = analysis.department?.name ?? analysis.department;
  const departmentConfidence =
    analysis.department?.confidence ?? analysis.aiConfidence?.department;
  const duplicate = analysis.duplicate?.detected ?? analysis.duplicate;
  const matchedId = analysis.duplicate?.matchedReportId ?? analysis.duplicate?.matched?.reportId;
  const explanation = analysis.explanation?.points ?? (analysis.explanation ? [{ detail: analysis.explanation }] : []);

  return (
    <AnalysisPanel
      dataTestId="ai-analysis-card"
      className={className}
      badge="CivicAI analysis"
      action={<AnalysisStatesChip state={state} />}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
              catMeta.tone
            )}
          >
            <CatIcon size={14} />
            {analysis.classification?.category ?? analysis.categoryLabel ?? catMeta.label}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: `${sevMeta.dot}1A`, color: sevMeta.dot }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sevMeta.dot }} />
            {analysis.severity?.label ?? sevMeta.label} severity
          </span>
        </div>

        {typeof confidence === "number" && <ConfidenceIndicator confidence={confidence} />}

        <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 px-3 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Priority</span>
          <span className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tabular-nums text-foreground">
              {priorityScore}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", prioMeta.chip)}>
              {prioMeta.label}
            </span>
          </span>
        </div>

        {department && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Building2 size={14} className="text-ai" />
              Department
            </span>
            <span className="text-right">
              <span className="block font-medium text-foreground">{department}</span>
              {typeof departmentConfidence === "number" && (
                <span className="text-xs text-muted-foreground">{departmentConfidence}% routed</span>
              )}
            </span>
          </div>
        )}

        {duplicate && (
          <button
            type="button"
            onClick={() => onOpenReport?.(matchedId)}
            className="flex w-full items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning/5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-warning/10"
            data-testid="ai-duplicate"
          >
            <span className="flex items-center gap-2 font-medium text-warning-foreground">
              <Link2 size={14} />
              Duplicate of {matchedId ?? "an earlier report"}
            </span>
            <ArrowRight size={14} className="text-warning-foreground" />
          </button>
        )}

        {explanation.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why
            </p>
            <ul className="space-y-1.5">
              {explanation.slice(0, 3).map((point, i) => (
                <li key={point.key ?? i} className="flex gap-2 text-sm text-muted-foreground">
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-ai" />
                  {point.detail ?? point.label ?? point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AnalysisPanel>
  );
}
