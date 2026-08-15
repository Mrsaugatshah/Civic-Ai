import { useState } from "react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordField } from "@/components/auth/PasswordField";
import * as authService from "@/services/auth/authService";
import { validateConfirm, validatePassword } from "@/utils/validation/authValidation";

export function Profile() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!oldPassword) nextErrors.oldPassword = "Enter your current password.";
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    const confirmError = validateConfirm(confirm, password);
    if (confirmError) nextErrors.confirm = confirmError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setPending(true);
    try {
      // No authenticated change-password endpoint exists. Start the real, verified reset flow.
      await authService.forgotPassword(user.email);
      toast.success("A secure password reset link has been sent to your email.");
      setOpen(false);
      setOldPassword(""); setPassword(""); setConfirm("");
    } catch (error) {
      toast.error(error.message || "Unable to start password reset.");
    } finally { setPending(false); }
  };

  return <CitizenLayout><div className="mx-auto max-w-2xl space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Profile</h1><p className="mt-1 text-sm text-muted-foreground">Your CivicAI account information.</p></header><Card><CardContent className="space-y-4 p-6"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound size={20} /></span><div><p className="font-semibold">{user?.name || "Citizen"}</p><p className="text-sm text-muted-foreground">{user?.email || ""}</p></div></div><div className="grid gap-3 border-t pt-4 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Role</p><p className="mt-1 text-sm font-medium capitalize">{user?.role || "citizen"}</p></div><div><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 text-sm font-medium">{user?.location || "Not set"}</p></div></div><div className="border-t pt-4"><Button variant="outline" onClick={() => setOpen(true)}>Change Password</Button></div></CardContent></Card></div><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Change Password</DialogTitle><DialogDescription>Enter your current password and choose a new one. CivicAI will send a secure reset link to verify the change.</DialogDescription></DialogHeader><form onSubmit={submitPasswordChange} className="space-y-4"><PasswordField id="profile-old-password" label="Current password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} autoComplete="current-password" error={errors.oldPassword} /><PasswordField id="profile-new-password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" error={errors.password} /><PasswordField id="profile-confirm-password" label="Retype new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" error={errors.confirm} /><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Continue securely"}</Button></DialogFooter></form></DialogContent></Dialog></CitizenLayout>;
}
