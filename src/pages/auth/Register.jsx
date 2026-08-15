import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth/authService";
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validateConfirm,
  validatePhone,
} from "@/utils/validation/authValidation";
import { roleHome } from "@/utils/roles";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/auth/FormField";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ErrorMessage } from "@/components/auth/ErrorMessage";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function Register() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [role, setRole] = useState("citizen");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    location: "",
    organization: "",
    department: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={roleHome(user.role)} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const nameErr = validateFullName(form.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;

    const confirmErr = validateConfirm(form.confirm, form.password);
    if (confirmErr) errs.confirm = confirmErr;

    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;

    if (role === "authority") {
      if (!form.organization.trim()) errs.organization = "Please enter your organization or department.";
      if (!form.department.trim()) errs.department = "Please choose your department or service category.";
    }

    if (!acceptedTerms) {
      errs.terms = "Please accept the Terms of Service and Privacy Policy to continue.";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPending(true);
    setFormError("");
    try {
      const result = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        phone: form.phone,
        location: form.location,
        organization: form.organization,
        department: form.department,
      });
      toast.success(result.emailVerificationRequired ? "Account created! Check your email for the verification code." : "Account created! You can sign in with your password.");
      navigate(result.emailVerificationRequired ? "/verify-email" : "/login", { replace: true, state: result.emailVerificationRequired ? { email: form.email } : undefined });
    } catch (error) {
      setFormError(
        authService.isOffline()
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
        title="Create Account"
        description="Join CivicAI and help improve your community."
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {formError && <ErrorMessage network={authService.isOffline()}>{formError}</ErrorMessage>}

          <RoleSelector value={role} onChange={setRole} error={errors.role} />

          {role === "authority" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="organization"
                label="Organization / Department"
                error={errors.organization}
                className="sm:col-span-2"
              >
                <Input
                  id="organization"
                  value={form.organization}
                  onChange={set("organization")}
                  placeholder="e.g. Ward 11 Office"
                  aria-invalid={!!errors.organization}
                  className="h-11"
                />
              </FormField>
              <FormField
                id="department"
                label="Department / Service category"
                error={errors.department}
                className="sm:col-span-2"
              >
                <Input
                  id="department"
                  value={form.department}
                  onChange={set("department")}
                  placeholder="e.g. Public Works"
                  aria-invalid={!!errors.department}
                  className="h-11"
                />
              </FormField>
            </div>
          )}

          <FormField id="name" label="Full name" error={errors.name}>
            <Input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              placeholder="Your full name"
              aria-invalid={!!errors.name}
              className="h-11"
            />
          </FormField>

          <FormField id="email" label="Email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className="h-11"
            />
          </FormField>

          <PasswordField
            id="password"
            label="Password"
            value={form.password}
            onChange={set("password")}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password}
          />
          {form.password && <PasswordStrength value={form.password} />}

          <PasswordField
            id="confirm"
            label="Confirm password"
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirm}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="phone" label="Phone" error={errors.phone}>
              <Input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+977 98…"
                aria-invalid={!!errors.phone}
                className="h-11"
              />
            </FormField>
            <FormField id="location" label="Location / municipality (optional)">
              <Input
                id="location"
                autoComplete="address-level2"
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Ward 11, Bharatpur"
                className="h-11"
              />
            </FormField>
          </div>

          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link to="/" className="font-medium text-primary hover:text-primary-hover">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/" className="font-medium text-primary hover:text-primary-hover">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && (
              <p id="terms-error" role="alert" className="text-xs font-medium text-error">
                {errors.terms}
              </p>
            )}
          </div>

          <SubmitButton loading={pending} loadingText="Creating Account...">
            Create Account
            <ArrowRight size={16} />
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
