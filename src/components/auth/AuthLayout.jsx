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

          <div className="relative mt-12 flex h-48 items-center justify-center gap-5" aria-hidden>
            {[MapPin, Sparkles, TrendingUp, Lightbulb].map((Icon, index) => (
              <motion.span key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-primary-light shadow-card backdrop-blur-md">
                <Icon size={22} />
              </motion.span>
            ))}
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
