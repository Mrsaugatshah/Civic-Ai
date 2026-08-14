import { memo } from "react";
import { motion } from "framer-motion";

import { CATEGORY_LABEL } from "@/services/map/mapService";
import { categoryIcon } from "./mapMeta";

function IssueClusterInner({ cluster, screen, onClick }) {
  const topCategories = Object.entries(cluster.breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const Icon = categoryIcon(topCategories[0]?.[0]);

  return (
    <div
      className="pointer-events-auto absolute z-10"
      style={{ left: screen.sx, top: screen.sy, transform: "translate(-50%, -50%)" }}
    >
      <motion.button
        type="button"
        aria-label={`${cluster.count} issues grouped here. Click to zoom in.`}
        onClick={onClick}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="group relative flex items-center gap-1.5 rounded-full border-2 border-white bg-brand px-2.5 py-2 shadow-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <Icon size={13} className="text-white" />
        </span>
        <span className="text-sm font-bold tabular-nums text-white">{cluster.count}</span>
        <span className="sr-only">{topCategories.map(([k, n]) => `${CATEGORY_LABEL[k] ?? k}: ${n}`).join(", ")}</span>
      </motion.button>
      {topCategories.slice(1).map(([key], idx) => {
        const Icon = categoryIcon(key);
        return (
          <span
            key={key}
            aria-hidden
            className="absolute -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-foreground/80 text-white shadow"
            style={{ top: 2 + idx * 9 }}
          >
            <Icon size={11} />
          </span>
        );
      })}
    </div>
  );
}

export const IssueCluster = memo(IssueClusterInner);
