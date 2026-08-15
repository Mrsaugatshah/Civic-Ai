import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

export function AuthLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const registerActive = location.pathname === "/register";

  return (
    <div className="auth-premium relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8" style={{ backgroundImage: "radial-gradient(circle at 10% 12%, rgb(37 99 235 / 0.42), transparent 30%), radial-gradient(circle at 90% 18%, rgb(124 58 237 / 0.4), transparent 32%), radial-gradient(circle at 76% 88%, rgb(219 39 119 / 0.26), transparent 30%), linear-gradient(135deg, #071334 0%, #111c4d 44%, #24134f 100%)" }}>
      <span aria-hidden className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-ai/10 blur-3xl" />
      <div aria-label="CivicAI home" className="fixed left-4 top-5 z-10 rounded-md sm:left-8 sm:top-7">
        <Logo />
      </div>
      <main className="relative z-[1] flex min-h-[calc(100vh-3rem)] items-center justify-center py-16 sm:min-h-[calc(100vh-4rem)] sm:py-20">
        <div className="w-full max-w-[500px] rounded-3xl border border-border/80 bg-card/60 p-5 text-card-foreground shadow-lift backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl sm:p-8">
          <div className="mb-7 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1.5" role="tablist" aria-label="Authentication">
            <button type="button" role="tab" aria-selected={!registerActive} onClick={() => navigate("/login")} className={cn("h-11 rounded-lg text-sm font-semibold transition-all", !registerActive ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-background hover:text-foreground")}>Login</button>
            <button type="button" role="tab" aria-selected={registerActive} onClick={() => navigate("/register")} className={cn("h-11 rounded-lg text-sm font-semibold transition-all", registerActive ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-background hover:text-foreground")}>Register</button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
