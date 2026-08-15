import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Landing } from "@/pages/Landing";

import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";

// Route-level code splitting: heavier pages (map, dashboards, charts, report
// flow) load on demand so the initial landing + auth chunk stays small.
const DesignSystem = lazy(() => import("@/pages/DesignSystem").then((m) => ({ default: m.DesignSystem })));
const CitizenDashboard = lazy(() => import("@/pages/dashboards/CitizenDashboard").then((m) => ({ default: m.CitizenDashboard })));
const AuthorityDashboard = lazy(() => import("@/pages/dashboards/AuthorityDashboard").then((m) => ({ default: m.AuthorityDashboard })));
const AdminDashboard = lazy(() => import("@/pages/dashboards/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminIssueDetail = lazy(() => import("@/pages/admin/IssueDetail").then((m) => ({ default: m.AdminIssueDetail })));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const AuthorityTaskDetail = lazy(() => import("@/pages/authority/TaskDetail").then((m) => ({ default: m.AuthorityTaskDetail })));
const Report = lazy(() => import("@/pages/Report").then((m) => ({ default: m.Report })));
const CityMapPage = lazy(() => import("@/pages/CityMap").then((m) => ({ default: m.CityMapPage })));
const MyReports = lazy(() => import("@/pages/MyReports").then((m) => ({ default: m.MyReports })));
const ReportDetails = lazy(() => import("@/pages/ReportDetails").then((m) => ({ default: m.ReportDetails })));

import { RoleGuard } from "@/routes/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { roleHome } from "@/utils/roles";

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={22} className="animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}

function HomeRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <RouteFallback />;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;
  return <Landing />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Alias for the Part 11 `/department` route — keeps the canonical URL
// `/authority/issues/:id` while accepting the spec's `/department/issues/:id`.
function DepartmentIssueRedirect() {
  const { id } = useParams();
  return <Navigate to={`/authority/issues/${id}`} replace />;
}

function PageTransition() {
  const location = useLocation();
  const path = location.pathname;

  // Guarded (auth-required) pages render outside the animated tree so that,
  // on logout, the exiting page unmounts immediately. Otherwise AnimatePresence
  // keeps the old RoleGuard mounted during its exit animation, and it redirects
  // to /login after the session clears — racing the logout navigate("/").
  const animated =
    !path.startsWith("/dashboard") &&
    !path.startsWith("/report") &&
    !path.startsWith("/authority") &&
    !path.startsWith("/department") &&
    !path.startsWith("/admin");

  if (!animated) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>{routeElements}</Routes>
      </Suspense>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={path}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes>{routeElements}</Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const routeElements = (
  <>
    <Route path="/" element={<HomeRoute />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/design-system" element={<DesignSystem />} />
    <Route
      path="/report"
      element={
        <RoleGuard allowed={["citizen"]}>
          <Report />
        </RoleGuard>
      }
    />
    <Route path="/map" element={<CityMapPage />} />

    <Route
      path="/dashboard"
      element={
        <RoleGuard allowed={["citizen"]}>
          <CitizenDashboard />
        </RoleGuard>
      }
    />
    <Route
      path="/reports"
      element={
        <RoleGuard allowed={["citizen"]}>
          <MyReports />
        </RoleGuard>
      }
    />
    <Route
      path="/issues"
      element={
        <RoleGuard allowed={["citizen"]}>
          <MyReports />
        </RoleGuard>
      }
    />
    <Route
      path="/reports/:id"
      element={
        <RoleGuard allowed={["citizen", "authority", "admin"]}>
          <ReportDetails />
        </RoleGuard>
      }
    />
    <Route
      path="/authority/dashboard"
      element={
        <RoleGuard allowed={["authority"]}>
          <AuthorityDashboard />
        </RoleGuard>
      }
    />
    <Route
      path="/authority/issues/:id"
      element={
        <RoleGuard allowed={["authority"]}>
          <AuthorityTaskDetail />
        </RoleGuard>
      }
    />
    <Route
      path="/department"
      element={
        <RoleGuard allowed={["authority"]}>
          <Navigate to="/authority/dashboard" replace />
        </RoleGuard>
      }
    />
    <Route
      path="/department/issues/:id"
      element={
        <RoleGuard allowed={["authority"]}>
          <DepartmentIssueRedirect />
        </RoleGuard>
      }
    />
    <Route
      path="/admin"
      element={
        <RoleGuard allowed={["admin"]}>
          <Navigate to="/admin/dashboard" replace />
        </RoleGuard>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <RoleGuard allowed={["admin"]}>
          <AdminDashboard />
        </RoleGuard>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <RoleGuard allowed={["admin"]}>
          <AnalyticsPage />
        </RoleGuard>
      }
    />
    <Route
      path="/admin/issues/:id"
      element={
        <RoleGuard allowed={["admin"]}>
          <AdminIssueDetail />
        </RoleGuard>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </>
);

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <PageTransition />
    </>
  );
}
