import { motion } from "framer-motion";
import { Mail, Clock3, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = {
  info: {
    icon: Mail,
    panel: "border-ai/25 bg-ai-gradient",
    iconBox: "bg-ai/10 text-ai-deep",
  },
  pending: {
    icon: Clock3,
    panel: "border-warning/25 bg-warning-light/40",
    iconBox: "bg-warning/10 text-warning-foreground",
  },
  verified: {
    icon: ShieldCheck,
    panel: "border-success/25 bg-success-light/40",
    iconBox: "bg-success/10 text-success-foreground",
  },
};

export function VerificationNotice({ tone = "info", title, description, actions, className }) {
  const cfg = TONES[tone];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("rounded-xl border p-6", cfg.panel, className)}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            cfg.iconBox
          )}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {actions && <div className="mt-4">{actions}</div>}
        </div>
      </div>
    </motion.div>
  );
}
