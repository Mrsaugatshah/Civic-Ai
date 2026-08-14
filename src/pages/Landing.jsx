import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  Bot,
  Wrench,
  Route,
  Zap,
  BarChart3,
  Users,
  FileWarning,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  MapPin,
  Building2,
  Landmark,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CityPreview } from "@/components/landing/CityPreview";
import { StatCard } from "@/components/civic/StatCard";
import { AICard } from "@/components/civic/AICard";
import { PriorityMeter } from "@/components/civic/PriorityMeter";
import { clearSignedOut } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1];

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description, align = "center", className }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}

function Metric({ label, value, tone = "default" }) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    info: "text-info-foreground",
    error: "text-error-foreground",
    ai: "text-ai",
  }[tone];

  return (
    <div className="rounded-lg border bg-background/60 px-3 py-2.5 text-center">
      <p className={cn("font-display text-base font-bold", toneClass)}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function AiScore({ score = 94 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(reduce ? score : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(score);
      return undefined;
    }
    const controls = animate(0, score, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, score]);

  return (
    <div ref={ref} className="flex items-end justify-between gap-4">
      <p className="font-display text-4xl font-bold ai-gradient-text">
        {value}
        <span className="text-lg text-muted-foreground">/100</span>
      </p>
      <PriorityMeter score={value} className="flex-1" />
    </div>
  );
}

const TRUSTED = [
  { icon: Building2, name: "Bharatpur Metro" },
  { icon: Landmark, name: "Ward 11 Office" },
  { icon: Building2, name: "City Transit" },
  { icon: Wrench, name: "Public Works" },
  { icon: Lightbulb, name: "Streetlight Dept" },
];

const PROBLEMS = [
  {
    icon: FileWarning,
    tone: "bg-error/10 text-error",
    title: "Lost reports",
    description: "Observations slip through inboxes and never reach the right desk.",
  },
  {
    icon: Users,
    tone: "bg-warning/10 text-warning",
    title: "Duplicate complaints",
    description: "The same issue gets reported again and again, splitting attention.",
  },
  {
    icon: TrendingUp,
    tone: "bg-info/10 text-info",
    title: "Slow prioritization",
    description: "Urgent issues wait behind the loudest ones when nothing is ranked.",
  },
];

const STEPS = [
  {
    icon: Camera,
    title: "Report",
    description: "Share a problem with a photo, voice note, or just your location.",
  },
  {
    icon: Bot,
    title: "Understand",
    description: "AI reads the report — category and severity in seconds.",
  },
  {
    icon: Zap,
    title: "Prioritize",
    description: "Every issue scores 0–100, so the urgent one rises first.",
  },
  {
    icon: CheckCircle2,
    title: "Resolve",
    description: "Departments act, and citizens confirm the fix.",
  },
];

const IMPACT_FLOW = [
  { icon: Camera, tone: "bg-info/10 text-info", text: "Citizen submits a report", meta: "from a signed-in account" },
  { icon: Sparkles, tone: "bg-ai/10 text-ai", text: "AI classifies and prioritizes it", meta: "reviewable by people" },
  { icon: Wrench, tone: "bg-warning/10 text-warning", text: "The responsible department reviews it", meta: "with tracked status updates" },
  { icon: Users, tone: "bg-success/10 text-success", text: "The citizen follows its progress", meta: "from their dashboard" },
];

const FEATURES = [
  {
    icon: Route,
    title: "One city map, live",
    description:
      "Every open issue on one map — what's nearby and what's being fixed.",
  },
  {
    icon: Bot,
    title: "AI-powered understanding",
    description:
      "Photo, text, and location are read together. Categories and duplicates are detected automatically.",
  },
  {
    icon: Zap,
    title: "Priority queue",
    description:
      "Each issue scores 0–100, so the most urgent work always rises to the top.",
  },
  {
    icon: BarChart3,
    title: "Transparent progress",
    description:
      "Every report has a status citizens can follow from submitted to resolved.",
  },
];

const FAQ = [
  {
    q: "Do I need an account to report an issue?",
    a: "Yes. Sign in with a citizen account so your report can be tracked, updated, and shown in your dashboard.",
  },
  {
    q: "How does the AI decide what to fix first?",
    a: "Each issue is scored on severity, nearby duplicates, location context like schools or hospitals, and how long it's been open.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Reports are shared only with the relevant city department. Nothing is sold, and you can report without revealing who you are.",
  },
  {
    q: "How do city authorities use the queue?",
    a: "Authorities see a single, AI-ranked list. Each item explains why it ranks where it does, so crews know what they're walking into.",
  },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const reduceMotion = useReducedMotion();
  const submittedReports = [];
  const resolvedReports = submittedReports.filter((report) => ["resolved", "closed"].includes(report.status));
  const activeReports = submittedReports.length - resolvedReports.length;
  const representedCategories = new Set(submittedReports.map((report) => report.category)).size;

  // After a logout the session clears while the (possibly stale) route guard
  // is still mounted; it redirects to "/". Once we land here, reset the flag
  // so future visits to protected routes route to /login again.
  useEffect(() => {
    clearSignedOut();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(75%_60%_at_50%_20%,black,transparent)]" />
        <div aria-hidden className="absolute left-[72%] top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-16 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles size={13} aria-hidden />
              AI-Powered Civic Intelligence
            </div>
            <h1 className="font-display mt-5 text-display font-bold tracking-tight text-foreground text-balance">
              Report it once.
              <span className="block ai-gradient-text">See action faster.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Turn a photo, description, and location into a structured civic report—routed to the right department and easy to track.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/report">
                  <MapPin size={16} />
                  Report a Problem
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="group">
                <a href="#ai">
                  Explore CivicAI
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-fast group-hover:translate-x-0.5"
                  />
                </a>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
                CivicAI systems operational
              </span>
              <span>Built for safer, cleaner, smarter communities.</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/80">
                Citizen sign-in required · Progress saved automatically
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12, ease: EASE }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-ai/10 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card/90 shadow-lift backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live issue triage</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Road damage · Narayani Path</p>
                </div>
                <Badge className="shrink-0 bg-error/10 text-error hover:bg-error/10">High priority</Badge>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <Metric label="AI confidence" value="94%" tone="ai" />
                  <Metric label="Similar reports" value="6" tone="info" />
                  <Metric label="Priority" value="92/100" tone="error" />
                </div>
                <div className="rounded-xl border bg-background/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested routing</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success-foreground"><CheckCircle2 size={13} /> Ready</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Wrench size={18} /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Public Works Department</p>
                      <p className="text-xs text-muted-foreground">Road maintenance · Ward 11</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-muted-foreground">
                  {["Reported", "Analyzed", "Assigned", "Resolved"].map((step, index) => (
                    <div key={step}>
                      <span className={cn("mx-auto mb-2 block h-2.5 w-2.5 rounded-full ring-4", index < 3 ? "bg-primary ring-primary/10" : "bg-muted-foreground/30 ring-muted")} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Illustrative demo · Decisions remain reviewable by people</p>
          </motion.div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Report <ArrowRight size={12} /> Understand <ArrowRight size={12} /> Prioritize{" "}
            <ArrowRight size={12} /> Act
          </p>
        </div>
      </section>

      {/* --------------------------- Trusted strip ------------------------ */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Piloted with city departments
          </p>
          <div className="mt-4 grid grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {TRUSTED.map(({ icon: Icon, name }) => (
              <div
                key={name}
                className="flex items-center justify-center gap-2 text-muted-foreground opacity-70"
              >
                <Icon size={18} className="shrink-0 text-primary/60" />
                <span className="text-sm font-semibold tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Problem ------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              The problem
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Cities have problems. The hard part is knowing what to fix first.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
              Right now, a broken streetlight, a burst pipe, and a blocked
              drain sit in the same inbox — and nobody knows which one is most
              urgent. Residents feel ignored. Departments feel overwhelmed.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid gap-3">
              {PROBLEMS.map(({ icon: Icon, tone, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors duration-fast hover:border-primary/25"
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone)}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------- How it works ------------------------- */}
      <section id="how-it-works" className="scroll-mt-20 border-t bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="From Report to Resolution"
              description="One loop that connects the person who sees the problem to the crew that fixes it."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 0.08} className="relative">
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    size={16}
                    className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-muted-foreground/40 lg:block"
                  />
                )}
                <Card className="card-lift relative h-full overflow-hidden">
                  <span
                    aria-hidden
                    className="font-display absolute -right-1 -top-4 select-none text-[64px] font-bold leading-none text-accent/70"
                  >
                    {i + 1}
                  </span>
                  <CardContent className="relative space-y-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- AI showcase -------------------------- */}
      <section id="ai" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-2xl border border-ai/20 bg-ai-gradient p-6 shadow-ai-glow sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-ai/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-ai/15 blur-3xl"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-ai-deep">
                The AI priority engine
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
                AI that knows{" "}
                <span className="ai-gradient-text">what matters first</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
                Every report gets a priority score, and every score comes with
                a reason. The dangerous pothole outside the school outranks the
                flickering light in the park — because the data says so.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Severity", "Duplicates", "Location context", "Time open"].map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs font-normal">
                    {label}
                  </Badge>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-4">
                <AICard badge="AI Analysis" title="Road Damage · Main Road">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Metric label="Severity" value="High" tone="warning" />
                      <Metric label="Public impact" value="92" tone="info" />
                      <Metric label="Safety risk" value="88" tone="error" />
                    </div>
                    <div className="flex flex-col gap-3 rounded-lg border border-ai/15 bg-white/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        AI priority score
                      </p>
                      <AiScore score={94} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Severity + Reports + Location + Public Impact
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Cracked asphalt outside the school gate, six duplicate
                        reports in 48 hours, and heavy morning traffic pushed
                        this to the top of the queue.
                      </p>
                    </div>
                  </div>
                </AICard>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button asChild>
                    <Link to="/report">
                      <Sparkles size={15} />
                      See How AI Works
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Illustrative demo analysis — not live data.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------ Live city preview ----------------------- */}
      <section className="scroll-mt-20 border-t bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="City map"
              title="See your city at a glance"
              description="Road, water, waste, and lighting — the way CivicAI surfaces what's happening around town."
            />
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <CityPreview />
          </Reveal>
        </div>
      </section>

      {/* -------------------------- Impact + Community -------------------- */}
      <section id="impact" className="scroll-mt-20 border-t py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Impact"
              title="From reports to real-world change"
              description="Live totals are calculated only from reports submitted through CivicAI."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0}>
              <StatCard
                icon={FileWarning}
                label="Citizen reports"
                value={submittedReports.length}
                hint={submittedReports.length ? "submitted through CivicAI" : "no reports submitted yet"}
                animate
              />
            </Reveal>
            <Reveal delay={0.1}>
              <StatCard
                icon={CheckCircle2}
                label="Issues resolved"
                value={resolvedReports.length}
                tone="success"
                hint={resolvedReports.length ? "from submitted reports" : "no resolved reports yet"}
                animate
              />
            </Reveal>
            <Reveal delay={0.2}>
              <StatCard
                icon={TrendingUp}
                label="Active reports"
                value={activeReports}
                tone="ai"
                hint={activeReports ? "awaiting action or in progress" : "no active reports"}
                animate
              />
            </Reveal>
            <Reveal delay={0.3}>
              <StatCard
                icon={Users}
                label="Categories represented"
                value={representedCategories}
                tone="brand"
                hint={representedCategories ? "from real submissions" : "categories appear after reporting"}
                animate
              />
            </Reveal>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-10">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border bg-card p-6 sm:p-8">
                <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                  How reports move through CivicAI
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The workflow below describes the process, not a fake report.
                </p>
                <ol className="mt-6">
                  {IMPACT_FLOW.map(({ icon: Icon, tone, text, meta }, i) => (
                    <li key={text} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < IMPACT_FLOW.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute left-[19px] top-11 h-[calc(100%-1.5rem)] w-px bg-border"
                        />
                      )}
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          tone
                        )}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-foreground">{text}</p>
                        <p className="text-xs text-muted-foreground">{meta}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex h-full flex-col justify-center rounded-2xl border bg-card p-6 sm:p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <HeartHandshake size={18} />
                </span>
                <h3 className="font-display mt-4 text-xl font-bold tracking-tight text-foreground">
                  Better cities start with people who care.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Every report is one person's observation. Together, they form
                  a clearer picture of what a community needs — and CivicAI
                  turns that attention into action.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mt-10">
            <p className="text-center text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success align-middle animate-pulse-soft" />{" "}
              Live totals update when citizens submit reports.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- Features ---------------------------- */}
      <section id="platform" className="scroll-mt-20 border-t bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Product"
              title="Everything a working city needs"
              description="Built for residents and authorities alike — one calm, honest product instead of a dozen portals."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.08}>
                <Card className="card-lift h-full">
                  <CardContent className="space-y-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-ai-deep">
                      <Icon size={18} />
                    </span>
                    <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------ */}
      <section id="get-started" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary-hover to-primary px-6 py-12 text-center shadow-lift sm:px-12">
            <div className="bg-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
            <div className="relative mx-auto max-w-2xl">
              <p className="font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
                See a problem? Help fix it.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-primary-light/90 text-pretty">
                Report it, and CivicAI makes sure it lands where it matters.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" variant="secondary" asChild className="bg-white text-primary-dark hover:bg-white/90">
                  <Link to="/report">
                    <MapPin size={16} />
                    Report a Problem
                  </Link>
                </Button>
                <Button size="lg" asChild className="group border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                  <Link to="/map">
                    Explore the Platform
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-fast group-hover:translate-x-0.5"
                    />
                  </Link>
                </Button>
              </div>
              <p className="mt-5 text-xs text-primary-light/80">
                Free for residents · Free for small municipalities · No card needed
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------- FAQ ------------------------------ */}
      <section id="faq" className="scroll-mt-20 border-t bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          </Reveal>

          <div className="mt-10 space-y-3">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <div
                  className={cn(
                    "rounded-lg border bg-background shadow-soft transition-colors duration-base",
                    openFaq === i && "border-primary/30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground"
                  >
                    {item.q}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "shrink-0 text-muted-foreground transition-transform duration-base",
                        openFaq === i && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
