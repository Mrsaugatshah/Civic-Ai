import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPinned, Plus, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AIOrb } from "@/components/civic/AICard";

export function EmptyReports({ title = "You haven't reported anything yet.", description = "See something that needs attention? Your first report could help improve your community." }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-5 rounded-lg border bg-card px-6 py-12 text-center shadow-soft"
    >
      <div className="relative">
        <AIOrb size={88} />
        <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border bg-background text-primary shadow-soft">
          <MapPinned size={16} aria-hidden />
        </span>
      </div>
      <div className="max-w-sm">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Button asChild>
        <Link to="/report">
          <Plus size={15} />
          Report a Problem
        </Link>
      </Button>
    </motion.div>
  );
}

export function NoReportsMatch({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-background px-6 py-12 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX size={20} aria-hidden />
      </span>
      <div className="max-w-xs">
        <h2 className="font-display text-base font-semibold text-foreground">No matching reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or clear the filters to see all your reports.
        </p>
      </div>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </motion.div>
  );
}
