import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  BarChart3, MapPin, AlertTriangle, CheckCircle2, FilterX, ArrowRight, Sparkles,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/dashboard/SectionError";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics, ANALYTICS_FILTER_OPTIONS } from "@/services/admin/adminService";

const COLORS = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#0EA5E9",
  ai: "#6366F1",
  muted: "#94A3B8",
};

const PRIORITY_COLOR = { critical: COLORS.error, high: COLORS.warning, medium: COLORS.info, low: COLORS.success };

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "1y", label: "1y" },
];

const FILTER_KEYS = ["categories", "severities", "priorities", "statuses", "departments", "wards"];
const FILTER_LABEL = {
  categories: "Category",
  severities: "Severity",
  priorities: "Priority",
  statuses: "Status",
  departments: "Department",
  wards: "Ward",
};
const EMPTY_FILTERS = { categories: [], severities: [], priorities: [], statuses: [], departments: [], wards: [] };

const INSIGHT_ICON = {
  category: BarChart3,
  critical: AlertTriangle,
  hotspot: MapPin,
  resolution: CheckCircle2,
};

function tooltipStyle() {
  return {
    borderRadius: 8,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    fontSize: 12,
  };
}

function FilterSelect({ label, value, onValueChange, options }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value || "all"} onValueChange={(v) => onValueChange(v === "all" ? "" : v)}>
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function EmptyState({ onClear }) {
  return (
    <Card className="py-14 text-center">
      <CardContent>
        <BarChart3 size={28} className="mx-auto text-muted-foreground" />
        <p className="mt-3 font-medium text-foreground">No analytics available for this period.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try widening the date range or clearing the active filters.</p>
        <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={onClear}>
          <FilterX size={14} /> Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const analytics = useAsync(
    useCallback(() => getAnalytics(range, filters), [range, filters]),
    [range, filters]
  );

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value ? [value] : [] }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const activeFilters = useMemo(() => {
    const list = [];
    for (const key of FILTER_KEYS) {
      const value = filters[key]?.[0];
      if (!value) continue;
      const opt = ANALYTICS_FILTER_OPTIONS[key].find((o) => o.value === value);
      list.push({ key, label: opt?.label ?? value });
    }
    return list;
  }, [filters]);

  const data = analytics.data;

  return (
    <AdminLayout initialActive="analytics">
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">City Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              City-wide trends, hotspots, and performance across every active report.
            </p>
          </div>
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              {RANGES.map((r) => (
                <TabsTrigger key={r.key} value={r.key}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {FILTER_KEYS.map((key) => (
                <FilterSelect
                  key={key}
                  label={FILTER_LABEL[key]}
                  value={filters[key][0] ?? ""}
                  onValueChange={(v) => setFilter(key, v)}
                  options={ANALYTICS_FILTER_OPTIONS[key]}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {activeFilters.length === 0 ? (
                <span className="text-xs text-muted-foreground">None — showing all reports.</span>
              ) : (
                activeFilters.map((f) => (
                  <Badge key={f.key} variant="secondary" className="gap-1">
                    {f.label}
                    <button
                      type="button"
                      onClick={() => setFilter(f.key, "")}
                      aria-label={`Remove ${f.label} filter`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      &times;
                    </button>
                  </Badge>
                ))
              )}
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={clearFilters}>
                  <FilterX size={13} /> Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {analytics.error ? (
          <SectionError title="Couldn't load analytics" onRetry={analytics.reload} />
        ) : analytics.loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : data.total === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Issue Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-72 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={COLORS.muted} />
                    <YAxis tick={{ fontSize: 11 }} stroke={COLORS.muted} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Line type="monotone" dataKey="submitted" stroke={COLORS.primary} strokeWidth={2} dot={false} name="Submitted" />
                    <Line type="monotone" dataKey="resolved" stroke={COLORS.success} strokeWidth={2} dot={false} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Issues by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byCategory} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke={COLORS.muted} interval={0} angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} stroke={COLORS.muted} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Bar dataKey="count" fill={COLORS.ai} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <Sparkles size={14} /> AI Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priorityDistribution} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="level" tick={{ fontSize: 11 }} stroke={COLORS.muted} />
                    <YAxis tick={{ fontSize: 11 }} stroke={COLORS.muted} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.priorityDistribution.map((d) => (
                        <Cell key={d.level} fill={PRIORITY_COLOR[d.level]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <MapPin size={14} /> Civic Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {data.hotspots.map((h) => (
                    <div key={h.ward} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{h.ward}</p>
                        <SeverityBadge severity={h.levelKey} className="px-2 py-0.5 text-[10px]" />
                      </div>
                      <p className="mt-3 font-display text-2xl font-bold text-foreground">{h.count}</p>
                      <p className="text-xs text-muted-foreground">{h.topCategory ?? "Mixed"} reports</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/map"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View hotspot clusters on the city map <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <CheckCircle2 size={14} /> Resolution Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-display text-2xl font-bold text-success">{data.resolution.resolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-warning">{data.resolution.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-ai">{data.resolution.resolutionRate}%</p>
                    <p className="text-xs text-muted-foreground">Resolution rate</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">{data.resolution.avgResolutionDays}d</p>
                    <p className="text-xs text-muted-foreground">Avg. resolution time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Department Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-2 py-2 text-left font-medium">Department</th>
                        <th className="px-2 py-2 text-right font-medium">Active</th>
                        <th className="px-2 py-2 text-right font-medium">Resolved</th>
                        <th className="px-2 py-2 text-right font-medium">Avg. Time</th>
                        <th className="px-2 py-2 text-right font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.departments.map((d) => (
                        <tr key={d.department}>
                          <td className="px-2 py-2.5 text-foreground">{d.department}</td>
                          <td className="px-2 py-2.5 text-right text-muted-foreground">{d.active}</td>
                          <td className="px-2 py-2.5 text-right text-muted-foreground">{d.resolved}</td>
                          <td className="px-2 py-2.5 text-right text-muted-foreground">{d.avgResolutionDays}d</td>
                          <td className="px-2 py-2.5 text-right font-medium text-foreground">{d.resolutionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <BarChart3 size={14} /> Analytics Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.insights.map((insight) => {
                    const Icon = INSIGHT_ICON[insight.icon] ?? Sparkles;
                    return (
                      <div key={insight.id} className="flex gap-3 rounded-lg border p-3">
                        <span className="mt-0.5 shrink-0 rounded-full bg-ai/10 p-1.5 text-ai-foreground">
                          <Icon size={14} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{insight.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{insight.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
