import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import {
  fetchCivicScore,
  fetchNearbyIssues,
  fetchRecentReports,
  fetchNotifications,
  markNotificationsRead,
} from "@/services/citizen/citizenService";
import { confirmResolution } from "@/services/reports/reportsService";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { CitizenSummary } from "@/components/dashboard/CitizenSummary";
import { NearbyIssues } from "@/components/dashboard/NearbyIssues";
import { QuickReportCard } from "@/components/dashboard/QuickReportCard";
import { RecentReports } from "@/components/dashboard/RecentReports";
import { NotificationsMenu } from "@/components/dashboard/NotificationsMenu";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export function CitizenDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifOpen, setNotifOpen] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [votingId, setVotingId] = useState(null);

  useEffect(() => {
    if (searchParams.get("notifications") === "1") {
      setNotifOpen(true);
      searchParams.delete("notifications");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const score = useAsync(fetchCivicScore, []);
  const issues = useAsync(fetchNearbyIssues, []);
  const reports = useAsync(fetchRecentReports, []);
  const notif = useAsync(fetchNotifications, []);

  const notifications = useMemo(() => {
    const items = notif.data?.items ?? [];
    return readAll ? items.map((item) => ({ ...item, unread: false })) : items;
  }, [notif.data, readAll]);
  const unreadCount = notifications.filter((item) => item.unread).length;
  const allLoading = score.loading && issues.loading && reports.loading;

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead({ all: true });
      setReadAll(true);
      await notif.reload();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(error.message || "Couldn't update notifications.");
    }
  };

  const handleVerificationVote = async (reportId, vote) => {
    setVotingId(reportId);
    try {
      await confirmResolution(reportId, vote === "legit" ? "yes" : "no");
      toast.success(vote === "legit" ? "Issue confirmed." : "Thanks — your review was recorded.");
      await issues.reload();
    } catch (error) {
      toast.error(error.message || "We couldn't record your review.");
    } finally {
      setVotingId(null);
    }
  };

  return (
    <CitizenLayout unreadCount={unreadCount} onOpenNotifications={() => setNotifOpen(true)}>
      {allLoading ? <DashboardSkeleton /> : <div className="space-y-6">
        <GreetingHeader user={user} />
        <QuickReportCard />
        <CitizenSummary {...score} />
        <NearbyIssues data={issues.data} loading={issues.loading} error={issues.error} onRetry={issues.reload} user={user} onVote={handleVerificationVote} votingId={votingId} />
        <RecentReports {...reports} />
        <div className="flex justify-center pt-1"><Link to="/map" className="text-sm font-medium text-primary hover:underline">View the community map <span aria-hidden>→</span></Link></div>
      </div>}
      <NotificationsMenu open={notifOpen} onOpenChange={setNotifOpen} notifications={notifications} unreadCount={unreadCount} loading={notif.loading} error={notif.error} onRetry={notif.reload} onMarkAllRead={handleMarkAllRead} />
    </CitizenLayout>
  );
}
