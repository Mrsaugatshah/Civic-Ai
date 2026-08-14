import { REPORT_CATEGORY_META } from "./reportMeta";
import { listCategories } from "@/services/categories/categoryService";
import { cn } from "@/lib/utils";

export function CategorySelector({ value, onChange }) {
  const categories = listCategories({ activeOnly: true });
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Pick the closest category</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((cat) => {
          const meta = REPORT_CATEGORY_META[cat.key] ?? REPORT_CATEGORY_META.other;
          const Icon = meta.icon;
          const active = value === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(cat.key)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", meta.tone)}>
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{cat.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
