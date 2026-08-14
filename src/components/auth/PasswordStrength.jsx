import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { passwordRules, passwordStrength } from "@/utils/validation/authValidation";
import { cn } from "@/lib/utils";

const TONES = {
  1: { text: "text-error", bar: "bg-error" },
  2: { text: "text-warning", bar: "bg-warning" },
  3: { text: "text-success", bar: "bg-success" },
};

export function PasswordStrength({ value, showRules = true, className }) {
  const { score, label } = passwordStrength(value);
  const rules = passwordRules(value);
  const tone = TONES[score];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={false}
                animate={{ width: i <= score ? "100%" : "0%" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={cn("h-full rounded-full", i <= score ? tone.bar : "bg-transparent")}
              />
            </div>
          ))}
        </div>
        {label && (
          <span className={cn("w-14 text-right text-xs font-semibold", tone?.text)}>{label}</span>
        )}
      </div>

      {showRules && (
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                rule.met ? "text-success" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  rule.met ? "border-success bg-success/10" : "border-border"
                )}
              >
                {rule.met && <Check size={10} strokeWidth={3} />}
              </span>
              {rule.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
