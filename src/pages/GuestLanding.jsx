import { Link } from "react-router-dom";
import { ArrowRight, FileText, Search, UserPlus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export function GuestLanding() {
  return <div className="min-h-screen bg-background"><Navbar active="Home" /><main className="mx-auto max-w-xl px-4 py-16 sm:px-6"><div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CivicAI guest reporting</p><h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Report a problem without an account</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Submit a civic issue in a few minutes, then use your private access details to track it.</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><Button size="lg" asChild><Link to="/guest/report?quick=1"><FileText size={17} />Quick Report</Link></Button><Button size="lg" variant="outline" asChild><Link to="/guest/report"><Search size={17} />Detailed Report</Link></Button></div><div className="mt-10 border-t pt-6 text-center"><p className="text-sm text-muted-foreground">Already submitted one?</p><Link to="/track" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">Track complaint <ArrowRight size={14} /></Link><p className="mt-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><UserPlus size={13} />Want community features? <Link to="/register" className="font-semibold text-primary hover:underline">Create account</Link></p></div></main></div>;
}

export default GuestLanding;
