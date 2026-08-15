import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, MapPin, Calendar, Building2, Sparkles, ChevronRight,
  CheckCircle2, Loader2, StickyNote, ImageOff, Clock, GitBranch,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import {
  getIssue, getIssueActivity, assignDepartment, updateIssueStatus,
  addInternalNote, uploadResolutionImage, markIssueResolved,
  ISSUE_STATUSES, DEPARTMENTS, allowedTransitions,
} from "@/services/admin/adminService";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ResolutionUpload } from "@/components/admin/issue/ResolutionUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function statusLabel(key) {
  return ISSUE_STATUSES.find((s) => s.key === key)?.label ?? key;
}

/* ---------------------------- Activity timeline ---------------------------- */

function ActivityTimeline({ items, loading }) {
  if (loading) return <Skeleton className="h-40 rounded-lg" />;
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>;
  }
  return (
    <ol className="relative space-y-4 before:absolute before:left-[9px] before:top-1 before:h-[calc(100%-16px)] before:w-px before:bg-border">
      {items.map((item, i) => (
        <li key={`${item.key}-${i}`} className="relative flex items-start gap-3">
          <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-success bg-success text-white">
            <CheckCircle2 size={12} strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground/90">{item.text}</p>
            <p className="text-[11px] text-muted-foreground">{fmtDateTime(item.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------- Page -------------------------------- */

export function AdminIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const issueAsync = useAsync(() => getIssue(id), [id]);
  const activityAsync = useAsync(() => getIssueActivity(id), [id]);

  const [deptSaving, setDeptSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // status key awaiting confirmation
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const reload = () => {
    issueAsync.reload();
    activityAsync.reload();
  };

  const adminName = user?.name ? `${user.name} (Admin)` : "You (Admin)";

  const handleDepartmentChange = async (department) => {
    if (!issueAsync.data || department === issueAsync.data.department) return;
    setDeptSaving(true);
    try {
      await assignDepartment(id, department);
      toast.success("Issue assigned successfully");
      reload();
    } catch {
      toast.error("Couldn't update the department. Please try again.");
    } finally {
      setDeptSaving(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setStatusSaving(true);
    try {
      await updateIssueStatus(id, pendingStatus);
      toast.success("Status updated successfully");
      setPendingStatus(null);
      reload();
    } catch (err) {
      if (err.code === "INVALID_TRANSITION") {
        toast.error(err.message);
        setPendingStatus(null);
      } else {
        toast.error("Couldn't update the status. Please try again.");
      }
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddNote = async () => {
    const content = noteText.trim();
    if (!content) return;
    setNoteSaving(true);
    try {
      await addInternalNote(id, content, adminName);
      setNoteText("");
      reload();
    } catch {
      toast.error("Couldn't save the note. Please try again.");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleResolutionUpload = async (dataUrl) => {
    await uploadResolutionImage(id, dataUrl);
    reload();
  };

  const handleMarkResolved = async () => {
    setResolving(true);
    try {
      const result = await markIssueResolved(id, adminName, resolutionNote);
      toast.success("Issue marked as resolved");
      reload();
      return result;
    } catch (err) {
      if (err.code === "MISSING_EVIDENCE") {
        toast.error(err.message);
      } else {
        toast.error("Couldn't mark this issue resolved. Please try again.");
      }
    } finally {
      setResolving(false);
    }
  };

  if (issueAsync.error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-lg font-semibold text-foreground">Issue not found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {issueAsync.error.message || "This issue may have been removed or the link is incorrect."}
          </p>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft size={14} />
            Back to dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const issue = issueAsync.data;
  const loading = issueAsync.loading;
  const isResolved = issue?.status === "resolved" || issue?.status === "closed";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <ChevronRight size={13} />
          <span className="text-foreground">{loading ? "Loading…" : issue.id}</span>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <Skeleton className="h-96 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Left: issue information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {issue.title} · {issue.id}
                      </p>
                      <h1 className="font-display text-xl font-bold text-foreground">{issue.title}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/85">{issue.description}</p>

                  {issue.evidence?.find((item) => item.kind === "citizen")?.url ? (
                    <figure className="overflow-hidden rounded-lg border bg-muted/40">
                      <img src={issue.evidence.find((item) => item.kind === "citizen").url} alt={`Evidence for ${issue.title}`} className="aspect-video w-full object-contain" />
                      <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">Original citizen evidence</figcaption>
                    </figure>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                      <span className="flex flex-col items-center gap-1.5 text-xs"><ImageOff size={22} />No photo was attached to this report</span>
                    </div>
                  )}

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin size={13} className="text-primary" /> {issue.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={13} /> Reported {fmtDateTime(issue.reportedAt)}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} /> Last updated {fmtDateTime(issue.updatedAt)}
                    </p>
                  </div>

                  <PriorityMeter score={issue.priority} />

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      navigate("/map", {
                        state: { focusIssueId: issue.id, category: issue.category, priority: issue.priority },
                      })
                    }
                  >
                    <MapPin size={14} />
                    View on Map
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <Sparkles size={15} className="text-ai" /> AI Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 pt-0 sm:grid-cols-3">
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Classification confidence</p>
                    <p className="font-display text-lg font-semibold text-foreground">{issue.aiConfidence.classification ? `${issue.aiConfidence.classification}%` : "Pending"}</p>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Severity confidence</p>
                    <p className="font-display text-lg font-semibold text-foreground">{issue.aiConfidence.severity ? `${issue.aiConfidence.severity}%` : "Pending"}</p>
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Department match</p>
                    <p className="font-display text-lg font-semibold text-foreground">{issue.aiConfidence.department ? `${issue.aiConfidence.department}%` : "Pending"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md border bg-accent/40 p-3 text-sm text-foreground sm:col-span-3">
                    <Building2 size={14} className="text-primary shrink-0" />
                    Recommended department: <span className="font-medium">{issue.aiDepartment}</span>
                    {issue.aiDepartment !== issue.department && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <GitBranch size={12} /> Admin assigned {issue.department}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {issue.related?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Related / Duplicate Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y pt-0">
                    {issue.related.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/admin/issues/${r.id}`)}
                        className="flex w-full items-center justify-between gap-3 py-2.5 text-left first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.location} · {r.id}</p>
                        </span>
                        <StatusBadge status={r.status} className="shrink-0 px-2 py-0.5 text-[11px]" />
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ActivityTimeline items={activityAsync.data} loading={activityAsync.loading} />
                </CardContent>
              </Card>
            </div>

            {/* Right: admin actions panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-xs text-muted-foreground">Current department</p>
                  <Select value={issue.department} onValueChange={handleDepartmentChange} disabled={deptSaving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-xs text-muted-foreground">Current status: <span className="font-medium text-foreground">{statusLabel(issue.status)}</span></p>
                  <Select value={issue.status} onValueChange={setPendingStatus} disabled={statusSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_STATUSES.filter((s) => allowedTransitions(issue.status).includes(s.key)).map((s) => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    {allowedTransitions(issue.status).length === 0
                      ? "This issue has no further status changes available."
                      : `Allowed next: ${allowedTransitions(issue.status).map(statusLabel).join(" → ")}`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <StickyNote size={15} /> Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-[11px] text-muted-foreground">Visible to admins/officials only — never shown to citizens.</p>
                  <Textarea
                    placeholder="Add an internal note…"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    disabled={noteSaving}
                    rows={3}
                  />
                  <Button size="sm" onClick={handleAddNote} disabled={noteSaving || !noteText.trim()}>
                    {noteSaving && <Loader2 size={13} className="animate-spin" />}
                    Add Note
                  </Button>

                  {issue.notes.length > 0 && (
                    <div className="space-y-3 border-t pt-3">
                      {issue.notes.map((n) => (
                        <div key={n.id} className="rounded-md border bg-muted/30 p-2.5 text-sm">
                          <p className="text-foreground/90">{n.content}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{n.author} · {fmtDateTime(n.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resolution Evidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <ResolutionUpload existing={issue.resolution} onUploaded={handleResolutionUpload} disabled={isResolved} />

                  {isResolved ? (
                    <div className="rounded-md border border-success/25 bg-success/10 p-3 text-sm">
                      <p className="flex items-center gap-1.5 font-medium text-success-foreground">
                        <CheckCircle2 size={14} /> Issue Resolved
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Resolved {fmtDateTime(issue.resolution?.resolvedAt)}
                        {issue.resolution?.resolvedBy && <> by {issue.resolution.resolvedBy}</>}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Resolution note (e.g. what was fixed)…"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        rows={2}
                        disabled={resolving}
                      />
                      <Button className="w-full" onClick={handleMarkResolved} disabled={resolving}>
                        {resolving && <Loader2 size={14} className="animate-spin" />}
                        Mark as Resolved
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change status</AlertDialogTitle>
            <AlertDialogDescription>
              {issue && pendingStatus && (
                <>
                  <span className="font-medium text-foreground">{statusLabel(issue.status)}</span>
                  {" → "}
                  <span className="font-medium text-foreground">{statusLabel(pendingStatus)}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={statusSaving} className={cn(statusSaving && "opacity-70")}>
              {statusSaving && <Loader2 size={14} className="animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
