import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth/authService";
import { validateEmail } from "@/utils/validation/authValidation";
import { roleHome } from "@/utils/roles";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPassword() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setPending(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (error) {
      if (error.code === "rate_limited") setError(error.message);
      else setError("We couldn't send the request. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        description="Enter your email and we'll send a secure password reset link."
      >
        {sent ? <div className="space-y-5 text-center"><p className="text-sm text-muted-foreground">If an eligible account exists for that email, a message will arrive shortly. Check your inbox and spam folder.</p><Button asChild className="w-full"><Link to="/login">Back to Sign In</Link></Button></div> : <>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <FormField id="email" label="Email" error={error}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
              className="h-11"
            />
          </FormField>

          <SubmitButton loading={pending} loadingText="Sending...">
            Send Reset Link
            <Send size={15} />
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </p>
        </>}
      </AuthCard>
    </AuthLayout>
  );
}
