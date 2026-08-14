import { motion, AnimatePresence } from "framer-motion";
import { CircleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormField({ id, label, hint, error, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            id={`${id}-error`}
            role="alert"
            className="flex items-start gap-1.5 text-xs font-medium text-error"
          >
            <CircleAlert size={13} className="mt-px shrink-0" />
            <span>{error}</span>
          </motion.p>
        ) : hint ? (
          <p key="hint" id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export { FormField as Field };
