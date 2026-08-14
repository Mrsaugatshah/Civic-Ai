import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/dashboard/SectionError";

const COLORS = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#0EA5E9",
  ai: "#6366F1",
  muted: "#94A3B8",
};

const SEVERITY_COLOR = { critical: COLORS.error, high: COLORS.warning, medium: COLORS.info, low: COLORS.success };

const RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "1y", label: "1y" },
];

function tooltipStyle() {
  return {
    borderRadius: 8,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    fontSize: 12,
  };
}

export function Analytics({ data, loading, error, onRetry, range, onRangeChange }) {
  return (
    <section id="analytics" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-foreground">Analytics</h2>
        <Tabs value={range} onValueChange={onRangeChange}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.key} value={r.key}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {error ? (
        <SectionError title="Couldn't load analytics" onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reports Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-64 pt-0">
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
              <CardTitle className="text-base">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex h-64 items-center gap-4 pt-0">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={data.bySeverity} dataKey="count" nameKey="severity" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {data.bySeverity.map((d) => (
                      <Cell key={d.severity} fill={SEVERITY_COLOR[d.severity]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {data.bySeverity.map((d) => (
                  <div key={d.severity} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: SEVERITY_COLOR[d.severity] }} />
                    <span className="capitalize text-muted-foreground">{d.severity}</span>
                    <span className="font-medium text-foreground">{d.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <Users size={14} /> Community Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-display text-2xl font-bold text-success">{data.community.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmed resolved</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-warning">{data.community.awaiting}</p>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-error">{data.community.reportedNotResolved}</p>
                  <p className="text-xs text-muted-foreground">Reported not resolved</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-ai">{data.community.confirmationRate}%</p>
                  <p className="text-xs text-muted-foreground">Confirmation rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
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
                      <th className="px-2 py-2 text-right font-medium">Resolution Rate</th>
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
              <p className="mt-3 text-xs text-muted-foreground">
                Based on {data.departments.reduce((sum, d) => sum + d.active + d.resolved, 0)} reports across{" "}
                {data.departments.length} departments.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
