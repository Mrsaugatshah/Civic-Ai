import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, LayoutDashboard } from "lucide-react";

import { useAuth, isSignedOut } from "@/contexts/AuthContext";
import { roleHome, roleLabel } from "@/utils/roles";
import { Button } from "@/components/ui/button";
import { FullScreenLoader } from "./ProtectedRoute";

export function AccessDenied() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-light text-error-foreground">
        <ShieldAlert size={26} />
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Access restricted
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have permission to access this area. Your account is
          registered as a{" "}
          <span className="font-semibold text-foreground">{roleLabel(user?.role)}</span>.
        </p>
      </div>
      <Button onClick={() => navigate(roleHome(user?.role))}>
        <LayoutDashboard size={15} />
        Return to Dashboard
      </Button>
    </div>
  );
}

export function RoleGuard({ allowed, children }) {
  const { user, isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) {
    // During logout the guard may still be mounted when the session clears;
    // send those to "/" (matching the logout contract) instead of /login.
    return isSignedOut() ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate
        to="/login"
        state={{ from: location, sessionExpired: sessionExpired || undefined }}
        replace
      />
    );
  }
  if (!allowed.includes(user.role)) {
    return <AccessDenied />;
  }
  return children;
}
