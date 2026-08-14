import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ReportSearch({ value, onChange, className }) {
  return (
    <div className={className}>
      <label htmlFor="report-search" className="sr-only">
        Search your reports
      </label>
      <div className="relative">
        <Search
          size={15}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="report-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search your reports…"
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
