import { X } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { IssueDetailContent } from "./IssueDetailContent";

export function IssueDetailDrawer({ issue, onClose, onSelectRelated }) {
  return (
    <AnimatePresence>
      {issue && (
        <motion.aside
          key="issue-drawer"
          data-testid="issue-detail-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="absolute inset-y-0 right-0 z-30 hidden w-96 flex-col border-l bg-background shadow-lift md:flex"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Issue details</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close issue details"
              data-testid="issue-detail-close"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <IssueDetailContent issue={issue} onSelectRelated={onSelectRelated} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
