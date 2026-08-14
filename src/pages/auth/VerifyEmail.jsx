import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  const [params] = useSearchParams(); const location = useLocation();
  const token=params.get("token") || ""; const [email,setEmail]=useState(location.state?.email || "");
  const [status,setStatus]=useState(token ? "loading" : "awaiting"); const [error,setError]=useState("");
  const {seconds,active,start}=useCountdown();
  useEffect(() => { if (!token) return; let live=true; authService.verifyEmail(token).then(()=>live&&setStatus("verified")).catch((e)=>{ if(live){ setError(e.message); setStatus(e.code === "expired_token" ? "expired" : e.code === "used_token" ? "used" : "invalid"); }}); return()=>{live=false}; },[token]);
  const resend=async()=>{ if(active||!email)return; try{await authService.resendVerification(email);setError("");start(30);}catch(e){setError(e.message);} };
  return <AuthLayout><AuthCard title={status==="verified"?"Email verified":"Verify your email"}>
    {status==="loading"&&<p className="py-10 text-center text-muted-foreground">Verifying your secure link…</p>}
    {status==="verified"&&<div className="py-8 text-center"><CircleCheck className="mx-auto text-success" size={48}/><p className="mt-4">Your email is confirmed. You can now sign in.</p><Button asChild className="mt-6"><Link to="/login">Sign in</Link></Button></div>}
    {["invalid","expired","used"].includes(status)&&<div className="space-y-5"><ErrorMessage>{error}</ErrorMessage>{status==="expired"&&<VerificationNotice title="Request a fresh link" description="Enter your email address. For privacy, the response is the same for every account."/>}<Resend email={email} setEmail={setEmail} active={active} seconds={seconds} onClick={resend}/></div>}
    {status==="awaiting"&&<div className="space-y-5"><VerificationNotice title="Check your inbox" description="Open the secure verification link sent by CivicAI. It expires after 30 minutes."/><Resend email={email} setEmail={setEmail} active={active} seconds={seconds} onClick={resend}/>{error&&<ErrorMessage>{error}</ErrorMessage>}</div>}
  </AuthCard></AuthLayout>;
}
function Resend({email,setEmail,active,seconds,onClick}) { return <div className="space-y-3"><Input type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com"/><Button variant="outline" className="w-full" disabled={active||!email} onClick={onClick}><RefreshCw size={15}/>{active?`Resend available in ${seconds}s`:"Resend verification email"}</Button></div>; }
