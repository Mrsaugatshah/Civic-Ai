import { useMemo, useState } from "react";
import { Search, ArrowRight, Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { priorityTone } from "@/components/civic/PriorityMeter";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "high", label: "High Priority" },
  { key: "in_progress", label: "In Progress" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const PENDING_STATUSES = new Set(["reported", "under_review", "assigned"]);
const COMPLETED_STATUSES = new Set(["resolved", "closed"]);

function matchesFilter(task, filter) {
  if (filter === "all") return true;
  if (filter === "high") return task.priority >= 80;
  if (filter === "in_progress") return task.status === "in_progress";
  if (filter === "pending") return PENDING_STATUSES.has(task.status);
  if (filter === "completed") return COMPLETED_STATUSES.has(task.status);
  return true;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AssignedTasks({ data, loading, error, onRetry, onOpenTask }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data
      .filter((t) => matchesFilter(t, filter))
      .filter((t) => severity === "all" || String(t.severity || "").toLowerCase() === severity)
      .filter((t) =>
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
  }, [data, filter, query, severity]);

  return (
    <section id="tasks" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">Assigned Tasks</h2>
        <span className="text-sm text-muted-foreground">
          {data ? `${filtered.length} of ${data.length}` : ""}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[14rem]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by report ID, issue, location, category…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity" className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"><option value="all">All Severities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Loading assigned tasks…</p>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">Couldn't load your department's tasks.</p>
            <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox size={22} />
            </span>
            <p className="text-sm font-medium text-foreground">
              {data?.length ? "No tasks match your filters" : "No tasks are currently assigned to your department."}
            </p>
            <p className="text-xs text-muted-foreground">
              {data?.length ? "Try a different filter or search term." : "New assignments will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_7rem_8rem_9rem_7rem_6rem] gap-3 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Issue</span>
              <span>Report ID</span>
              <span>Severity</span>
              <span>Priority</span>
              <span>Status</span>
              <span className="text-right">Task</span>
            </div>
            <div className="divide-y">
              {filtered.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onOpenTask(task)}
                  className="grid w-full grid-cols-[1fr_7rem_8rem_9rem_7rem_6rem] items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent"
                >
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{task.location} · {fmtDate(task.assignedAt)}</p>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{task.id}</span>
                  <SeverityBadge severity={task.severity} className="w-fit px-2 py-0.5 text-[11px]" />
                  <span className={cn("font-display text-sm font-semibold", priorityTone(task.priority))}>
                    {task.priority}
                    <span className="text-xs font-normal text-muted-foreground">/100</span>
                  </span>
                  <StatusBadge status={task.status} className="w-fit px-2 py-0.5 text-[11px]" />
                  <span className="flex items-center justify-end gap-1 text-xs font-medium text-primary">
                    View Task <ArrowRight size={13} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="divide-y md:hidden">
            {filtered.map((task) => (
              <button
                key={task.id}
                onClick={() => onOpenTask(task)}
                className="flex w-full flex-col gap-2 px-4 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{task.location}</p>
                  </span>
                  <span className={cn("shrink-0 font-display text-sm font-semibold", priorityTone(task.priority))}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={task.severity} className="px-2 py-0.5 text-[11px]" />
                  <StatusBadge status={task.status} className="px-2 py-0.5 text-[11px]" />
                  <span className="text-[11px] text-muted-foreground">{task.id}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  View Task <ArrowRight size={13} />
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
