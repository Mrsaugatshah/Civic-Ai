import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function DraftRecovery({ open, onContinue, onDiscard }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDiscard()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Continue your report?</DialogTitle>
          <DialogDescription>
            We saved a draft of your report so your evidence isn't lost. Pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onDiscard}>
            <Trash2 size={14} />
            Discard draft
          </Button>
          <Button onClick={onContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
