import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  X,
  ThumbsUp,
  Send,
  Paperclip,
  Users,
  ShieldCheck,
  Info,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const FEEDBACK_OPTIONS = [
  "Problem still exists",
  "Only partially fixed",
  "New problem appeared",
  "Incorrect resolution",
  "Other",
];

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
};

/* ------------------------------------------------------------------ */
/* Interactive confirmation flow                                        */
/* ------------------------------------------------------------------ */

export function ConfirmationForm({ data, onConfirm, onSubmitFeedback }) {
  const my = data?.myVote ? { verdict: data.myVote === "confirm" ? "yes" : "no" } : null;
  const [step, setStep] = useState(
    my ? (my.verdict === "yes" ? "done_yes" : "done_no") : "ask"
  );
  const [busy, setBusy] = useState(false);
  const [looksGood, setLooksGood] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [extra, setExtra] = useState("");
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef(null);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const handleYes = () =>
    run(async () => {
      await onConfirm("yes");
      setStep("done_yes");
      toast.success("Thanks for confirming!", {
        description: "Your confirmation helps CivicAI verify real-world impact.",
      });
    });

  const handleNo = () =>
    run(async () => {
      await onSubmitFeedback({ category: feedback, text: extra, imageCount: fileName ? 1 : 0 });
      setStep("done_no");
      toast.success("Feedback sent for review", {
        description: "Your feedback has been sent for review.",
      });
    });

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        {step === "ask" && (
          <motion.div key="ask" {...fadeUp}>
            <p className="font-display text-base font-semibold text-foreground">
              Is this issue actually resolved?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your confirmation helps CivicAI understand whether the problem has really been
              fixed. It's completely optional.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button onClick={() => setStep("yes")} disabled={busy}>
                <Check size={15} />
                Yes, it's resolved
              </Button>
              <Button variant="outline" onClick={() => setStep("feedback")} disabled={busy}>
                <X size={15} />
                Not yet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("feedback")}
                className="text-muted-foreground"
              >
                Something still needs attention
              </Button>
            </div>
          </motion.div>
        )}

        {step === "yes" && (
          <motion.div key="yes" {...fadeUp} className="rounded-md border border-success/25 bg-success/5 p-4">
            <p className="font-display text-base font-semibold text-foreground">
              Thanks for confirming!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your confirmation helps improve community reporting accuracy.
            </p>
            <Button
              variant={looksGood ? "secondary" : "outline"}
              size="sm"
              className="mt-3"
              onClick={() => setLooksGood((v) => !v)}
              aria-pressed={looksGood}
            >
              <ThumbsUp size={14} className={cn(looksGood && "text-success")} />
              {looksGood ? "Looks good — noted" : "Looks good"}
            </Button>
            <div className="mt-4">
              <Button size="sm" onClick={handleYes} disabled={busy}>
                <Send size={14} />
                {busy ? "Submitting…" : "Submit Confirmation"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "feedback" && (
          <motion.div key="feedback" {...fadeUp} className="rounded-md border bg-accent/30 p-4">
            <p className="font-display text-base font-semibold text-foreground">
              Tell us what still needs attention
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback is sent to the responsible department for review.
            </p>

            <RadioGroup
              value={feedback ?? undefined}
              onValueChange={setFeedback}
              className="mt-4 space-y-2"
            >
              {FEEDBACK_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`feedback-${option}`} />
                  <Label htmlFor={`feedback-${option}`} className="text-sm text-foreground">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-4">
              <Label htmlFor="feedback-extra" className="text-sm">
                What is still wrong?
              </Label>
              <Textarea
                id="feedback-extra"
                rows={3}
                value={extra}
                onChange={(event) => setExtra(event.target.value)}
                placeholder="Optional — describe what still needs attention…"
                className="mt-1.5"
              />
            </div>

            <div className="mt-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach a photo (optional)"
              >
                <Paperclip size={14} />
                {fileName ? `Attached: ${fileName}` : "Attach a photo"}
              </Button>
              {fileName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileName(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="mt-4">
              <Button size="sm" onClick={handleNo} disabled={busy || !feedback}>
                <Send size={14} />
                {busy ? "Sending…" : "Submit Feedback"}
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                This won't automatically reopen the issue — the department reviews it first.
              </p>
            </div>
          </motion.div>
        )}

        {step === "done_yes" && (
          <motion.div key="done-yes" {...fadeUp} className="rounded-md border border-success/25 bg-success/5 p-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <BadgeCheck size={18} className="text-success" aria-hidden />
              Confirmed by you
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Thanks for helping CivicAI verify real-world impact.
            </p>
          </motion.div>
        )}

        {step === "done_no" && (
          <motion.div key="done-no" {...fadeUp} className="rounded-md border bg-accent/30 p-4">
            <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <AlertTriangle size={18} className="text-warning" aria-hidden />
              Feedback sent
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Your feedback has been sent for review. The responsible department will follow up.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Community aggregate + confidence                                     */
/* Anonymous by design — only counts are shown.                        */
/* ------------------------------------------------------------------ */

function CommunityAggregate({ data }) {
  if (!data) return null;
  const total = Number(data.confirmed || 0) + Number(data.rejected || 0);
  const pct = total
    ? Math.min(100, Math.round((data.confirmed / total) * 100))
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h4 className="font-display text-sm font-semibold text-foreground">Community Confirmation</h4>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <p className="inline-flex items-center gap-1.5 text-foreground">
            <Users size={14} className="text-success" aria-hidden />
            <strong className="font-semibold">{data.confirmed} citizens confirmed</strong>
          </p>
          <p className="inline-flex items-center gap-1.5 text-muted-foreground">
            <X size={14} className="text-warning" aria-hidden />
            {data.rejected} citizens reported the issue still exists
          </p>
        </div>
        {total > 0 ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={pct} indicatorClassName="bg-success" className="h-2 flex-1" />
              <span className="shrink-0 font-display text-sm font-semibold text-foreground">
                {data.confirmed} / {total}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{pct}% community legitimacy</p>
          </>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">No community verification yet.</p>
        )}
      </div>

      {data.confidence != null && (
        <div className="rounded-md border bg-background p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldCheck size={13} className="text-brand" aria-hidden />
            Community Resolution Confidence
          </p>
          <p className="font-display mt-1 text-3xl font-bold tracking-tight text-success">
            {data.confidence}%
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Most recent community confirmations indicate that the issue has been resolved.
          </p>
          <p className="mt-2 inline-flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
            This is an indicator from community feedback, not absolute truth.
          </p>
        </div>
      )}
    </div>
  );
}

export function CommunityConfirmation({ reportId, data, loading, onConfirm, onSubmitFeedback }) {
  const canVote = data?.canVote !== false;
  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft">
      <h3 className="font-display text-sm font-semibold text-foreground">
        Community Confirmation
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Anonymous feedback from neighbors who saw this issue.
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : data && canVote ? (
          <ConfirmationForm
            reportId={reportId}
            data={data}
            onConfirm={onConfirm}
            onSubmitFeedback={onSubmitFeedback}
          />
        ) : data ? (
          <div className="rounded-md border bg-accent/30 p-4 text-sm text-muted-foreground">
            You cannot verify your own report. Other citizens can help confirm whether it is legitimate.
          </div>
        ) : null}
      </div>

      <div className="mt-5 border-t pt-5">
        <CommunityAggregate data={data} />
      </div>
    </section>
  );
}
