import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function AIOrb({ size = 96, className }) {
  return (
    <div
      aria-hidden
      className={cn("ai-orb shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 backdrop-blur-sm"
        style={{ width: size * 0.35, height: size * 0.35 }}
      >
        <Sparkles
          size={size * 0.18}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ai"
          strokeWidth={1.75}
        />
      </div>
    </div>
  );
}

export function AICard({ icon: Icon = Sparkles, badge = "AI Analysis", title, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-ai/30 bg-ai-gradient p-5 shadow-ai-glow",
          className
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ai/20 blur-2xl"
        />
        <div className="relative flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ai/25 bg-background/70 px-2.5 py-1 text-xs font-medium text-ai-foreground">
            <Icon size={12} className="text-ai" />
            {badge}
          </span>
        </div>
        {title && (
          <h4 className="font-display mt-3 text-base font-semibold text-foreground">{title}</h4>
        )}
        <div className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </motion.div>
  );
}
