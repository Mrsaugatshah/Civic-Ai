import { Palette } from "lucide-react";
import { CitizenLayout } from "@/components/dashboard/CitizenLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const THEMES = [
  ["gradient", "Gradient", "Premium blue and violet"],
  ["light", "Light", "Clean white and light gray"],
  ["dark", "Dark", "Deep navy and slate"],
  ["warm", "Warm", "Soft cream neutrals"],
  ["gray", "Gray", "Neutral professional gray"],
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  return <CitizenLayout><div className="mx-auto max-w-2xl space-y-6"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Preferences</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Adjust the CivicAI interface on this device.</p></header><Card><CardContent className="space-y-5 p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Palette size={18} /></span><div><p className="font-medium">Appearance</p><p className="text-xs text-muted-foreground">Choose a theme. Your preference is saved on this device.</p></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{THEMES.map(([value, label, description]) => <button key={value} type="button" onClick={() => setTheme(value)} aria-pressed={theme === value} className={`rounded-lg border p-3 text-left transition-colors hover:border-primary ${theme === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"}`}><span className={`mb-2 block h-8 rounded-md border ${value === "gradient" ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500" : value === "dark" ? "bg-slate-900" : value === "warm" ? "bg-amber-50" : value === "gray" ? "bg-slate-200" : "bg-white"}`} /><span className="text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></button>)}</div></CardContent></Card></div></CitizenLayout>;
}
