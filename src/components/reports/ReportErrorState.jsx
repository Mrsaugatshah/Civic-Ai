import { AlertCircle, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ReportErrorState({ title = "We couldn't load your reports", message, onRetry }) {
  return (
    <Alert variant="destructive" className="max-w-2xl">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>
          {message ?? "Something went wrong while loading. Please try again in a moment."}
        </span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw size={14} />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
