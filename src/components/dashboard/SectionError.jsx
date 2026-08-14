import { AlertCircle, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SectionError({ title = "Couldn't load this section", onRetry }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
        <span>Something went wrong while loading. Please try again.</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw size={14} />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
