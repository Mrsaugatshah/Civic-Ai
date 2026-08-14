import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authService from "@/services/auth/authService";

const AuthContext = createContext(null);

// Set by logout() BEFORE the session is cleared. RoleGuard consults it so
// that during a logout it redirects to "/" instead of racing to "/login"
// with stale from-state. It is reset on login, on reload, and when the
// landing page mounts after a logout.
let signedOutFlag = false;

export function isSignedOut() {
  return signedOutFlag;
}

export function clearSignedOut() {
  signedOutFlag = false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let mounted = true;
    authService
      .getSession()
      .then((sessionUser) => {
        if (!mounted) return;
        if (!sessionUser) {
          clearSignedOut();
        }
        setUser(sessionUser);
        setStatus(sessionUser ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (mounted) {
          clearSignedOut();
          setStatus("unauthenticated");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const sessionUser = await authService.login(credentials);
    clearSignedOut();
    setSessionExpired(false);
    setUser(sessionUser);
    setStatus("authenticated");
    return sessionUser;
  }, []);

  const logout = useCallback(async () => {
    // Flag BEFORE clearing so any still-mounted RoleGuard redirects to "/".
    signedOutFlag = true;
    await authService.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      sessionExpired,
      login,
      logout,
    }),
    [user, status, sessionExpired, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
