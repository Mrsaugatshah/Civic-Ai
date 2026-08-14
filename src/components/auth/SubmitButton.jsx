import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({ loading, loadingText, children, className, ...props }) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn("h-11 w-full shadow-card hover:shadow-lift", className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
          <span className="sr-only">Please wait</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
