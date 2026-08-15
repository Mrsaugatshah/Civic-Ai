import { greetingForHour } from "./greeting";

export function GreetingHeader({ user }) {
  const firstName = user?.name?.split(" ")[0] || "there";
  return <section id="home" className="scroll-mt-24"><p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{greetingForHour(new Date().getHours())}, {firstName}</p><p className="mt-1 text-sm text-muted-foreground">Report and track issues in your community.</p></section>;
}
