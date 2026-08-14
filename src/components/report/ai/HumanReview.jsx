import { useMemo, useState } from "react";
import { ShieldCheck, RotateCcw, Scale } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AnalysisPanel } from "./AnalysisPanel";
import { SEVERITY_LEVELS } from "@/services/report/reportService";
import { listCategories } from "@/services/categories/categoryService";
import { DEPARTMENTS } from "@/services/report/analysisService";

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function HumanReview({ result, override, onApply, reviewerName = "Reviewer" }) {
  const categories = listCategories({ activeOnly: true });
  const [category, setCategory] = useState(result?.classification?.category ?? "Other");
  const [severity, setSeverity] = useState(result?.severity?.label ?? "Medium");
  const [department, setDepartment] = useState(result?.department?.name ?? DEPARTMENTS[0].name);
  const [priority, setPriority] = useState(result?.priority?.score ?? 0);

  const changed = useMemo(() => {
    const changes = [];
    if (category !== result?.classification?.category)
      changes.push(`Category changed from ${result?.classification?.category} → ${category}`);
    if (severity !== result?.severity?.label)
      changes.push(`Severity changed from ${result?.severity?.label} → ${severity}`);
    if (department !== result?.department?.name)
      changes.push(`Department changed from ${result?.department?.name} → ${department}`);
    if (priority !== result?.priority?.score)
      changes.push(`Priority changed from ${result?.priority?.score} → ${priority}`);
    return changes;
  }, [category, severity, department, priority, result]);

  const apply = () => {
    const note = `Human override: ${changed.join(" · ")} by ${reviewerName}.`;
    onApply?.({ note, by: reviewerName, at: new Date().toISOString(), fields: changed });
    toast.success("Override recorded — the team will see your correction.");
  };

  return (
    <AnalysisPanel
      badge="Human Override"
      title="Review AI Assessment"
      dataTestId="ai-human-review"
      icon={ShieldCheck}
      className="lg:col-span-12"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Scale size={12} className="text-ai" />
          Authorities only
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Category" hint={`AI: ${result?.classification?.category}`}>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.key} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Severity" hint={`AI: ${result?.severity?.label}`}>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_LEVELS.map((s) => (
                <SelectItem key={s.key} value={s.label}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Department" hint={`AI: ${result?.department?.name}`}>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.key} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={`Priority — ${priority}/100`} hint={`AI: ${result?.priority?.score}/100`}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ai"
            aria-label="Priority score"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={changed.length === 0}
          onClick={apply}
          data-testid="apply-override"
        >
          <ShieldCheck size={14} />
          Apply override
        </Button>
        {changed.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategory(result?.classification?.category);
              setSeverity(result?.severity?.label);
              setDepartment(result?.department?.name);
              setPriority(result?.priority?.score);
            }}
          >
            <RotateCcw size={13} />
            Reset to AI
          </Button>
        )}
      </div>

      {override && (
        <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5">
          <p className="font-mono text-xs leading-relaxed text-foreground">{override.note}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Recorded {new Date(override.at).toLocaleString()} · visible in the audit trail
          </p>
        </div>
      )}
    </AnalysisPanel>
  );
}
