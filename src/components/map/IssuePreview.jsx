import { motion } from "framer-motion";

import { CATEGORY_LABEL } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";

export function IssuePreview({ issue, screen, flip = false, flipY = false }) {
  const Icon = categoryIcon(issue.category);
  const style = {
    left: flip ? screen.sx - 12 : screen.sx + 12,
    top: flipY ? screen.sy - 84 : screen.sy + 10,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="pointer-events-none absolute z-30 w-60 rounded-lg border bg-background/95 p-2.5 shadow-lift backdrop-blur"
      style={style}
    >
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
          <Icon size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{issue.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{issue.location}</p>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{CATEGORY_LABEL[issue.category] ?? "Issue"}</span>
        <span>{issue.priority == null ? "AI analysis pending" : <><span className="font-semibold text-foreground">AI {issue.priority}</span>/100</>}</span>
      </div>
    </motion.div>
  );
}
