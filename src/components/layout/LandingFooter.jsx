import { Link } from "react-router-dom";
import { Logo } from "./Navbar";

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">Making civic reporting simpler, smarter and more transparent.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/issues" className="hover:text-primary">Community Issues</Link>
          <Link to="/report" className="hover:text-primary">Report Issue</Link>
          <Link to="/login" className="hover:text-primary">Sign In</Link>
        </nav>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 border-t px-4 py-5 text-xs text-muted-foreground sm:px-6"><span>© 2026 CivicAI</span><span className="font-medium text-foreground">@civicai | 4NOUGHT4</span></div>
    </footer>
  );
}
