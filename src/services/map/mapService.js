/**
 * CivicAI City Map — data layer (Part 7)
 * ------------------------------------------------------------
 * A deterministic, seeded city dataset so the map demo is stable.
 * `queryCityIssues` models a viewport-based server query (only the
 * visible region + filters are returned), so a real backend can swap
 * in without touching the UI. Everything else (insights, area
 * summaries, related reports) is computed from the actual data —
 * no fabricated trends.
 */

export const CANVAS_W = 1000;
export const CANVAS_H = 600;
export const KM_PER_UNIT = 0.012; // 12 km across the 1000-unit city

export const CITY_CENTER = { x: 500, y: 300 };

/* ----------------------------- RNG ------------------------------ */

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260812);
const rnd = (min, max) => min + rand() * (max - min);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const gauss = (center, spread) => {
  const u = rand() || 1e-9;
  const v = rand() || 1e-9;
  return center + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * spread;
};

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

/* -------------------------- Meta tables -------------------------- */

export const MAP_CATEGORIES = [
  { key: "road", label: "Roads" },
  { key: "waste", label: "Waste" },
  { key: "water", label: "Water" },
  { key: "electricity", label: "Electricity" },
  { key: "streetlight", label: "Street Lighting" },
  { key: "transportation", label: "Transportation" },
  { key: "environment", label: "Environment" },
  { key: "safety", label: "Public Safety" },
  { key: "park", label: "Parks" },
  { key: "other", label: "Other" },
];

// categoryKey (dashboard/map dataset) -> public map label
export const CATEGORY_LABEL = {
  road: "Roads",
  waste: "Waste",
  water: "Water & Sewage",
  electricity: "Electricity",
  streetlight: "Street Lighting",
  transportation: "Transportation",
  environment: "Environment",
  safety: "Public Safety",
  park: "Parks",
  building: "Public Buildings",
  vandalism: "Vandalism",
  vehicle: "Vehicle & Parking",
  air: "Air Quality",
  other: "Other",
};

export const MAP_STATUSES = [
  { key: "reported", label: "Reported" },
  { key: "under_review", label: "Under Review" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export const STATUS_META = {
  reported: { label: "Reported", color: "#94A3B8" },
  under_review: { label: "Under Review", color: "#F59E0B" },
  assigned: { label: "Assigned", color: "#8B5CF6" },
  in_progress: { label: "In Progress", color: "#0EA5E9" },
  resolved: { label: "Resolved", color: "#16A34A" },
  closed: { label: "Closed", color: "#64748B" },
};

export const SEVERITY_MARKER_COLORS = {
  critical: "#DC2626",
  high: "#F97316",
  medium: "#EAB308",
  low: "#3B82F6",
};

export function markerColor(issue) {
  if (issue.status === "resolved" || issue.status === "closed") return "#16A34A";
  return SEVERITY_MARKER_COLORS[issue.severity] ?? SEVERITY_MARKER_COLORS.medium;
}

export const PRIORITY_LEVELS = [
  { min: 85, key: "critical", label: "Critical" },
  { min: 70, key: "high", label: "High" },
  { min: 50, key: "medium", label: "Medium" },
  { min: 0, key: "low", label: "Low" },
];

export function priorityLevel(score) {
  return PRIORITY_LEVELS.find((p) => score >= p.min) ?? PRIORITY_LEVELS[3];
}

export function shouldPulse(issue) {
  return issue.severity === "critical" || (issue.priority ?? 0) >= 85;
}

const DEPARTMENT_BY_CATEGORY = {
  road: "Roads & Infrastructure Department",
  waste: "Waste Management Department",
  water: "Water & Sewage Department",
  electricity: "Electricity Authority",
  streetlight: "Street Lighting Unit",
  transportation: "Traffic & Transport Department",
  environment: "Environment Department",
  safety: "Public Safety Department",
  park: "Parks & Greenery Department",
  building: "Public Works Department",
  vandalism: "Public Safety Department",
  vehicle: "Traffic & Transport Department",
  air: "Environment Department",
  other: "General Administration",
};

export function departmentFor(issue) {
  return DEPARTMENT_BY_CATEGORY[issue.category] ?? DEPARTMENT_BY_CATEGORY.other;
}

/* ------------------------- Neighborhoods ------------------------- */

/**
 * The seven local government units (LGUs) of Chitwan district.
 * Polygons are stylized rectangles tiling the 1000×600 canvas in
 * roughly the district's real layout: Ichchhakamana along the west
 * (Narayani corridor), Bharatpur centre-west, Kalika north, Rapti +
 * Ratnanagar east along the Mahendra Highway, Khairahani + Madi south.
 */
export const NEIGHBORHOODS = [
  {
    key: "ichchhakamana",
    name: "Ichchhakamana",
    anchor: { x: 205, y: 200 },
    poly: [20, 40, 260, 40, 260, 320, 20, 320],
    weight: 10,
  },
  {
    key: "bharatpur",
    name: "Bharatpur",
    anchor: { x: 360, y: 260 },
    poly: [200, 120, 500, 120, 500, 400, 200, 400],
    weight: 55,
  },
  {
    key: "kalika",
    name: "Kalika",
    anchor: { x: 540, y: 120 },
    poly: [380, 40, 700, 40, 700, 200, 380, 200],
    weight: 18,
  },
  {
    key: "rapti",
    name: "Rapti",
    anchor: { x: 630, y: 260 },
    poly: [500, 140, 760, 140, 760, 380, 500, 380],
    weight: 24,
  },
  {
    key: "ratnanagar",
    name: "Ratnanagar",
    anchor: { x: 870, y: 260 },
    poly: [760, 140, 980, 140, 980, 380, 760, 380],
    weight: 28,
  },
  {
    key: "khairahani",
    name: "Khairahani",
    anchor: { x: 390, y: 480 },
    poly: [260, 400, 520, 400, 520, 560, 260, 560],
    weight: 20,
  },
  {
    key: "madi",
    name: "Madi",
    anchor: { x: 760, y: 470 },
    poly: [540, 380, 980, 380, 980, 560, 540, 560],
    weight: 14,
  },
];

export const SEARCH_PLACES = [
  ...NEIGHBORHOODS.map((n) => ({ name: n.name, x: n.anchor.x, y: n.anchor.y, kind: "neighborhood" })),
  { name: "Narayangadh", x: 410, y: 315, kind: "area" },
  { name: "Sauraha", x: 825, y: 365, kind: "area" },
  { name: "Tandi", x: 623, y: 332, kind: "area" },
  { name: "Rampur", x: 585, y: 195, kind: "area" },
  { name: "Meghauli", x: 310, y: 425, kind: "area" },
  { name: "Fulbari", x: 250, y: 120, kind: "area" },
  { name: "Devghat", x: 195, y: 135, kind: "area" },
  { name: "Mahendra Highway", x: 400, y: 330, kind: "road" },
  { name: "Chitwan National Park", x: 560, y: 505, kind: "park" },
  { name: "Bis Hazari Tal", x: 845, y: 335, kind: "area" },
  { name: "Narayani River", x: 150, y: 290, kind: "river" },
  { name: "Rapti River", x: 590, y: 435, kind: "river" },
];

/* ------------------------- Issue templates ----------------------- */

const TITLES = {
  road: ["Road Damage", "Pothole on main road", "Cracked road surface", "Faded pedestrian crossing"],
  waste: ["Garbage overflow", "Waste pile near market", "Construction debris", "Litter along footpath"],
  streetlight: ["Streetlight out", "Flickering street lamp", "Dark stretch at night"],
  water: ["Leaking water pipe", "Waterlogging after rain", "Sewage overflow", "Damaged water valve"],
  electricity: ["Power outage", "Exposed wiring", "Faulty transformer"],
  park: ["Fallen tree branch", "Overgrown park", "Damaged park bench"],
  vandalism: ["Graffiti at bus stop", "Vandalized signboard", "Damaged public shelter"],
  vehicle: ["Abandoned vehicle", "Blocked parking lane", "Obstructing vehicle"],
  safety: ["Unsafe crossing", "Hazardous alley", "Missing road sign"],
  building: ["Damaged footpath slab", "Broken public toilet", "Damaged shelter"],
  air: ["Dust pollution", "Burning waste smell", "Smoke near market"],
  other: ["Issue reported by resident", "Community concern", "General maintenance"],
};

const DESCRIPTIONS = {
  road: [
    "Surface damage widening with every rain. Vehicles are slowing sharply and swerving around it.",
    "The road is deteriorating and affecting morning traffic in the area.",
    "Markings have worn away, making crossings unsafe during school hours.",
  ],
  waste: [
    "Waste has not been collected for days. Smell and strays are increasing nearby.",
    "Debris is blocking part of the footpath for pedestrians.",
  ],
  streetlight: [
    "The lamp has been off for nights. The stretch is completely dark after dusk.",
    "Flickering light is dimming the whole crossing at night.",
  ],
  water: [
    "Water is pooling on the footpath with no nearby drainage.",
    "The leak has been running continuously and is wasting water.",
  ],
  electricity: [
    "Residents in the block are without power since the morning.",
    "Wiring is exposed near the junction and needs inspection.",
  ],
  park: [
    "A large branch came down after the storm and is blocking the path.",
    "The area needs maintenance to stay usable for families.",
  ],
  vandalism: [
    "Tagging is covering the shelter and obscuring route information.",
    "Property has been defaced and needs cleaning.",
  ],
  vehicle: [
    "A vehicle has been parked here for weeks, narrowing the lane.",
    "The vehicle is blocking access at peak hours.",
  ],
  safety: [
    "The area is a known hazard, especially after dark.",
    "A missing sign is causing confusion near the crossing.",
  ],
  building: [
    "The surface is uneven and is a trip hazard for walkers.",
    "Public furniture is damaged and needs attention.",
  ],
  air: [
    "Air quality is noticeably poor in the mornings.",
    "Smoke is drifting over the neighbourhood from nearby burning.",
  ],
  other: [
    "Residents have raised a concern that needs a quick look.",
    "A community member flagged an issue in this area.",
  ],
};

const CATEGORY_WEIGHTS = [
  ["road", 26],
  ["waste", 15],
  ["streetlight", 15],
  ["water", 12],
  ["electricity", 6],
  ["park", 7],
  ["vandalism", 5],
  ["vehicle", 5],
  ["safety", 4],
  ["building", 3],
  ["air", 2],
  ["other", 2],
];

function weightedCategory() {
  const total = CATEGORY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = rand() * total;
  for (const [key, w] of CATEGORY_WEIGHTS) {
    roll -= w;
    if (roll <= 0) return key;
  }
  return "other";
}

function severityForPriority(priority) {
  if (priority >= 85) return "critical";
  if (priority >= 70) return "high";
  if (priority >= 45) return "medium";
  return "low";
}

function statusFor(randVal) {
  if (randVal < 0.28) return "reported";
  if (randVal < 0.48) return "under_review";
  if (randVal < 0.62) return "assigned";
  if (randVal < 0.78) return "in_progress";
  if (randVal < 0.93) return "resolved";
  return "closed";
}

/* ------------------------ Seed the dataset ----------------------- */

function makeIssue({ id, category, title, description, location, x, y, severity, status, priority, hours, votes, featured }) {
  return {
    id,
    category,
    title: title ?? pick(TITLES[category] ?? TITLES.other),
    description: description ?? pick(DESCRIPTIONS[category] ?? DESCRIPTIONS.other),
    location: location ?? "Narayangadh",
    x,
    y,
    severity,
    status,
    priority,
    reportedAt: hoursAgo(hours ?? rnd(3, 2160)),
    votes: votes ?? Math.round(rnd(1, 28)),
    department: DEPARTMENT_BY_CATEGORY[category] ?? DEPARTMENT_BY_CATEGORY.other,
    featured,
  };
}

let seedCounter = 100;

function nextId() {
  seedCounter += 1;
  return `CIV-2026-00${seedCounter}`;
}

// Legacy generator is intentionally unreachable; the live map source below
// reads only citizen-submitted reports.
// oxlint-disable-next-line no-unused-vars
function buildDataset() {
  const issues = [];

  // Canonical Part 6 pothole story — must exist for the demo + details link.
  issues.push(
    makeIssue({
      id: "CIV-2026-008421",
      category: "road",
      title: "Road Damage — Main Road",
      description: "Large pothole near the school entrance affecting vehicles.",
      location: "Main Road, Narayangadh",
      x: 400, y: 330,
      severity: "high",
      status: "under_review",
      priority: 87,
      hours: 2,
      votes: 6,
      featured: true,
    }),
    makeIssue({
      id: "CIV-2026-008102",
      category: "road",
      title: "Road Damage — Main Road",
      description: "Cracked surface widening near the same stretch.",
      location: "Main Road, Narayangadh",
      x: 412, y: 331,
      severity: "medium",
      status: "under_review",
      priority: 64,
      hours: 6,
      votes: 4,
      featured: true,
    })
  );

  // A very recent report so the "new issue nearby" hint is data-driven.
  issues.push(
    makeIssue({
      id: "CIV-2026-008600",
      category: "streetlight",
      title: "Streetlight out near crossing",
      description: "Lamp dead at the crossing — the corner is dark at night.",
      location: "Tandi",
      x: 623, y: 332,
      severity: "medium",
      status: "reported",
      priority: 61,
      hours: 0.12,
      votes: 1,
    })
  );

  for (const hood of NEIGHBORHOODS) {
    const count = Math.round(hood.weight * rnd(0.9, 1.25));
    for (let i = 0; i < count; i += 1) {
      const category = weightedCategory();
      const status = statusFor(rand());
      const base = category === "road" ? rnd(35, 95) : rnd(22, 92);
      const priority = Math.max(18, Math.min(99, Math.round(base + gauss(0, 6))));
      // A dense road cluster along the Mahendra Highway (Bharatpur) for the cluster demo.
      let x = gauss(hood.anchor.x, hood.weight * 4);
      let y = gauss(hood.anchor.y, hood.weight * 4);
      if (category === "road" && hood.key === "bharatpur") {
        x = gauss(405, 14);
        y = gauss(332, 7);
      }
      issues.push(
        makeIssue({
          id: nextId(),
          category,
          title: pick(TITLES[category] ?? TITLES.other),
          description: pick(DESCRIPTIONS[category] ?? DESCRIPTIONS.other),
          location: hood.name,
          x,
          y,
          severity: severityForPriority(priority),
          status,
          priority,
          hours: rnd(1, 2160),
        })
      );
    }
  }

  return issues.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
}

export function getCityIssues() {
  return [];
}

export async function fetchCityIssues() {
  const response=await fetch("/api/reports?limit=100",{credentials:"include"});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error?.message||"Could not load city reports.");
  return body.data.map((report) => ({
    id: report.id,
    category: report.category,
    title: report.title,
    description: report.description,
    location: report.location,
    x: CITY_CENTER.x + ((report.longitude - 84.43) * 98.9) / KM_PER_UNIT,
    y: CITY_CENTER.y - ((report.latitude - 27.68) * 111.32) / KM_PER_UNIT,
    severity: report.severity,
    status: report.status,
    priority: report.priority,
    reportedAt: report.reportedAt,
    votes: report.reportCount ?? 1,
    department: report.department,
    evidence: report.evidence,
  }));
}

/* --------------------------- Geometry ---------------------------- */

export function canvasToKm(a, b = CITY_CENTER) {
  return Math.hypot(a.x - b.x, a.y - b.y) * KM_PER_UNIT;
}

export function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function neighborhoodAt(x, y) {
  return NEIGHBORHOODS.find((n) => pointInPoly(x, y, n.poly)) ?? null;
}

/* ---------------------------- Filters ---------------------------- */

export function matchesFilters(issue, filters = {}) {
  const { categories, statuses, priorities, time = "all", distance, center, maxKm } = filters;

  if (categories?.length && !categories.includes(issue.category)) return false;
  if (statuses?.length && !statuses.includes(issue.status)) return false;
  if (priorities?.length && !priorities.includes(priorityLevel(issue.priority).key)) return false;

  if (time && time !== "all") {
    const ageMs = Date.now() - new Date(issue.reportedAt).getTime();
    const limit =
      time === "today" ? 24 * 3600000
        : time === "week" ? 7 * 86400000
          : time === "month" ? 30 * 86400000
            : 90 * 86400000;
    if (ageMs > limit) return false;
  }

  if (distance && maxKm && center) {
    if (canvasToKm({ x: issue.x, y: issue.y }, center) > maxKm) return false;
  }

  return true;
}

/* ----------------------- Viewport simulation --------------------- */

/**
 * Models a server-side viewport query: only issues inside the visible
 * bounds that pass the filters are returned. The real dataset is seeded
 * in-memory; swapping in a network call keeps this signature.
 */
export function queryCityIssues({ bounds, filters = {}, signal } = {}) {
  if (signal?.aborted) return Promise.resolve({ items: [], total: getCityIssues().length });
  const issues = getCityIssues().filter((issue) => {
    if (bounds) {
      const { minX, maxX, minY, maxY } = bounds;
      if (issue.x < minX || issue.x > maxX || issue.y < minY || issue.y > maxY) return false;
    }
    return matchesFilters(issue, filters);
  });
  return Promise.resolve({ items: issues, total: getCityIssues().length });
}

export function viewportBounds(cx, cy, zoom, cw, ch) {
  const halfW = cw / (2 * zoom);
  const halfH = ch / (2 * zoom);
  const pad = 80; // keep markers slightly off-screen culled gracefully
  return {
    minX: cx - halfW - pad,
    maxX: cx + halfW + pad,
    minY: cy - halfH - pad,
    maxY: cy + halfH + pad,
  };
}

/* ---------------------------- Timeline --------------------------- */

export const TIMELINE_STEPS = [
  { key: "reported", label: "Reported" },
  { key: "ai_analyzed", label: "AI Analyzed" },
  { key: "under_review", label: "Under Review" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_INDEX = {
  reported: 1,
  under_review: 3,
  assigned: 4,
  in_progress: 5,
  resolved: 6,
  closed: 6,
};

export function timelineFor(issue) {
  const doneIdx = STATUS_INDEX[issue.status] ?? 0;
  return TIMELINE_STEPS.map((step, i) => ({
    ...step,
    done: i < doneIdx,
    current: i === doneIdx - 1,
    // approximate timestamps, descending backwards from report time
    at: i === 0 ? issue.reportedAt : hoursAgo(Math.max(1, (new Date(issue.reportedAt).getTime() - (Date.now() - i * 18 * 3600000)) / 3600000)),
  }));
}

/* ------------------------- Related reports ----------------------- */

export function relatedReports(issue, radiusKm = 0.5) {
  const issues = getCityIssues();
  return issues
    .filter((i) => i.id !== issue.id)
    .map((i) => ({ issue: i, km: canvasToKm({ x: i.x, y: i.y }, { x: issue.x, y: issue.y }) }))
    .filter(({ km }) => km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, 3)
    .map(({ issue: i, km }) => ({ ...i, km }));
}

export function similarReports(issue, radiusKm = 0.5) {
  const issues = getCityIssues();
  return issues
    .filter((i) => i.id !== issue.id && i.category === issue.category)
    .map((i) => ({ issue: i, km: canvasToKm({ x: i.x, y: i.y }, { x: issue.x, y: issue.y }) }))
    .filter(({ km }) => km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, 3)
    .map(({ issue: i, km }) => ({ ...i, km }));
}

/* --------------------------- Area summary ------------------------ */

export function areaSummary(cx, cy, radiusKm = 2) {
  const issues = getCityIssues();
  const inArea = issues.filter(
    (i) => canvasToKm({ x: i.x, y: i.y }, { x: cx, y: cy }) <= radiusKm
  );
  const now = Date.now();
  const week = 7 * 86400000;
  const active = inArea.filter((i) => i.status !== "resolved" && i.status !== "closed").length;
  const resolvedThisWeek = inArea.filter(
    (i) => (i.status === "resolved" || i.status === "closed") && now - new Date(i.reportedAt).getTime() <= week
  ).length;
  const resolvedLastWeek = inArea.filter(
    (i) => (i.status === "resolved" || i.status === "closed") &&
      now - new Date(i.reportedAt).getTime() > week &&
      now - new Date(i.reportedAt).getTime() <= week * 2
  ).length;
  const trendPct = resolvedLastWeek
    ? Math.round(((resolvedThisWeek - resolvedLastWeek) / resolvedLastWeek) * 100)
    : resolvedThisWeek > 0 ? 100 : 0;

  const breakdown = {};
  for (const i of inArea) breakdown[i.category] = (breakdown[i.category] ?? 0) + 1;

  return {
    active,
    total: inArea.length,
    resolvedThisWeek,
    trendPct,
    breakdown,
  };
}

/* --------------------------- AI insights ------------------------- */

function clusterMetrics(issues) {
  const byCategory = {};
  for (const i of issues) {
    (byCategory[i.category] ??= []).push(i);
  }
  const clusters = [];
  for (const [category, list] of Object.entries(byCategory)) {
    if (list.length < 6) continue;
    const cx = list.reduce((s, i) => s + i.x, 0) / list.length;
    const cy = list.reduce((s, i) => s + i.y, 0) / list.length;
    const radius = Math.max(...list.map((i) => Math.hypot(i.x - cx, i.y - cy)));
    clusters.push({ category, count: list.length, cx, cy, radius });
  }
  return clusters.sort((a, b) => b.count - a.count);
}

export function computeInsights(issues = []) {
  const insights = [];

  // Concentration insight from the actual data.
  const top = clusterMetrics(issues)[0];
  if (top) {
    const hood = neighborhoodAt(top.cx, top.cy);
    insights.push({
      id: "concentration",
      kind: "area",
      headline: `${CATEGORY_LABEL[top.category] ?? top.category} reports are concentrated around ${hood?.name ?? "the city center"} this week`,
      body: `${top.count} reports cluster within a small area. Resources and patrols here have the highest impact right now.`,
      focus: { cx: top.cx, cy: top.cy, radiusKm: Math.max(0.8, top.radius * KM_PER_UNIT) },
      confidence: "High confidence",
    });
  }

  // Progress insight from the actual data.
  const now = Date.now();
  const week = 7 * 86400000;
  const resolvedWeek = issues.filter((i) => (i.status === "resolved" || i.status === "closed") && now - new Date(i.reportedAt).getTime() <= week).length;
  const active = issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length;
  if (active > 0) {
    insights.push({
      id: "progress",
      kind: "progress",
      headline: `${resolvedWeek} issues were resolved across the city in the last 7 days`,
      body: `${active} issues remain open. Resolved reports now appear in Progress mode so the community can see the change.`,
      focus: { cx: CITY_CENTER.x, cy: CITY_CENTER.y, radiusKm: 8 },
      confidence: "High confidence",
    });
  }

  // Newest-issue insight.
  const newest = [...issues].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))[0];
  if (newest) {
    insights.push({
      id: "newest",
      kind: "area",
      headline: `A new ${CATEGORY_LABEL[newest.category] ?? "issue"} report just arrived`,
      body: `A resident reported "${newest.title}" near ${newest.location} minutes ago. It is awaiting review.`,
      focus: { cx: newest.x, cy: newest.y, radiusKm: 0.6 },
      confidence: "High confidence",
    });
  }

  return insights;
}

/* ---------------------------- Search ----------------------------- */

export function parseSearchQuery(query) {
  const q = (query ?? "").toLowerCase().trim();
  const filters = {};
  if (!q) return { filters, places: [], issues: [] };

  // Distance filters
  const kmMatch = q.match(/within\s+([0-9.]+)\s*km/) || q.match(/([0-9.]+)\s*km/);
  if (kmMatch) filters.maxKm = Number(kmMatch[1]);
  if (/(near me|around me|nearby)/.test(q)) filters.nearMe = true;

  // Status filters
  if (/(resolved|fixed)/.test(q)) filters.statuses = ["resolved"];
  if (/(under review)/.test(q)) filters.statuses = ["under_review"];
  if (/(in progress|ongoing)/.test(q)) filters.statuses = ["in_progress"];
  if (/(reported|just reported|new)/.test(q)) filters.statuses = ["reported"];

  // Priority filters
  if (/(critical|urgent)/.test(q)) filters.priorities = ["critical"];
  else if (/(high priority|high)/.test(q)) filters.priorities = ["high", "critical"];

  // Category filters — keyword sets are disjoint so order is safe.
  const catMap = {
    streetlight: /(streetlight|street light|lamp|lighting|dark|unlit)/,
    waste: /(waste|garbage|trash|rubbish|debris|litter)/,
    water: /(water|leak|pipe|sewage|drain|flood)/,
    electricity: /(power|electric|outage|wiring)/,
    road: /(road|pothole|pavement|damage|potholes)/,
    park: /(park|tree|garden|greenery)/,
    safety: /(safety|hazard|crime|danger)/,
    environment: /(environment|pollution|smoke|air)/,
    transportation: /(traffic|vehicle|parking|bus)/,
  };
  const matchedCat = Object.entries(catMap).find(([, re]) => re.test(q));
  if (matchedCat) filters.categories = [matchedCat[0]];

  // Token matching for places + issues so natural-language queries
  // ("road damage within 2 km") still surface the canonical issue.
  const STOP = new Set([
    "within", "km", "near", "me", "my", "the", "a", "an", "and", "of", "to", "in",
    "with", "for", "at", "on", "all", "by", "reported", "just", "last", "days", "day",
    "week", "weeks", "month", "months", "city", "area", "around", "under", "review",
    "resolved", "fixed", "critical", "urgent", "high", "low", "medium", "priority",
    "street", "road", "main", "hours", "ago",
  ]);
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));

  const issues = getCityIssues();
  const placeHits = SEARCH_PLACES.filter((p) =>
    tokens.some((t) => p.name.toLowerCase().includes(t))
  ).slice(0, 4);

  const issueHits = issues
    .map((i) => {
      const title = i.title.toLowerCase();
      const desc = i.description.toLowerCase();
      const loc = i.location.toLowerCase();
      const cat = (CATEGORY_LABEL[i.category] ?? "").toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (title.includes(t)) score += 3;
        if (loc.includes(t)) score += 2;
        if (cat.includes(t)) score += 2;
        if (desc.includes(t)) score += 1;
      }
      if (filters.categories?.length && !filters.categories.includes(i.category)) score = 0;
      if (filters.statuses?.length && !filters.statuses.includes(i.status)) score = 0;
      // The canonical demo reports are the main story — keep them on top
      // when a query matches them, so search always surfaces the headline issue.
      if (i.featured && score > 0) score += 10;
      return { i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.i);

  return { filters, places: placeHits, issues: issueHits };
}
