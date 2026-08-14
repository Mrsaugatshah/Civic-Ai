import { GitBranch, CornerUpRight } from "lucide-react";

import { relatedReports, similarReports, CATEGORY_LABEL } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";

export function RelatedIssues({ issue, onSelect, className }) {
  const related = relatedReports(issue).filter((i) => i.status !== "resolved" && i.status !== "closed");
  const similar = similarReports(issue).filter((i) => i.id !== related[0]?.id);

  const rows = [];
  related.forEach((r) => rows.push({ ...r, kind: "related" }));
  similar.filter((s) => !rows.some((r) => r.id === s.id)).forEach((s) => rows.push({ ...s, kind: "similar" }));
  const visible = rows.slice(0, 3);

  if (visible.length === 0) {
    return (
      <div className={className}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related reports</p>
        <p className="text-xs text-muted-foreground">No other reports nearby — this may be the only one.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <GitBranch size={11} className="mr-1 inline" />
        Related reports nearby
      </p>
      <ul className="space-y-1.5">
        {visible.map((row) => {
          const Icon = categoryIcon(row.category);
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelect?.(row)}
                className="flex w-full items-center gap-2 rounded-md border bg-background p-2 text-left transition-colors hover:bg-accent"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-foreground">
                  <Icon size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-foreground">{row.title}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {CATEGORY_LABEL[row.category] ?? "Issue"} · {row.km.toFixed(2)} km away
                  </span>
                </span>
                <CornerUpRight size={13} className="shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
