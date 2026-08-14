import { motion } from "framer-motion";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AuthLogo } from "./AuthLogo";
import { cn } from "@/lib/utils";

const FLOATERS = [
  {
    icon: MapPin,
    title: "Pothole reported",
    meta: "Ward 11 · now",
    tone: "text-warning",
    className: "left-[8%] top-[30%]",
    delay: "0s",
  },
  {
    icon: Sparkles,
    title: "AI priority · 92",
    meta: "ranked #1 of 214",
    tone: "text-ai-light",
    className: "right-[10%] top-[24%]",
    delay: "0.8s",
  },
  {
    icon: TrendingUp,
    title: "Fixed this week",
    meta: "118 issues resolved",
    tone: "text-success-light",
    className: "left-[12%] bottom-[26%]",
    delay: "1.6s",
  },
  {
    icon: Lightbulb,
    title: "Streetlight · done",
    meta: "Green Lane",
    tone: "text-brand-light",
    className: "right-[12%] bottom-[30%]",
    delay: "0.4s",
  },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-dark via-[#1D3E8A] to-ai-deep lg:flex">
      {/* Grid + glow washes */}
      <div className="bg-grid absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(80%_80%_at_50%_40%,black,transparent)]" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-ai/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      {/* Twinkling dots */}
      {[
        ["8%", "16%", 3, "0s"],
        ["26%", "10%", 2, "0.9s"],
        ["72%", "12%", 3, "1.7s"],
        ["88%", "26%", 2, "0.5s"],
        ["18%", "48%", 2, "2.1s"],
      ].map(([left, top, size, delay], i) => (
        <span
          key={i}
          aria-hidden
          className="absolute animate-twinkle rounded-full bg-white/70"
          style={{ left, top, width: size, height: size, animationDelay: delay }}
        />
      ))}

      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <AuthLogo variant="light" />

        <div className="py-12">
          <h2 className="font-display max-w-md text-4xl font-bold leading-tight tracking-tight text-white text-balance xl:text-5xl">
            Better cities start with people who care.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-primary-light/90 text-pretty">
            Report problems, track progress, and help your community become
            smarter and safer.
          </p>

          {/* Floating issue markers */}
          <div className="relative mt-12 h-64">
            {FLOATERS.map(({ icon: Icon, title, meta, tone, className, delay }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn("absolute animate-float", className)}
                style={{ animationDelay: delay }}
              >
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 shadow-card backdrop-blur-md">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                    <Icon size={14} className={tone} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="text-[10px] text-white/70">{meta}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* AI orb accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              aria-hidden
              className="ai-orb absolute right-[16%] top-[12%] h-20 w-20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <ShieldCheck size={13} className="text-brand-light" />
            Your data stays with the city
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <Zap size={13} className="text-ai-light" />
            SDG 11 · Sustainable cities
          </span>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[45fr_55fr]">
      <BrandPanel />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute inset-x-0 top-0 flex justify-center pt-6 lg:hidden">
          <AuthLogo />
        </div>

        <div className="w-full max-w-[440px] pt-12 lg:pt-0">
          {children}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Protected with secure, server-side authentication
        </p>
      </main>
    </div>
  );
}
