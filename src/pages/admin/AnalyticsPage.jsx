import { useCallback, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Analytics } from "@/components/admin/Analytics";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics } from "@/services/admin/adminService";

export function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const analytics = useAsync(useCallback(() => getAnalytics(range), [range]), [range]);
  return <AdminLayout initialActive="analytics"><div className="space-y-6"><header><h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Reports, categories, statuses, and resolution performance.</p></header><Analytics data={analytics.data} loading={analytics.loading} error={analytics.error} onRetry={analytics.reload} range={range} onRangeChange={setRange} /></div></AdminLayout>;
}
