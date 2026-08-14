import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

// App-wide safety net. Without this, any uncaught render error anywhere in
// the tree unmounts the whole React app and leaves a blank white screen —
// the worst possible failure mode mid-demo. This renders a normal CivicAI
// error state instead, styled the same as SubmitError / AnalysisError.
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep this — it's the only remaining signal in production if the
    // boundary trips, and it doesn't render anything to the user.
    console.error("CivicAI crashed:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error-foreground">
          <AlertTriangle size={24} />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            CivicAI hit an unexpected error. Your data is safe — try reloading the page.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={this.handleReload}>
            <RefreshCw size={15} />
            Reload page
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            <Home size={15} />
            Go home
          </Button>
        </div>
      </div>
    );
  }
}
