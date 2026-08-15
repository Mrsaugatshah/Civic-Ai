import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickReportCard() {
  return <section id="report-card" className="scroll-mt-24"><Card className="border-primary/25 bg-primary/[0.04] shadow-soft"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-lg font-semibold text-foreground">Report a civic issue</p><p className="mt-1 text-sm text-muted-foreground">Tell us what happened and where.</p></div><Button asChild><Link to="/report"><Plus size={15} />Report an Issue</Link></Button></CardContent></Card></section>;
}
