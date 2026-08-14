import { cn } from "@/lib/utils";

export function AuthDivider({ label = "or continue with", className }) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="separator" aria-orientation="horizontal">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
