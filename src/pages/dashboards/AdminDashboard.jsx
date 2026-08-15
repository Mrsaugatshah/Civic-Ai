import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAsync } from "@/hooks/useAsync";
import {
  getCityOverview,
  getCriticalIssues,
  getPriorityQueue,
  getAIInsights,
  getAnalytics,
} from "@/services/admin/adminService";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { CityOverview } from "@/components/admin/CityOverview";
import { CriticalIssues } from "@/components/admin/CriticalIssues";
import { PriorityQueue } from "@/components/admin/PriorityQueue";
import { AIInsights } from "@/components/admin/AIInsights";
import { Analytics } from "@/components/admin/Analytics";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { Categories } from "@/components/admin/Categories";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("30d");

  const overview = useAsync(getCityOverview, []);
  const critical = useAsync(getCriticalIssues, []);
  const queue = useAsync(getPriorityQueue, []);
  const insights = useAsync(getAIInsights, []);
  const analytics = useAsync(useCallback(() => getAnalytics(range), [range]), [range]);

  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (!target) return undefined;
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openIssue = (issue) => navigate(`/admin/issues/${issue.id}`);

  return (
    <AdminLayout>
      <div className="space-y-10">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              City Command Center
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor civic issues, priorities, and city-wide progress.
            </p>
          </div>
          <AdminSearch onOpenIssue={openIssue} className="w-full lg:w-96" />
        </header>

        <CityOverview
          data={overview.data}
          loading={overview.loading}
          error={overview.error}
          onRetry={overview.reload}
        />
        <CriticalIssues
          data={critical.data}
          loading={critical.loading}
          error={critical.error}
          onRetry={critical.reload}
          onOpenIssue={openIssue}
        />
        <PriorityQueue
          data={queue.data}
          loading={queue.loading}
          error={queue.error}
          onRetry={queue.reload}
          onOpenIssue={openIssue}
        />
        <Categories />
        <AIInsights data={insights.data} loading={insights.loading} error={insights.error} onRetry={insights.reload} />
        <Analytics
          data={analytics.data}
          loading={analytics.loading}
          error={analytics.error}
          onRetry={analytics.reload}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </AdminLayout>
  );
}
