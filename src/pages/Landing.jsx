import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Camera,
  ChevronDown,
  Eye,
  Route,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { clearSignedOut, useAuth } from "@/contexts/AuthContext";
import { reportDestination, reportDestinationState } from "@/utils/reportNavigation";

const STEPS = [
  [Camera, "Report", "Submit a photo, description and location."],
  [Bot, "Analyze", "AI helps categorize and prioritize the issue."],
  [Route, "Route", "The report reaches the appropriate department."],
  [Eye, "Track", "Follow progress until completion."],
];

const FEATURES = [
  [Bot, "Smart Reporting", "AI-assisted categorization and prioritization."],
  [Users, "Community Verification", "Registered citizens can Agree or Disagree with reports."],
  [Eye, "Transparent Tracking", "Follow issues from submission to completion."],
];

const FAQ = [
  ["Who can submit a report?", "Anyone can submit a report through the guest flow. Create an account to verify community issues and keep a report history."],
  ["How does CivicAI prioritize reports?", "AI considers the report details and location to help categorize and prioritize it. Authorities review the result."],
  ["Can I track my report?", "Yes. Signed-in citizens can follow reports from their dashboard, and guest reporters can use their private tracking token."],
];

function Reveal({ children, delay = 0, className = "" }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const reportTarget = reportDestination(isAuthenticated ? user : null);
  const reportState = reportDestinationState(isAuthenticated ? user : null);
  const communityTarget = isAuthenticated ? "/issues" : "/map";

  useEffect(() => {
    clearSignedOut();
  }, []);

  return (
    <div className="app-page min-h-screen overflow-x-clip bg-background">
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden border-b">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(75%_70%_at_50%_10%,black,transparent)]" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <Reveal>
              <p className="text-sm font-semibold text-primary">A clearer way to improve your community</p>
              <h1 className="font-display mt-4 text-5xl font-bold tracking-tight text-foreground text-balance sm:text-6xl">Report civic issues.<span className="block text-primary">See real action.</span></h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">Report problems with a photo and location. CivicAI helps route them to the right place and keeps you updated.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" asChild><Link to={reportTarget} state={reportState}>Report an Issue <ArrowRight size={16} /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link to={communityTarget}>View Community Issues</Link></Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="how-it-works" className="landing-section scroll-mt-20 border-b bg-card py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal><SectionHeading eyebrow="How it works" title="A simple path from report to resolution" /></Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([Icon, title, description], index) => <Reveal key={title} delay={index * 0.06}><div className="relative h-full rounded-xl border bg-background p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={19} /></span><p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">0{index + 1}</p><h3 className="mt-1 font-display text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div></Reveal>)}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6"><Reveal><SectionHeading eyebrow="Features" title="Built for useful civic action" /></Reveal><div className="mt-10 grid gap-4 md:grid-cols-3">{FEATURES.map(([Icon, title, description], index) => <Reveal key={title} delay={index * 0.06}><div className="h-full rounded-xl border bg-card p-6 shadow-soft"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary"><Icon size={20} /></span><h3 className="mt-5 font-display text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div></Reveal>)}</div></div>
        </section>

        <section id="community" className="landing-section scroll-mt-20 border-b bg-card py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-20"><Reveal><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Community verification</p><h2 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Community-verified issues</h2><p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">Residents can help confirm civic problems and provide authorities with another prioritization signal.</p><Link to="/issues" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Explore community issues <ArrowRight size={15} /></Link></Reveal><Reveal delay={0.1}><div className="rounded-2xl border bg-background p-5 shadow-soft sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reported issue</p><h3 className="mt-2 font-display text-lg font-semibold">Pothole near Ward 11</h3></div><span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Community Supported</span></div><div className="mt-6 flex flex-wrap gap-3"><span className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"><span aria-hidden>👍</span> Agree <strong>14</strong></span><span className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"><span aria-hidden>👎</span> Disagree <strong>3</strong></span></div></div></Reveal></div>
        </section>

        <section className="border-b py-16 sm:py-20"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6"><Reveal><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Made for communities</p><h2 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Designed for local communities and municipalities.</h2><p className="mt-4 text-muted-foreground">Clear reports, better routing, and progress people can see.</p></Reveal></div></section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"><Reveal><div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12"><h2 className="font-display text-3xl font-bold sm:text-4xl">See a problem in your community?</h2><p className="mt-3 text-primary-foreground/80">Report it in minutes.</p><Button size="lg" variant="secondary" asChild className="mt-7"><Link to={reportTarget} state={reportState}>Report an Issue <ArrowRight size={16} /></Link></Button></div></Reveal></section>

        <section id="faq" className="landing-section scroll-mt-20 border-t bg-card py-16 sm:py-20"><div className="mx-auto max-w-3xl px-4 sm:px-6"><Reveal><SectionHeading eyebrow="FAQ" title="Questions, answered" /></Reveal><div className="mt-8 space-y-3">{FAQ.map(([question, answer], index) => <Reveal key={question} delay={index * 0.05}><div className="rounded-xl border bg-background"><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"><span>{question}</span><ChevronDown size={17} className={`shrink-0 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p></motion.div>}</AnimatePresence></div></Reveal>)}</div></div></section>
      </main>
      <LandingFooter />
    </div>
  );
}
