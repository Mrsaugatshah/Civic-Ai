import { motion } from "framer-motion";
import { CircleAlert, WifiOff, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = {
  error: {
    wrap: "border-error/25 bg-error-light/60 text-error-foreground",
    icon: CircleAlert,
  },
  warning: {
    wrap: "border-warning/25 bg-warning-light/60 text-warning-foreground",
    icon: Clock,
  },
  info: {
    wrap: "border-info/25 bg-info-light/60 text-info-foreground",
    icon: CircleAlert,
  },
};

export function ErrorMessage({ children, network, tone = "error", className }) {
  if (!children) return null;
  const cfg = TONES[network ? "warning" : tone];
  const Icon = network ? WifiOff : cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm",
        cfg.wrap,
        className
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </motion.div>
  );
}
