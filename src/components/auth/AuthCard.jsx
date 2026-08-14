import { cn } from "@/lib/utils";

export function AuthCard({ title, description, children, className }) {
  return (
    <div className={cn("w-full", className)}>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </header>
      {children}
    </div>
  );
}
