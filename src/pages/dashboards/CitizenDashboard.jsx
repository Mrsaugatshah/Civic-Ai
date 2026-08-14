import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import {
  LOCATIONS,
  fetchCivicScore,
  fetchNearbyIssues,
  fetchRecentReports,
  fetchCommunityImpact,
  fetchCivicInsight,
  fetchNotifications,
} from "@/services/citizen/citizenService";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { CivicScoreCard } from "@/components/dashboard/CivicScoreCard";
import { NearbyIssues } from "@/components/dashboard/NearbyIssues";
import { CivicMap } from "@/components/dashboard/CivicMap";
import { QuickReportCard } from "@/components/dashboard/QuickReportCard";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { CommunityImpact } from "@/components/dashboard/CommunityImpact";
import { CivicInsight } from "@/components/dashboard/CivicInsight";
import { NotificationsMenu } from "@/components/dashboard/NotificationsMenu";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export function CitizenDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || LOCATIONS[0]);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const [notifOpen, setNotifOpen] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [votingId, setVotingId] = useState(null);

  const score = useAsync(fetchCivicScore, []);
  const issues = useAsync(fetchNearbyIssues, []);
  const reports = useAsync(fetchRecentReports, []);
  const impact = useAsync(fetchCommunityImpact, []);
  const insight = useAsync(fetchCivicInsight, []);
  const notif = useAsync(fetchNotifications, []);

  const notifications = useMemo(() => {
    const items = notif.data?.items ?? [];
    return readAll ? items.map((item) => ({ ...item, unread: false })) : items;
  }, [notif.data, readAll]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleMarkAllRead = () => {
    setReadAll(true);
    toast.success("All notifications marked as read.");
  };

  const handleVerificationVote = (reportId, vote) => {
    setVotingId(null);
    toast.info(`Community voting for ${reportId} is not enabled yet; no ${vote} vote was recorded.`);
  };

  const allLoading = score.loading && issues.loading && reports.loading && impact.loading && insight.loading;

  return (
    <CitizenLayout unreadCount={unreadCount} onOpenNotifications={() => setNotifOpen(true)}>
      {allLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GreetingHeader user={user} location={location} onLocationChange={setLocation} />
          </div>
          <div className="lg:col-span-7">
            <CivicScoreCard {...score} />
          </div>
          <div className="lg:col-span-5">
            <NearbyIssues
              data={issues.data}
              loading={issues.loading}
              error={issues.error}
              onRetry={issues.reload}
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              user={user}
              onVote={handleVerificationVote}
              votingId={votingId}
            />
          </div>
          <div className="lg:col-span-7">
            <CivicMap
              data={issues.data}
              loading={issues.loading}
              error={issues.error}
              onRetry={issues.reload}
              filter={filter}
            />
          </div>
          <div className="lg:col-span-5">
            <QuickReportCard />
          </div>
          <div className="lg:col-span-7">
            <RecentReports {...reports} />
          </div>
          <div className="lg:col-span-7">
            <CommunityImpact {...impact} />
          </div>
          <div className="lg:col-span-5">
            <CivicInsight {...insight} />
          </div>
        </div>
      )}

      <NotificationsMenu
        open={notifOpen}
        onOpenChange={setNotifOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notif.loading}
        error={notif.error}
        onRetry={notif.reload}
        onMarkAllRead={handleMarkAllRead}
      />
    </CitizenLayout>
  );
}
