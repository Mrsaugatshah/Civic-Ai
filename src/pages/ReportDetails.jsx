import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, FileText } from "lucide-react";

import { useAsync } from "@/hooks/useAsync";
import {
  getReport,
  getReportTimeline,
  getResolutionEvidence,
  getCommunityConfirmation,
  confirmResolution,
  submitResolutionFeedback,
} from "@/services/reports/reportsService";

import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { ReportStatusBadge } from "@/components/reports/ReportStatusBadge";
import { AIReportSummary } from "@/components/reports/AIReportSummary";
import { StatusTimeline } from "@/components/reports/StatusTimeline";
import { ReportMedia } from "@/components/reports/ReportMedia";
import { ReportLocation } from "@/components/reports/ReportLocation";
import { ResolutionCard } from "@/components/reports/ResolutionCard";
import { BeforeAfterSlider } from "@/components/reports/BeforeAfterSlider";
import { CommunityConfirmation } from "@/components/reports/CommunityConfirmation";
import { ReportErrorState } from "@/components/reports/ReportErrorState";
import { DetailSkeleton, TimelineSkeleton, BeforeAfterSkeleton } from "@/components/reports/ReportSkeleton";
import { formatShortDate } from "@/components/reports/format";

export function ReportDetails() {
  const { id } = useParams();
  const [openDetails, setOpenDetails] = useState(null);

  const reportAsync = useAsync(() => getReport(id), [id]);
  const timelineAsync = useAsync(() => getReportTimeline(id), [id]);
  const evidenceAsync = useAsync(() => getResolutionEvidence(id), [id]);
  const communityAsync = useAsync(() => getCommunityConfirmation(id), [id]);

  const report = reportAsync.data;

  useEffect(() => {
    if (!["pending", "processing"].includes(report?.aiStatus)) return undefined;
    const timer = window.setInterval(reportAsync.reload, 3000);
    return () => window.clearInterval(timer);
  }, [report?.aiStatus, reportAsync.reload]);
  const resolved = report?.status === "resolved" || report?.status === "closed";

  const handleConfirm = async (verdict) => {
    await confirmResolution(id, verdict);
    communityAsync.reload();
  };

  const handleFeedback = async (payload) => {
    await submitResolutionFeedback(id, payload);
    communityAsync.reload();
  };

  if (reportAsync.error) {
    return (
      <CitizenLayout>
        <ReportErrorState
          title="Unable to load this report"
          message={reportAsync.error.message || "This report may have been removed or the link is incorrect."}
          onRetry={reportAsync.reload}
        />
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/reports"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} />
            My Reports
          </Link>
          {report && <ReportStatusBadge status={report.status} className="px-3 py-1 text-xs" />}
        </div>

        {reportAsync.loading ? (
          <DetailSkeleton />
        ) : (
          report && (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              {/* Main column */}
              <div className="space-y-6 lg:col-span-2">
                <header className="rounded-lg border bg-card p-5 shadow-soft">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FileText size={11} aria-hidden />
                      {report.id}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden />
                      {report.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} aria-hidden />
                      Reported {formatShortDate(report.reportedAt)}
                    </span>
                  </p>
                  <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {report.title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {report.description}
                  </p>
                </header>

                <AIReportSummary report={report} />

                <section className="rounded-lg border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                      Report Progress
                    </h2>
                    <span className="text-xs text-muted-foreground">Updated {report.eta ?? "recently"}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Every step is recorded with the real status and timestamp.
                  </p>
                  <div className="mt-5">
                    {timelineAsync.loading ? (
                      <TimelineSkeleton />
                    ) : (
                      <StatusTimeline
                        steps={timelineAsync.data}
                        selectedKey={openDetails}
                        onSelect={setOpenDetails}
                      />
                    )}
                  </div>
                </section>

                {resolved && (
                  <section className="space-y-6">
                    {report.resolvedDetail && <ResolutionCard report={report} />}
                    {evidenceAsync.loading ? (
                      <BeforeAfterSkeleton />
                    ) : (
                      <section className="rounded-lg border bg-card p-5 shadow-soft">
                        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                          Before &amp; After
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Compare the original report with the resolution evidence.
                        </p>
                        <div className="mt-4">
                          {evidenceAsync.data ? (
                            <BeforeAfterSlider
                              before={evidenceAsync.data.before}
                              after={evidenceAsync.data.after}
                            />
                          ) : (
                            <div className="rounded-lg border border-dashed bg-accent/30 p-6 text-center text-sm text-muted-foreground">
                              Resolution evidence hasn't been uploaded yet.
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </section>
                )}
              </div>

              {/* Side column */}
              <div className="space-y-6">
                <ReportMedia report={report} />
                <ReportLocation report={report} />
                <CommunityConfirmation
                  reportId={report.id}
                  data={communityAsync.data}
                  loading={communityAsync.loading}
                  onConfirm={handleConfirm}
                  onSubmitFeedback={handleFeedback}
                />
              </div>
            </div>
          )
        )}
      </div>
    </CitizenLayout>
  );
}
