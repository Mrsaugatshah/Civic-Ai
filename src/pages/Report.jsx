import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ReportLayout } from "@/components/report/ReportLayout";
import { ReportPreview } from "@/components/report/ReportPreview";
import { EvidenceStep } from "@/components/report/EvidenceStep";
import { DescriptionStep } from "@/components/report/DescriptionStep";
import { LocationStep } from "@/components/report/LocationStep";
import { AnalysisStep } from "@/components/report/AnalysisStep";
import { ReviewStep } from "@/components/report/ReviewStep";
import { ReportSuccess } from "@/components/report/ReportSuccess";
import { DraftRecovery } from "@/components/report/DraftRecovery";
import { SubmitError } from "@/components/report/SubmitError";
import { QuickReport } from "@/components/report/QuickReport";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  submitReport,
} from "@/services/report/reportService";
import { getCategory } from "@/services/categories/categoryService";

const STEPS = [
  { title: "Add evidence", subtitle: "Photos, videos, or a voice note help the AI understand the problem." },
  { title: "Describe the issue", subtitle: "A few sentences are enough — the AI drafts the rest." },
  { title: "Pin the location", subtitle: "Drop the pin on the exact spot so the right team finds it." },
  { title: "Report category", subtitle: "Choose the closest category; secure AI analysis starts after submission." },
  { title: "Review & submit", subtitle: "Confirm the citizen-provided information and submit it safely." },
];

const EMPTY_REPORT = { media: [], transcript: "", description: "", location: null };

export function Report() {
  const [searchParams] = useSearchParams();
  const quick = searchParams.get("quick") === "1";

  if (quick) {
    return <QuickReportEntry />;
  }
  return <GuidedReport />;
}

function QuickReportEntry() {
  return <QuickReport />;
}

function GuidedReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState(EMPTY_REPORT);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [edits, setEdits] = useState({});
  const [phase, setPhase] = useState("form"); // form | submitting | success | submitError
  const [submitError, setSubmitError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [draft, setDraft] = useState(null);
  const [restored, setRestored] = useState(false);
  const patchRef = useRef(0);

  useEffect(() => {
    const saved = loadDraft();
    if (saved && saved.touched) {
      setDraft(saved);
    }
    setRestored(true);
  }, []);

  const patchReport = useCallback((patch) => {
    setReport((r) => ({ ...r, ...patch }));
  }, []);

  useEffect(() => {
    if (!restored) return undefined;
    patchRef.current += 1;
    const timer = setTimeout(() => {
      if (phase === "success" || phase === "submitError") {
        saveDraft(null);
        return;
      }
      const hasContent =
        report.media.length > 0 || report.transcript || report.description || report.location || step > 0;
      if (hasContent) {
        saveDraft({ report, step, edits, touched: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [report, step, edits, phase, restored]);

  const continueDraft = () => {
    if (!draft) return;
    setReport(draft.report ?? EMPTY_REPORT);
    setStep(draft.step ?? 0);
    setEdits(draft.edits ?? {});
    setDraft(null);
    toast.info("Draft restored — pick up where you left off.");
  };

  const discardDraft = () => {
    clearDraft();
    setDraft(null);
    setReport(EMPTY_REPORT);
    setStep(0);
  };

  const validateStep = (current) => {
    if (current === 0) {
      const ok =
        report.media.length > 0 || report.transcript.trim() || report.description.trim();
      if (!ok) {
        setErrors({ 0: "Add at least one photo or description so we can understand the problem." });
        return false;
      }
    }
    if (current === 1) {
      const finalDescription = report.description.trim() || report.transcript.trim();
      if (!finalDescription) {
        setErrors({ 1: "Tell us briefly what happened." });
        return false;
      }
      if (finalDescription.length < 10) {
        setErrors({ 1: "Tell us briefly what happened." });
        return false;
      }
      if (!report.description && report.transcript) {
        patchReport({ description: report.transcript.trim() });
        toast.success("We used your voice note as the description.");
      }
    }
    if (current === 2 && !report.location?.confirmed) {
      setErrors({ 2: "Add a location so the appropriate team can respond." });
      return false;
    }
    setErrors((e) => ({ ...e, [current]: undefined }));
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (index) => {
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const analysisDone = Boolean(edits.category);

  const handleSubmit = async () => {
    if (phase === "submitting") return;
    const category = edits.category ?? "other";
    const categoryDefinition = getCategory(category);
    setPhase("submitting");
    setSubmitError("");
    try {
      const result = await submitReport({
        title: categoryDefinition?.label ?? "Civic issue report",
        categoryLabel: categoryDefinition?.label,
        category,
        description: report.description || report.transcript,
        location: report.location,
        media: report.media,
      });
      clearDraft();
      setSubmission({ ...result, categoryKey: category });
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error?.message || "Something went wrong while saving your report.");
      setPhase("submitError");
    }
  };

  const onTrack = () => {
    navigate("/dashboard");
    setTimeout(() => {
      document.getElementById("reports")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const stepContent = (() => {
    switch (step) {
      case 0:
        return (
          <EvidenceStep
            value={report}
            onChange={patchReport}
            error={errors[0]}
            disabled={phase === "submitting"}
          />
        );
      case 1:
        return (
          <DescriptionStep
            value={report.description}
            onChange={(description) => patchReport({ description })}
            transcript={report.transcript}
            error={errors[1]}
            disabled={phase === "submitting"}
          />
        );
      case 2:
        return (
          <LocationStep
            value={report.location}
            onChange={(location) => patchReport({ location })}
            error={errors[2]}
            disabled={phase === "submitting"}
          />
        );
      case 3:
        return (
          <AnalysisStep
            input={{ description: report.description, transcript: report.transcript, location: report.location }}
            edits={edits}
            setEdits={setEdits}
          />
        );
      default:
        return (
          <ReviewStep
            report={report}
            analysis={null}
            edits={edits}
            onJump={jumpTo}
          />
        );
    }
  })();

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar active="Home" />
        <main className="px-4 py-10 sm:px-6">
          <ReportSuccess submission={submission} onTrack={onTrack} onHome={() => navigate("/")} />
        </main>
      </div>
    );
  }

  if (phase === "submitError") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar active="Home" />
        <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <SubmitError message={submitError} onRetry={handleSubmit} onSaveDraft={() => toast.success("Report saved as a draft.")} />
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft size={15} />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar active="Home" />
      <ReportLayout
        step={step}
        title={STEPS[step].title}
        subtitle={STEPS[step].subtitle}
        onBack={step > 0 ? goBack : null}
        onContinue={step < 4 ? goNext : handleSubmit}
        continueLabel={
          step === 4
            ? phase === "submitting"
              ? "Submitting report…"
              : "Confirm & submit"
            : "Continue"
        }
        backLabel={step === 3 ? "Back to location" : "Back"}
        canContinue={step !== 3 || analysisDone}
        busy={phase === "submitting"}
        aside={<ReportPreview report={report} analysis={null} />}
      >
        {stepContent}
      </ReportLayout>

      {step < 4 && (
        <p className="mx-auto mb-10 flex max-w-6xl items-center justify-center gap-1.5 px-4 text-xs text-muted-foreground sm:px-6">
          <Sparkles size={12} className="text-ai" />
          Your progress is saved automatically as you go.
        </p>
      )}

      <DraftRecovery open={Boolean(draft)} onContinue={continueDraft} onDiscard={discardDraft} />
    </div>
  );
}
