import { X, ChevronDown } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { IssueDetailContent } from "./IssueDetailContent";

export function IssueBottomSheet({ issue, onClose, onSelectRelated }) {
  return (
    <AnimatePresence>
      {issue && (
        <motion.div
          key="issue-sheet"
          data-testid="issue-bottom-sheet"
          className="absolute inset-0 z-30 flex items-end md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/20" aria-hidden onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Issue details"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex max-h-[78%] w-full flex-col rounded-t-2xl border-t bg-background shadow-lift"
          >
            <div className="flex items-center justify-between px-4 pb-0 pt-2.5">
              <button
                type="button"
                aria-label="Expand sheet"
                className="flex h-6 w-10 items-center justify-center rounded-full text-muted-foreground"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close issue details"
                data-testid="issue-detail-close-mobile"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mx-auto h-1 w-10 rounded-full bg-border" />
            <div className="flex-1 overflow-y-auto p-4 pb-6">
              <IssueDetailContent issue={issue} onSelectRelated={onSelectRelated} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
