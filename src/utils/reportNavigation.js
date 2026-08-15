import { roleHome } from "@/utils/roles";

export function reportDestination(user) {
  if (!user) return "/login";
  return user.role === "citizen" ? "/report" : roleHome(user.role);
}

export function reportDestinationState(user) {
  return user ? undefined : { from: "/report" };
}
