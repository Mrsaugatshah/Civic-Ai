import { CalendarDays, HandHeart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationSelector } from "./LocationSelector";

export function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader({ user, location, onLocationChange }) {
  const hour = new Date().getHours();
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <section id="home" className="scroll-mt-24">
      <Card className="relative overflow-hidden border-border bg-gradient-to-br from-primary-light/40 via-background to-background">
        <CardContent className="flex flex-col justify-between gap-5 p-6 sm:p-7">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={15} />
              {date}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {greetingForHour(hour)}, {firstName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Here's how your neighborhood is doing today — track reports, score your
              impact, and help keep {location} moving.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                <HandHeart size={12} className="text-brand" />
                Community partner
              </Badge>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                SDG 11 — Sustainable cities
              </Badge>
            </div>
          </div>
          <LocationSelector value={location} onValueChange={onLocationChange} />
        </CardContent>
      </Card>
    </section>
  );
}
