import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import { getDepartmentDashboard } from "@/services/authority/authorityService";

import { AuthorityLayout } from "@/components/authority/AuthorityLayout";
import { DepartmentOverview } from "@/components/authority/DepartmentOverview";
import { AssignedTasks } from "@/components/authority/AssignedTasks";

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const department = user?.department || "Your Department";

  const dashboard = useAsync(() => getDepartmentDashboard(department), [department]);

  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (!target) return undefined;
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openTask = (task) => navigate(`/authority/issues/${task.id}`);

  return (
    <AuthorityLayout>
      <div className="space-y-10">
        <DepartmentOverview data={dashboard.data?.stats} loading={dashboard.loading} error={dashboard.error} onRetry={dashboard.reload} />
        <AssignedTasks
          data={dashboard.data?.tasks}
          loading={dashboard.loading}
          error={dashboard.error}
          onRetry={dashboard.reload}
          onOpenTask={openTask}
        />
      </div>
    </AuthorityLayout>
  );
}
