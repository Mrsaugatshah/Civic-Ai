import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function SuccessMessage({ children, className }) {
  if (!children) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-success/25 bg-success-light/60 px-4 py-3 text-sm text-success-foreground",
        className
      )}
    >
      <CircleCheck size={16} className="mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </motion.div>
  );
}
