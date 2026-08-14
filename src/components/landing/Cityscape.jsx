import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

const FAR = [16, 24, 20, 32, 18, 28, 22, 36, 14, 26, 30, 20, 24, 18, 32, 28];
const NEAR = [24, 32, 28, 40, 22, 36, 30, 46, 26, 34, 28, 38, 22, 30, 38, 26];

const PINS = [
  { left: "13%", top: "24%", label: "Water leak", tone: "text-info", dot: "bg-info", delay: "0s" },
  { left: "39%", top: "16%", label: "Streetlight", tone: "text-warning", dot: "bg-warning", delay: "1.2s" },
  { left: "63%", top: "28%", label: "Pothole", tone: "text-error", dot: "bg-error", delay: "0.6s" },
  { left: "85%", top: "20%", label: "Waste", tone: "text-brand", dot: "bg-brand", delay: "1.8s" },
];

const STARS = [
  { left: "8%", top: "14%", size: 3, delay: "0s" },
  { left: "22%", top: "6%", size: 2, delay: "0.8s" },
  { left: "45%", top: "10%", size: 3, delay: "1.6s" },
  { left: "68%", top: "4%", size: 2, delay: "0.4s" },
  { left: "88%", top: "12%", size: 3, delay: "2.2s" },
  { left: "56%", top: "20%", size: 2, delay: "1.1s" },
  { left: "32%", top: "24%", size: 2, delay: "0.2s" },
];

function windowPattern(size, tint) {
  return {
    backgroundImage: `radial-gradient(circle at 3px 3px, ${tint} 1.5px, transparent 1.5px)`,
    backgroundSize: `${size} ${size * 1.4}px`,
  };
}

export function Cityscape({ className }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const farX = useTransform(mx, [-0.5, 0.5], [12, -12]);
  const farY = useTransform(my, [-0.5, 0.5], [4, -4]);
  const nearX = useTransform(mx, [-0.5, 0.5], [26, -26]);
  const nearY = useTransform(my, [-0.5, 0.5], [8, -8]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div
      aria-hidden
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className={cn(
        "relative h-72 w-full select-none overflow-hidden sm:h-80 md:h-96",
        className
      )}
    >
      {/* Sky wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-[#E0E7FF] to-[#DBEAFE]" />

      {/* Blueprint grid */}
      <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_60%)]" />

      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-ai/70"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* Far skyline */}
      <motion.div
        style={{ x: farX, y: farY }}
        className="absolute inset-x-0 bottom-8 flex h-[38%] items-end gap-1 px-1 opacity-70"
      >
        {FAR.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-slate-300/70 to-slate-200/50"
            style={{ height: `${h}%` }}
          />
        ))}
      </motion.div>

      {/* Near skyline */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        className="absolute inset-x-0 bottom-8 flex h-[52%] items-end gap-1 px-1"
      >
        {NEAR.map((h, i) => {
          const lit = i % 3 === 0;
          return (
            <div
              key={i}
              className="relative flex-1 rounded-t-sm bg-gradient-to-t from-slate-400/80 to-slate-300/80"
              style={{ height: `${h}%` }}
            >
              <div className="absolute inset-0" style={windowPattern(9, "rgba(148,163,184,0.9)")} />
              {lit && (
                <div
                  className="absolute inset-0"
                  style={windowPattern(9, "rgba(245,158,11,0.7)")}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* AI scan sweep */}
      <div className="absolute inset-x-0 top-0 h-full animate-sweep">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-ai/80 to-transparent shadow-[0_0_12px_2px_rgba(99,102,241,0.35)]" />
      </div>

      {/* Floating issue pins — quiet pulse, no drift */}
      {PINS.map((p, i) => (
        <span
          key={i}
          className="absolute flex items-center gap-1.5 rounded-full border border-border bg-white/95 px-2 py-1 shadow-soft backdrop-blur-sm"
          style={{ left: p.left, top: p.top }}
        >
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span
              className={cn("absolute h-3.5 w-3.5 animate-pulse-soft rounded-full opacity-30", p.dot)}
              style={{ animationDelay: p.delay }}
            />
            <MapPin size={12} className={cn("relative", p.tone)} />
          </span>
          <span className="text-[10px] font-medium text-slate-600">{p.label}</span>
        </span>
      ))}

      {/* Road */}
      <div className="absolute inset-x-0 bottom-0 h-8 border-t border-slate-300 bg-gradient-to-b from-slate-200 to-slate-100">
        <svg
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2"
        >
          <line
            x1="0"
            y1="12"
            x2="1200"
            y2="12"
            strokeWidth="4"
            strokeDasharray="12 12"
            className="animate-dash stroke-slate-400"
          />
        </svg>
      </div>

      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
