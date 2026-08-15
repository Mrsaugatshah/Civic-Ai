import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const OPTIONS = [
  ["light", "Light", "bg-white"],
  ["dark", "Dark", "bg-slate-900"],
  ["warm", "Warm", "bg-amber-50"],
  ["gray", "Gray", "bg-slate-200"],
];

export function ThemeSelector({ compact = false }) {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon" : "sm"} aria-label="Choose theme" className="text-muted-foreground">
          <Palette size={16} />
          {!compact && <span className="ml-2">Appearance</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Appearance</DropdownMenuLabel>
        {OPTIONS.map(([value, label, swatch]) => (
          <DropdownMenuItem key={value} onSelect={() => setTheme(value)} className="gap-3">
            <span className={cn("h-4 w-4 rounded-full border", swatch)} />
            <span className="flex-1 text-left">{label}</span>
            {theme === value && <Check size={15} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
