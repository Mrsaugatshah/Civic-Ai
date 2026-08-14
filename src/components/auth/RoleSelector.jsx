import { Users } from "lucide-react";

import { FormField } from "./FormField";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    value: "citizen",
    icon: Users,
    title: "Citizen",
    description: "Report issues and track community impact.",
  },
];

export function RoleSelector({ value, onChange, error, className }) {
  return (
    <FormField
      id="role"
      label="I am a…"
      error={error}
      className={className}
    >
      <div role="radiogroup" aria-label="Account type" className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ value: val, icon: Icon, title, description }) => {
          const selected = value === val;
          return (
            <label
              key={val}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition-all duration-fast focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                selected
                  ? "border-primary bg-primary-light/60 ring-1 ring-primary/30"
                  : "hover:border-primary/40"
              )}
            >
              <input
                type="radio"
                name="role"
                value={val}
                checked={selected}
                onChange={() => onChange(val)}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  selected ? "bg-primary text-primary-foreground" : "bg-accent text-ai-deep"
                )}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
}
