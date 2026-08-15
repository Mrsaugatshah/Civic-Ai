import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Search } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackGuestReport } from "@/services/report/reportService";

export function GuestTrack() {
  const [params] = useSearchParams();
  const [trackingId, setTrackingId] = useState(params.get("trackingId") || "");
  const [accessToken, setAccessToken] = useState(params.get("accessToken") || "");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (event) => {
    event?.preventDefault();
    setLoading(true); setError("");
    try { setReport(await trackGuestReport(trackingId.trim(), accessToken.trim())); }
    catch (nextError) { setReport(null); setError(nextError.message); }
    finally { setLoading(false); }
  };

  // The initial URL parameters intentionally trigger one lookup on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (params.get("trackingId") && params.get("accessToken")) lookup(); }, []);

  return <div className="min-h-screen bg-background"><Navbar active="Home" /><main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
    <div className="text-center"><Search className="mx-auto text-primary" size={24} /><h1 className="mt-3 font-display text-2xl font-bold text-foreground">Track your complaint</h1><p className="mt-2 text-sm text-muted-foreground">Enter the tracking ID and private access token from your submission.</p></div>
    <Card className="mt-7"><CardContent className="p-5"><form onSubmit={lookup} className="space-y-3"><Input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="Tracking ID" aria-label="Tracking ID" required /><Input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Private access token" aria-label="Private access token" required /><Button className="w-full" disabled={loading}>{loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {loading ? "Checking…" : "Check status"}</Button></form>{error && <p role="alert" className="mt-3 text-sm text-error-foreground">{error}</p>}</CardContent></Card>
    {report && <Card className="mt-5"><CardContent className="space-y-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{report.reporterType === "guest" ? "Anonymous community report" : "Report"}</p><h2 className="mt-1 font-semibold text-foreground">{report.title}</h2><p className="mt-1 text-sm text-muted-foreground">{report.categoryLabel} · {report.location}</p></div><Badge>{String(report.status).replaceAll("_", " ")}</Badge></div><div className="rounded-lg border p-3 text-sm"><p className="font-medium text-foreground">Community verification</p><p className="mt-1 text-muted-foreground">Agree {report.confirmed} · Disagree {report.rejected} · {report.communityStatus?.replaceAll("_", " ")}</p></div><ol className="space-y-2">{(report.timeline || []).map((item) => <li key={item.id} className="flex items-start gap-2 text-sm"><CheckCircle2 size={15} className="mt-0.5 text-success-foreground" /><span className="text-foreground">{String(item.newStatus).replaceAll("_", " ")}<span className="ml-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span></span></li>)}</ol>{report.evidence?.length > 0 && <div className="grid grid-cols-2 gap-2">{report.evidence.map((item) => <img key={item.id} src={item.url} alt={item.originalName} className="h-32 w-full rounded-md object-cover" />)}</div>}</CardContent></Card>}
    <p className="mt-6 text-center text-sm text-muted-foreground"><Link to="/guest" className="text-primary hover:underline">Submit another report</Link></p>
  </main></div>;
}

export default GuestTrack;
