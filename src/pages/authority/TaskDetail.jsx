import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, MapPin, Calendar, Building2, ChevronRight, Clock,
  CheckCircle2, Loader2, ImageOff, FileText, Sparkles,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useAsync } from "@/hooks/useAsync";
import {
  getDepartmentTask, getDepartmentTaskActivity, updateTaskStatus,
  uploadCompletionEvidence, markTaskCompleted,
  DepartmentAccessError, addDepartmentNote,
} from "@/services/authority/authorityService";

import { AuthorityLayout } from "@/components/authority/AuthorityLayout";
import { ResolutionUpload } from "@/components/admin/issue/ResolutionUpload";
import { AIAnalysisCard } from "@/components/report/ai/AIAnalysisCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
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
  return { submitted: "Received", reported: "Received", under_review: "Under Review", verified: "Under Review", assigned: "Received", in_progress: "Work In Progress", resolved: "Completed", closed: "Completed", rejected: "Rejected", reopened: "Reopened" }[key] ?? key;
}

function nextAction(status) {
  return { submitted: ["under_review", "Start Review"], under_review: ["verified", "Start Work"], verified: ["assigned", "Assign Work"], assigned: ["in_progress", "Start Work"], in_progress: ["resolved", "Mark Work Completed"], reopened: ["assigned", "Assign Work"] }[status] || null;
}

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

export function AuthorityTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const department = user?.department || "";
  const staffName = user?.name ? `${user.name} (${department || "Department"})` : "Department staff";

  const taskAsync = useAsync(() => getDepartmentTask(id, department), [id, department]);
  const activityAsync = useAsync(() => getDepartmentTaskActivity(id, department), [id, department]);

  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [completing, setCompleting] = useState(false);

  const reload = () => {
    taskAsync.reload();
    activityAsync.reload();
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setStatusSaving(true);
    try {
      await updateTaskStatus(id, pendingStatus, department);
      toast.success(`Status updated to ${statusLabel(pendingStatus)}`);
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

  const handleEvidenceUpload = async (dataUrl) => {
    await uploadCompletionEvidence(id, dataUrl, noteText, department);
    reload();
  };

  const handleMarkCompleted = async () => {
    setCompleting(true);
    try {
      await markTaskCompleted(id, staffName, department);
      toast.success("Work completed");
      setConfirmComplete(false);
      reload();
    } catch (err) {
      if (err.code === "MISSING_EVIDENCE") {
        toast.error(err.message);
      } else {
        toast.error("Couldn't mark this task completed. Please try again.");
      }
    } finally {
      setCompleting(false);
    }
  };

  if (taskAsync.error) {
    const forbidden = taskAsync.error instanceof DepartmentAccessError || taskAsync.error?.code === "FORBIDDEN";
    return (
      <AuthorityLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-lg font-semibold text-foreground">
            {forbidden ? "Access restricted" : "Task not found"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {forbidden
              ? "This task isn't assigned to your department."
              : taskAsync.error.message || "This task may have been removed or the link is incorrect."}
          </p>
          <Button variant="outline" onClick={() => navigate("/authority/dashboard")}>
            <ArrowLeft size={14} />
            Back to dashboard
          </Button>
        </div>
      </AuthorityLayout>
    );
  }

  const task = taskAsync.data;
  const loading = taskAsync.loading;
  const isCompleted = task?.status === "resolved" || task?.status === "closed";

  return (
    <AuthorityLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/authority/dashboard" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft size={14} />
            Department Dashboard
          </Link>
          <ChevronRight size={13} />
          <span className="text-foreground">{loading ? "Loading…" : task.id}</span>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <Skeleton className="h-96 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Left: task information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {task.id}
                      </p>
                      <h1 className="font-display text-xl font-bold text-foreground">{task.title}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={task.severity} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/85">{task.description}</p>

                  {task.evidence?.find((item) => item.kind === "citizen")?.url ? (
                  <figure className="overflow-hidden rounded-lg border bg-muted/40">
                      <img
                        src={task.evidence.find((item) => item.kind === "citizen").url}
                        alt={`Citizen evidence for ${task.title}`}
                        className="max-h-[460px] w-full object-contain"
                      />
                      <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">
                        Original photo uploaded by the citizen
                      </figcaption>
                    </figure>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                      <span className="flex flex-col items-center gap-1.5 text-xs">
                        <ImageOff size={22} />
                        No photo was attached to this report
                      </span>
                    </div>
                  )}

                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin size={13} className="text-primary" /> {task.location}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={13} /> Reported {fmtDateTime(task.reportedAt)}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 size={13} /> {task.department}
                    </p>
                    {task.updatedAt && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={13} /> Last updated {fmtDateTime(task.updatedAt)}
                      </p>
                    )}
                  </div>

                  <PriorityMeter score={task.priority} />

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                      navigate("/map", {
                        state: { focusIssueId: task.id, category: task.category, priority: task.priority },
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
                    <Sparkles size={15} className="text-ai" /> AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AIAnalysisCard
                    analysis={{
                      ...task,
                      // Keep the stored human decision in `task.priority` and
                      // render the AI recommendation independently.
                      category: task.aiCategory || task.category,
                      priority: task.aiPriority ?? task.priority,
                      state: task.aiStatus === "pending" ? "pending" : task.aiStatus === "failed" ? "failed" : "complete",
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="Add an operational note for your department…" rows={3} disabled={noteSaving} />
                  <Button size="sm" disabled={noteSaving || internalNote.trim().length < 2} onClick={async () => {
                    setNoteSaving(true);
                    try { await addDepartmentNote(id, internalNote.trim()); setInternalNote(""); toast.success("Note saved"); reload(); }
                    catch { toast.error("Couldn't save the note. Please try again."); }
                    finally { setNoteSaving(false); }
                  }}>{noteSaving ? <Loader2 size={14} className="animate-spin" /> : "Save note"}</Button>
                  {!!task.notes?.length && <div className="space-y-2 border-t pt-3">{task.notes.slice(0, 5).map((note) => <p key={note.id} className="rounded-md bg-muted/30 p-2 text-xs"><span className="font-medium">{note.author || "Staff"}</span> · {fmtDateTime(note.createdAt)}<br />{note.content}</p>)}</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Task Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ActivityTimeline items={activityAsync.data} loading={activityAsync.loading} />
                </CardContent>
              </Card>
            </div>

            {/* Right: staff actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Work Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Current status: <span className="font-medium text-foreground">{statusLabel(task.status)}</span>
                  </p>
                  {nextAction(task.status) ? <>
                    <p className="text-xs text-muted-foreground">Next step: <span className="font-medium text-foreground">{nextAction(task.status)[1]}</span></p>
                    <Button className="mt-1 w-full" onClick={() => setPendingStatus(nextAction(task.status)[0])} disabled={statusSaving}>{statusSaving ? <Loader2 size={14} className="animate-spin" /> : nextAction(task.status)[1]}</Button>
                  </> : <p className="text-sm text-muted-foreground">{task.status === "rejected" ? "This report was rejected and is not active work." : "No further status changes are available."}</p>}
                </CardContent>
              </Card>

              {(task.status === "in_progress" || isCompleted) && <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    <FileText size={15} /> Completion Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <ResolutionUpload existing={task.resolution} onUploaded={handleEvidenceUpload} disabled={isCompleted} />
                  {!isCompleted && (
                    <Textarea
                      placeholder="Optional note, e.g. &ldquo;Road surface repaired and pothole filled.&rdquo;"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={2}
                    />
                  )}
                  {task.resolution?.note && (
                    <p className="rounded-md border bg-muted/30 p-2.5 text-sm text-foreground/90">
                      {task.resolution.note}
                    </p>
                  )}

                  {isCompleted ? (
                    <div className="rounded-md border border-success/25 bg-success/10 p-3 text-sm">
                      <p className="flex items-center gap-1.5 font-medium text-success-foreground">
                        <CheckCircle2 size={14} /> Work completed
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Completed {fmtDateTime(task.resolution?.resolvedAt)}
                        {task.resolution?.resolvedBy && <> by {task.resolution.resolvedBy}</>}
                      </p>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={() => setConfirmComplete(true)}>
                      Mark Work Completed
                    </Button>
                  )}
                </CardContent>
              </Card>}
            </div>
          </div>
        )}
      </div>

      {/* Status change confirmation */}
      <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change status</AlertDialogTitle>
            <AlertDialogDescription>
              {task && pendingStatus && (
                <>
                  <span className="font-medium text-foreground">{statusLabel(task.status)}</span>
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

      {/* Mark completed confirmation */}
      <AlertDialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure this task has been completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the issue as resolved and return it to CivicAI's resolution flow for citizen confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkCompleted} disabled={completing} className={cn(completing && "opacity-70")}>
              {completing && <Loader2 size={14} className="animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthorityLayout>
  );
}
