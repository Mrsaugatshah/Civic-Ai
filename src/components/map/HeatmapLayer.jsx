import { useMemo } from "react";

/**
 * Report concentration, not severity. Each issue paints a soft
 * warm gradient; overlapping reports build visible hot spots.
 */
export function HeatmapLayer({ issues, view, size, baseScale }) {
  const circles = useMemo(() => {
    const s = baseScale * view.zoom;
    return issues.map((issue) => {
      const sx = (issue.x - view.cx) * s + size.cw / 2;
      const sy = (issue.y - view.cy) * s + size.ch / 2;
      return { sx, sy, r: 40 * Math.max(s, 0.9) };
    });
  }, [issues, view, size, baseScale]);

  const gradients = useMemo(() => {
    const defs = new Set();
    for (const c of circles) defs.add(c.r);
    return [...defs].map((r, i) => ({ id: `heat-${i}`, r }));
  }, [circles]);

  return (
    <div className="pointer-events-none absolute inset-0" data-testid="heatmap-layer" aria-hidden>
      <svg className="h-full w-full">
        <defs>
          {gradients.map((g) => (
            <radialGradient key={g.id} id={g.id}>
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#EF4444" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {circles.map((c, i) => (
          <circle key={i} cx={c.sx} cy={c.sy} r={c.r} fill={`url(#heat-${gradients.findIndex((g) => g.r === c.r)})`} />
        ))}
      </svg>
    </div>
  );
}
