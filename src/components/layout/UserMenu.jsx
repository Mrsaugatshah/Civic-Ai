import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  User,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Building2,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_META, roleHome } from "@/utils/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initialsOf(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function UserMenu({ className }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const meta = ROLE_META[user.role];
  const orgLine = user.role === "authority"
    ? [user.organization, user.department].filter(Boolean).join(" · ")
    : user.role === "admin"
      ? "Platform administrator"
      : user.location || "Citizen";

  const handleSignOut = async () => {
    // logout() flags the session as a deliberate sign-out BEFORE clearing
    // it, so any still-mounted RoleGuard redirects to "/" (the logout
    // contract) instead of /login with stale from-state.
    await logout();
    toast.success("You've been signed out.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Open account menu" className={cn("gap-1.5 px-1.5", className)}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown size={14} className="hidden text-muted-foreground sm:block" />
          <span className="sr-only">Open account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={cn("text-[10px] font-medium", meta.badge)}>
                {meta.label}
              </Badge>
              {user.role === "authority" && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Building2 size={10} />
                  {orgLine}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={roleHome(user.role)}>
            <LayoutDashboard size={14} /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile"><User size={14} /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={user.role === "citizen" ? "/dashboard?notifications=1" : roleHome(user.role)}><Bell size={14} /> Notifications</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings"><Settings size={14} /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help"><HelpCircle size={14} /> Help</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-error focus:text-error" onClick={handleSignOut}>
          <LogOut size={14} /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
