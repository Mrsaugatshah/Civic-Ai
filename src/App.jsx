import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes/AppRoutes";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

// NOTE: uses BrowserRouter so routes match the product spec exactly
// (/login, /register, …). Deployments must enable SPA fallback
// (rewrite all routes to index.html) so deep links work.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <TooltipProvider delayDuration={150}>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ErrorBoundary>
    </MotionConfig>
  );
}
