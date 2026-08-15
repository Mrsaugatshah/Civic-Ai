import { useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { isOffline } from "@/services/auth/authService";
import { validateEmail } from "@/utils/validation/authValidation";
import { roleHome } from "@/utils/roles";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { PasswordField } from "@/components/auth/PasswordField";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ErrorMessage } from "@/components/auth/ErrorMessage";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const fromLocation = location.state?.from;
  const from = fromLocation
    ? `${fromLocation.pathname || ""}${fromLocation.search || ""}`
    : null;
  const sessionExpired = location.state?.sessionExpired;

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const emailError = validateEmail(email);
    if (emailError) errs.email = emailError;
    if (!password) errs.password = "Please enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPending(true);
    setFormError("");
    try {
      const authed = await login({ email, password, remember });
      toast.success(`Welcome back, ${authed.name.split(" ")[0]}!`);
      navigate(resolveDestination(from, authed.role), { replace: true });
    } catch (error) {
      setFormError(
        isOffline()
          ? "We couldn't connect to CivicAI. Please check your connection and try again."
          : error.message
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue making a difference in your community."
      >
        {sessionExpired && (
          <ErrorMessage tone="warning" className="mb-5">
            Your session has expired. Please sign in again.
          </ErrorMessage>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {formError && (
            <ErrorMessage network={isOffline()}>{formError}</ErrorMessage>
          )}

          <FormField id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-11"
            />
          </FormField>

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
          />

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(!!checked)}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton loading={pending} loadingText="Signing in...">
            Sign In
            <ArrowRight size={16} />
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

function resolveDestination(from, role) {
  const home = roleHome(role);
  if (role === "citizen" && from?.startsWith("/report")) return from;
  if (from && from.startsWith(home)) return from;
  return home;
}
