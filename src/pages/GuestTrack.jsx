import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { trackGuestReport } from "@/services/report/reportService";

const labels = { submitted: "Received", under_review: "Under Review", in_progress: "Work In Progress", resolved: "Completed", closed: "Completed", assigned: "Assigned", verified: "Verified" };

export function GuestTrack() {
  const [params] = useSearchParams();
  const [trackingId, setTrackingId] = useState(params.get("trackingId") || "");
  const [accessToken, setAccessToken] = useState(params.get("accessToken") || "");
  const [report, setReport] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const lookup = async (event) => { event?.preventDefault(); setLoading(true); setError(""); try { setReport(await trackGuestReport(trackingId.trim(), accessToken.trim())); } catch (nextError) { setReport(null); setError(nextError.message); } finally { setLoading(false); } };
  // URL parameters intentionally trigger one lookup on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (params.get("trackingId") && params.get("accessToken")) lookup(); }, []);
  return <div className="min-h-screen bg-background"><Navbar active="Home" /><main className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><div className="text-center"><Search className="mx-auto text-primary" size={24} /><h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">Track your complaint</h1><p className="mt-2 text-sm text-muted-foreground">Enter the tracking details from your submission.</p></div><Card className="mt-7"><CardContent className="p-5"><form onSubmit={lookup} className="space-y-3"><Input value={trackingId} onChange={(event) => setTrackingId(event.target.value)} placeholder="Tracking ID" aria-label="Tracking ID" required /><Input value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="Private access token" aria-label="Private access token" required /><Button className="w-full" disabled={loading}>{loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} {loading ? "Checking…" : "Track complaint"}</Button></form>{error && <p role="alert" className="mt-3 text-sm text-error-foreground">{error}</p>}</CardContent></Card>
    {report && <section className="mt-6 space-y-4"><Card><CardContent className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl font-bold text-foreground">{report.title}</h2><p className="mt-1 text-sm text-muted-foreground">{report.categoryLabel} <span aria-hidden>•</span> {report.location || "Community"}</p></div><ReportStatusBadge status={report.status} /></div></CardContent></Card><Card><CardContent className="p-5"><h3 className="font-display text-base font-semibold">Progress</h3><ol className="mt-5 space-y-4">{(report.timeline || []).map((item) => <li key={item.id || `${item.newStatus}-${item.createdAt}`} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white"><Check size={13} /></span><div><p className="text-sm font-medium text-foreground">{labels[item.newStatus] || "Status updated"}</p>{item.createdAt && <p className="mt-0.5 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}</div></li>)}</ol></CardContent></Card><Card><CardContent className="space-y-3 p-5"><h3 className="font-display text-base font-semibold">Community support</h3><p className="text-sm text-muted-foreground">Agree {report.confirmed ?? 0} <span aria-hidden>•</span> Disagree {report.rejected ?? 0}</p>{report.communityStatus === "community_supported" && <p className="text-xs font-medium text-success-foreground">Community Supported</p>}</CardContent></Card>{(report.status === "resolved" || report.status === "closed") && <Card><CardContent className="p-5"><h3 className="font-display text-base font-semibold">Public resolution result</h3><p className="mt-2 text-sm text-muted-foreground">This complaint has been marked completed.{report.resolution?.note ? ` ${report.resolution.note}` : ""}</p></CardContent></Card>}</section>}
    <p className="mt-8 text-center text-sm text-muted-foreground"><Link to="/guest" className="text-primary hover:underline">Submit another report</Link></p></main></div>;
}

export default GuestTrack;
