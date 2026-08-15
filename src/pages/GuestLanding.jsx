import { Link } from "react-router-dom";
import { ArrowRight, FileText, Search, UserPlus } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GuestLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar active="Home" />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CivicAI guest reporting</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">Report a civic problem</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Submit a complaint without creating an account. Save the private access token shown after submission to track progress.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-5">
              <FileText className="text-primary" size={22} />
              <div><h2 className="font-semibold text-foreground">Quick Report</h2><p className="mt-1 text-sm text-muted-foreground">Location, description, and optional image.</p></div>
              <Button asChild className="w-full"><Link to="/guest/report?quick=1">Start quick report <ArrowRight size={15} /></Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-5">
              <Search className="text-primary" size={22} />
              <div><h2 className="font-semibold text-foreground">Track a complaint</h2><p className="mt-1 text-sm text-muted-foreground">Use a tracking ID and private access token.</p></div>
              <Button asChild variant="outline" className="w-full"><Link to="/track">Track complaint</Link></Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 text-center"><Button asChild variant="ghost"><Link to="/guest/report">Use detailed report</Link></Button></div>
        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><UserPlus size={13} />Want community verification? <Link to="/register" className="font-semibold text-primary hover:underline">Create an account</Link></p>
      </main>
    </div>
  );
}

export default GuestLanding;
