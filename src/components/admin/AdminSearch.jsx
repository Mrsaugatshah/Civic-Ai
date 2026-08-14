import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileSearch, CornerDownRight } from "lucide-react";

import { useAsync } from "@/hooks/useAsync";
import { searchCityReports } from "@/services/admin/adminService";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/civic/SeverityBadge";
import { StatusBadge } from "@/components/civic/StatusBadge";

export function AdminSearch({ onOpenIssue, className }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const search = useAsync(useCallback(() => searchCityReports(query), [query]), [query]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const select = (issue) => {
    setOpen(false);
    setQuery("");
    onOpenIssue?.(issue);
  };

  return (
    <div ref={boxRef} className={className}>
      <label htmlFor="admin-search" className="sr-only">
        Search reports, locations, or report IDs
      </label>
      <div className="relative">
        <Search
          size={15}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="admin-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search reports, locations, or report IDs…"
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {open && query && (
        <Card className="absolute z-dropdown mt-2 w-full shadow-lg">
          <CardContent className="max-h-80 overflow-y-auto p-1">
            {search.loading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-md" />
                ))}
              </div>
            ) : search.data.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center text-sm text-muted-foreground">
                <FileSearch size={18} />
                No reports match “{query}”.
              </div>
            ) : (
              <ul className="divide-y">
                {search.data.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      onClick={() => select(issue)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{issue.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{issue.id} · {issue.location}</p>
                      </span>
                      <SeverityBadge severity={issue.severity} className="shrink-0 px-2 py-0.5 text-[11px]" />
                      <StatusBadge status={issue.status} className="shrink-0 px-2 py-0.5 text-[11px]" />
                      <CornerDownRight size={14} className="shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
