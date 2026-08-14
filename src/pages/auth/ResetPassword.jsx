import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CircleCheck, KeyRound } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth/authService";
import {
  validatePassword,
  validateConfirm,
} from "@/utils/validation/authValidation";
import { roleHome } from "@/utils/roles";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ErrorMessage } from "@/components/auth/ErrorMessage";

import { Button } from "@/components/ui/button";

export function ResetPassword() {
  const [params] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) errs.token = "This password reset link is invalid.";
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    const confirmErr = validateConfirm(confirm, password);
    if (confirmErr) errs.confirm = confirmErr;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPending(true);
    setFormError("");
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <AuthCard title="Password updated">
          <div className="flex flex-col items-center rounded-xl border border-success/25 bg-success-light/40 px-6 py-10 text-center">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15"
            >
              <CircleCheck size={28} className="text-success" />
            </motion.span>
            <h2 className="font-display mt-4 text-lg font-semibold text-foreground">
              Password updated
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your password has been changed successfully. You can sign in with
              your new password now.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/login">
                Sign In
                <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create a new password"
        description="Choose a strong password you haven't used before."
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {formError && <ErrorMessage>{formError}</ErrorMessage>}

          {errors.token && <ErrorMessage>{errors.token}</ErrorMessage>}

          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
          />
          {password && <PasswordStrength value={password} />}

          <PasswordField
            id="confirm"
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirm}
          />

          <SubmitButton loading={pending} loadingText="Updating...">
            <KeyRound size={15} />
            Update Password
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Back to Sign In
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
