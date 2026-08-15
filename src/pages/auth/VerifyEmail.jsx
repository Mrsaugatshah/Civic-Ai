import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CircleCheck, RefreshCw } from "lucide-react";
import * as authService from "@/services/auth/authService";
import { useCountdown } from "@/hooks/useCountdown";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerificationNotice } from "@/components/auth/VerificationNotice";
import { ErrorMessage } from "@/components/auth/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyEmail() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("awaiting");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { seconds, active, start } = useCountdown();

  const verify = async (event) => {
    event.preventDefault();
    if (!email.trim() || !/^\d{6}$/.test(code)) {
      setError("Enter your email address and the 6-digit code from your email.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await authService.verifyEmail(email, code);
      setStatus("verified");
    } catch (verificationError) {
      setError(verificationError.message);
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (active || !email.trim()) return;
    try {
      await authService.resendVerification(email);
      setCode("");
      setError("");
      start(30);
    } catch (resendError) {
      setError(resendError.message);
    }
  };

  return <AuthLayout><AuthCard title={status === "verified" ? "Email verified" : "Verify your email"}>
    {status === "verified" ? <div className="py-8 text-center"><CircleCheck className="mx-auto text-success" size={48}/><p className="mt-4">Your email is confirmed. You can now sign in.</p><Button asChild className="mt-6"><Link to="/login" state={location.state?.from ? { from: location.state.from } : undefined}>Sign in</Link></Button></div> :
      <form onSubmit={verify} className="space-y-5">
        <VerificationNotice title="Check your inbox" description="Enter the 6-digit verification code sent by CivicAI. It expires after 30 minutes."/>
        <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address"/>
        <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" aria-label="6-digit verification code" className="h-12 text-center text-xl tracking-[0.4em]"/>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" className="w-full" disabled={pending || code.length !== 6 || !email.trim()}>{pending ? "Verifying…" : "Verify email"}</Button>
        <Button type="button" variant="outline" className="w-full" disabled={active || !email.trim()} onClick={resend}><RefreshCw size={15}/>{active ? `Resend available in ${seconds}s` : "Resend verification code"}</Button>
      </form>}
  </AuthCard></AuthLayout>;
}
