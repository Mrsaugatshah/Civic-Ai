import { WifiOff, RefreshCw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SubmitError({ onRetry, onSaveDraft, message }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error-foreground">
          <WifiOff size={24} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            We couldn't submit your report
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {message || "Your information is still here. Please try again."}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={onRetry}>
            <RefreshCw size={15} />
            Try again
          </Button>
          <Button variant="outline" onClick={onSaveDraft}>
            <Save size={15} />
            Saved as draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
