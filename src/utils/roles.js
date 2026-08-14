export const ROLE_META = {
  citizen: {
    label: "Citizen",
    home: "/dashboard",
    badge: "bg-brand/10 text-brand-foreground border-brand/25",
  },
  authority: {
    label: "Authority",
    home: "/authority/dashboard",
    badge: "bg-primary/10 text-primary-foreground border-primary/25",
  },
  admin: {
    label: "Admin",
    home: "/admin/dashboard",
    badge: "bg-ai/10 text-ai-foreground border-ai/25",
  },
};

export function roleHome(role) {
  return ROLE_META[role]?.home ?? "/dashboard";
}

export function roleLabel(role) {
  return ROLE_META[role]?.label ?? "User";
}
