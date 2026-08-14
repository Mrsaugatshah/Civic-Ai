import { Landmark } from "lucide-react";

import { cn } from "@/lib/utils";

export function AuthLogo({ variant = "dark", className }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-soft">
        <Landmark size={18} strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          variant === "light" ? "text-white" : "text-foreground"
        )}
      >
        Civic<span className={variant === "light" ? "text-ai-light" : "text-primary"}>AI</span>
      </span>
    </div>
  );
}
