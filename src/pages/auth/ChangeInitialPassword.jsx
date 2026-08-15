import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { useAuth } from "@/contexts/AuthContext";
import { changeInitialPassword } from "@/services/auth/authService";
import { validateConfirm, validatePassword } from "@/utils/validation/authValidation";
import { roleHome } from "@/utils/roles";

export function ChangeInitialPassword() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.mustChangePassword) return <Navigate to={roleHome(user.role)} replace />;
  const submit = async (event) => {
    event.preventDefault();
    const passwordError = validatePassword(password); const confirmError = validateConfirm(confirm, password);
    if (passwordError || confirmError) { setError(passwordError || confirmError); return; }
    setPending(true); setError("");
    try { const result = await changeInitialPassword(password, confirm); window.dispatchEvent(new CustomEvent("civicai:session-updated", { detail: result.user })); toast.success("Password updated successfully."); navigate(roleHome(result.user.role), { replace: true }); }
    catch (nextError) { setError(nextError.message || "Unable to update your password."); }
    finally { setPending(false); }
  };
  return <AuthLayout><AuthCard title="Set a new password" description="For security, change the temporary password provided by your administrator before continuing.">{error && <ErrorMessage className="mb-5">{error}</ErrorMessage>}<form onSubmit={submit} className="space-y-5"><PasswordField id="new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" error={undefined} />{password && <PasswordStrength value={password} />}<PasswordField id="confirm-password" label="Confirm new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" /><SubmitButton loading={pending} loadingText="Updating password…">Set New Password</SubmitButton></form></AuthCard></AuthLayout>;
}
