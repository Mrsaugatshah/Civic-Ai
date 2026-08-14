import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function CountUp({ value, active }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const textValue = String(value ?? "");
  const [display, setDisplay] = useState(textValue);

  useEffect(() => {
    if (!active || !inView) {
      setDisplay(textValue);
      return undefined;
    }
    const match = textValue.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
    if (!match) {
      setDisplay(textValue);
      return undefined;
    }
    const target = parseFloat(match[1].replace(/,/g, ""));
    const decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
    const suffix = match[2];
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) =>
        setDisplay(`${Number(v.toFixed(decimals)).toLocaleString("en-US")}${suffix}`),
    });
    return () => controls.stop();
  }, [active, inView, textValue]);

  return <span ref={ref}>{display}</span>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = "primary",
  animate: countUp = false,
  className,
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
    ai: "bg-ai/10 text-ai",
    brand: "bg-brand/10 text-brand",
  }[tone];

  const TrendIcon = trend && trend.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("h-full", className)}
    >
      <Card className="card-lift h-full">
        <CardContent className="flex items-start gap-4 p-5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              toneClass
            )}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="font-display text-2xl font-bold text-foreground">
                <CountUp value={value} active={countUp} />
              </p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    trend.direction === "up" ? "text-success" : "text-error"
                  )}
                >
                  <TrendIcon size={12} />
                  {trend.value}
                </span>
              )}
            </div>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
