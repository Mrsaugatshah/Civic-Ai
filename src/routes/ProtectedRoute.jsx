import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export function FullScreenLoader({ label = "Checking your session..." }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 size={24} className="animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, sessionExpired: sessionExpired || undefined }}
        replace
      />
    );
  }
  return children;
}
