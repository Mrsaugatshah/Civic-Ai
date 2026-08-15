/**
 * City map data layer.
 *
 * Reports are loaded from the authorized `/api/reports/map` endpoint and
 * cached only for the current map view. The canvas geography is presentation
 * geometry; report coordinates always come from the database.
 */

export const CANVAS_W = 1000;
export const CANVAS_H = 600;
export const KM_PER_UNIT = 0.012;
export const CITY_CENTER = { x: 500, y: 300 };
const CITY_REF = { lat: 27.68, lon: 84.43 };
const KM_PER_DEG_LAT = 111.32;
const KM_PER_DEG_LON = 111.32 * Math.cos((CITY_REF.lat * Math.PI) / 180);
let currentIssues = [];

export const MAP_CATEGORIES = [
  { key: "road", label: "Roads" }, { key: "pothole", label: "Potholes" },
  { key: "garbage_overflow", label: "Waste" }, { key: "water", label: "Water & Sewage" },
  { key: "drainage", label: "Drainage" }, { key: "electric_line", label: "Electricity" },
  { key: "light_pole", label: "Street Lighting" }, { key: "transportation", label: "Transportation" },
  { key: "environment", label: "Environment" }, { key: "safety", label: "Public Safety" },
  { key: "public_property", label: "Public Property" }, { key: "other", label: "Other" },
];

export const CATEGORY_LABEL = Object.fromEntries(MAP_CATEGORIES.map((item) => [item.key, item.label]));
export const MAP_STATUSES = [
  { key: "submitted", label: "Submitted" }, { key: "under_review", label: "Under Review" },
  { key: "verified", label: "Verified" }, { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" }, { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];
export const STATUS_META = {
  submitted: { label: "Submitted", color: "#94A3B8" },
  under_review: { label: "Under Review", color: "#F59E0B" },
  verified: { label: "Verified", color: "#8B5CF6" },
  assigned: { label: "Assigned", color: "#8B5CF6" },
  in_progress: { label: "In Progress", color: "#0EA5E9" },
  resolved: { label: "Resolved", color: "#16A34A" },
  closed: { label: "Closed", color: "#64748B" },
  rejected: { label: "Rejected", color: "#DC2626" },
  reopened: { label: "Reopened", color: "#F97316" },
};
export const SEVERITY_MARKER_COLORS = { critical: "#DC2626", high: "#F97316", medium: "#EAB308", low: "#3B82F6" };
export const PRIORITY_LEVELS = [
  { min: 85, key: "critical", label: "Critical" }, { min: 70, key: "high", label: "High" },
  { min: 45, key: "medium", label: "Medium" }, { min: 0, key: "low", label: "Low" },
];
export function priorityLevel(score) { return score == null ? PRIORITY_LEVELS[3] : PRIORITY_LEVELS.find((item) => score >= item.min) ?? PRIORITY_LEVELS[3]; }
export function markerColor(issue) { return issue.status === "resolved" || issue.status === "closed" ? "#16A34A" : SEVERITY_MARKER_COLORS[issue.severity] ?? SEVERITY_MARKER_COLORS.medium; }
export function shouldPulse(issue) { return issue.severity === "critical" || (issue.priority ?? 0) >= 85; }

const DEPARTMENT_BY_CATEGORY = {
  road: "Roads & Infrastructure", pothole: "Roads & Infrastructure", drainage: "Roads & Infrastructure",
  transportation: "Roads & Infrastructure", garbage_overflow: "Waste Management", water: "Water & Sanitation",
  electric_line: "Electricity", light_pole: "Electricity", environment: "Environment",
  safety: "Public Safety", public_property: "Public Works", other: "General Administration",
};
export function departmentFor(issue) { return issue.department || DEPARTMENT_BY_CATEGORY[issue.category] || DEPARTMENT_BY_CATEGORY.other; }

// Stable presentation geometry for the existing city illustration.
export const NEIGHBORHOODS = [
  { key: "ichchhakamana", name: "Ichchhakamana", anchor: { x: 205, y: 200 }, poly: [20, 40, 260, 40, 260, 320, 20, 320], weight: 10 },
  { key: "bharatpur", name: "Bharatpur", anchor: { x: 360, y: 260 }, poly: [200, 120, 500, 120, 500, 400, 200, 400], weight: 55 },
  { key: "kalika", name: "Kalika", anchor: { x: 540, y: 120 }, poly: [380, 40, 700, 40, 700, 200, 380, 200], weight: 18 },
  { key: "rapti", name: "Rapti", anchor: { x: 630, y: 260 }, poly: [500, 140, 760, 140, 760, 380, 500, 380], weight: 24 },
  { key: "ratnanagar", name: "Ratnanagar", anchor: { x: 870, y: 260 }, poly: [760, 140, 980, 140, 980, 380, 760, 380], weight: 28 },
  { key: "khairahani", name: "Khairahani", anchor: { x: 390, y: 480 }, poly: [260, 400, 520, 400, 520, 560, 260, 560], weight: 20 },
  { key: "madi", name: "Madi", anchor: { x: 760, y: 470 }, poly: [540, 380, 980, 380, 980, 560, 540, 560], weight: 14 },
];
export const SEARCH_PLACES = [
  ...NEIGHBORHOODS.map((item) => ({ name: item.name, x: item.anchor.x, y: item.anchor.y, kind: "neighborhood" })),
  { name: "Narayangadh", x: 410, y: 315, kind: "area" }, { name: "Sauraha", x: 825, y: 365, kind: "area" },
  { name: "Tandi", x: 623, y: 332, kind: "area" }, { name: "Rampur", x: 585, y: 195, kind: "area" },
  { name: "Meghauli", x: 310, y: 425, kind: "area" }, { name: "Fulbari", x: 250, y: 120, kind: "area" },
  { name: "Devghat", x: 195, y: 135, kind: "area" }, { name: "Mahendra Highway", x: 400, y: 330, kind: "road" },
  { name: "Chitwan National Park", x: 560, y: 505, kind: "park" }, { name: "Bis Hazari Tal", x: 845, y: 335, kind: "area" },
  { name: "Narayani River", x: 150, y: 290, kind: "river" }, { name: "Rapti River", x: 590, y: 435, kind: "river" },
];

export function gpsToCanvas(latitude, longitude) {
  return {
    x: CITY_CENTER.x + ((longitude - CITY_REF.lon) * KM_PER_DEG_LON) / KM_PER_UNIT,
    y: CITY_CENTER.y - ((latitude - CITY_REF.lat) * KM_PER_DEG_LAT) / KM_PER_UNIT,
  };
}
export function getCityIssues() { return currentIssues; }

export async function fetchCityIssues({ signal } = {}) {
  const response = await fetch("/api/reports/map", { credentials: "include", signal });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "Could not load city reports.");
  if (!Array.isArray(body.data)) throw new Error("The map returned an invalid report dataset.");
  currentIssues = body.data.filter((report) => Number.isFinite(Number(report.latitude)) && Number.isFinite(Number(report.longitude)) && !(Number(report.latitude) === 0 && Number(report.longitude) === 0)).map((report) => {
    const point = gpsToCanvas(Number(report.latitude), Number(report.longitude));
    return { ...report, location: report.address, reportedAt: report.reportedAt, severity: priorityLevel(report.priority).key, x: point.x, y: point.y, votes: 0 };
  });
  return currentIssues;
}

export function canvasToKm(a, b = CITY_CENTER) { return Math.hypot(a.x - b.x, a.y - b.y) * KM_PER_UNIT; }
export function pointInPoly(px, py, poly) { let inside = false; for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) { const xi = poly[i], yi = poly[i + 1], xj = poly[j], yj = poly[j + 1]; const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi; if (intersect) inside = !inside; } return inside; }
export function neighborhoodAt(x, y) { return NEIGHBORHOODS.find((item) => pointInPoly(x, y, item.poly)) ?? null; }

export function matchesFilters(issue, filters = {}) {
  const { categories = [], statuses = [], priorities = [], time = "all", distance, center, maxKm } = filters;
  if (categories.length && !categories.includes(issue.category)) return false;
  if (statuses.length && !statuses.includes(issue.status)) return false;
  if (priorities.length && !priorities.includes(priorityLevel(issue.priority).key)) return false;
  if (time !== "all") { const age = Date.now() - new Date(issue.reportedAt).getTime(); const limits = { today: 86400000, week: 604800000, month: 2592000000, "90d": 7776000000 }; if (age > (limits[time] ?? limits["90d"])) return false; }
  if (distance && center && maxKm && canvasToKm({ x: issue.x, y: issue.y }, center) > maxKm) return false;
  return true;
}
export function queryCityIssues({ bounds, filters = {}, signal } = {}) { if (signal?.aborted) return Promise.resolve({ items: [], total: currentIssues.length }); const items = currentIssues.filter((issue) => (!bounds || (issue.x >= bounds.minX && issue.x <= bounds.maxX && issue.y >= bounds.minY && issue.y <= bounds.maxY)) && matchesFilters(issue, filters)); return Promise.resolve({ items, total: currentIssues.length }); }
export function viewportBounds(cx, cy, zoom, cw, ch) { const halfW = cw / (2 * zoom), halfH = ch / (2 * zoom), pad = 80; return { minX: cx - halfW - pad, maxX: cx + halfW + pad, minY: cy - halfH - pad, maxY: cy + halfH + pad }; }

export const TIMELINE_STEPS = [
  { key: "submitted", label: "Submitted" }, { key: "ai_analyzed", label: "AI Analyzed" },
  { key: "under_review", label: "Under Review" }, { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" }, { key: "resolved", label: "Resolved" },
];
const STATUS_INDEX = { submitted: 1, under_review: 3, verified: 3, assigned: 4, in_progress: 5, resolved: 6, closed: 6 };
export function timelineFor(issue) { const doneIdx = STATUS_INDEX[issue.status] ?? 1; return TIMELINE_STEPS.map((step, index) => ({ ...step, done: index < doneIdx, current: index === doneIdx - 1, at: index === 0 ? issue.reportedAt : null })); }
export function relatedReports(issue, radiusKm = 0.5) { return currentIssues.filter((item) => item.id !== issue.id && item.status !== "rejected" && canvasToKm({ x: item.x, y: item.y }, { x: issue.x, y: issue.y }) <= radiusKm).map((item) => ({ ...item, km: canvasToKm({ x: item.x, y: item.y }, { x: issue.x, y: issue.y }) })).sort((a, b) => a.km - b.km).slice(0, 3); }
export function similarReports(issue, radiusKm = 0.5) { return relatedReports(issue, radiusKm).filter((item) => item.category === issue.category); }
export function areaSummary(cx, cy, radiusKm = 2) { const inArea = currentIssues.filter((item) => canvasToKm({ x: item.x, y: item.y }, { x: cx, y: cy }) <= radiusKm), week = 604800000, now = Date.now(), breakdown = {}; for (const item of inArea) breakdown[item.category] = (breakdown[item.category] ?? 0) + 1; const resolvedThisWeek = inArea.filter((item) => ["resolved", "closed"].includes(item.status) && now - new Date(item.reportedAt).getTime() <= week).length; const resolvedLastWeek = inArea.filter((item) => ["resolved", "closed"].includes(item.status) && now - new Date(item.reportedAt).getTime() > week && now - new Date(item.reportedAt).getTime() <= week * 2).length; return { active: inArea.filter((item) => !["resolved", "closed"].includes(item.status)).length, total: inArea.length, resolvedThisWeek, trendPct: resolvedLastWeek ? Math.round(((resolvedThisWeek - resolvedLastWeek) / resolvedLastWeek) * 100) : resolvedThisWeek ? 100 : 0, breakdown }; }

function clusterMetrics(issues) { const grouped = {}; for (const issue of issues) (grouped[issue.category] ??= []).push(issue); return Object.entries(grouped).filter(([, list]) => list.length >= 3).map(([category, list]) => { const cx = list.reduce((sum, item) => sum + item.x, 0) / list.length, cy = list.reduce((sum, item) => sum + item.y, 0) / list.length; return { category, count: list.length, cx, cy, radius: Math.max(...list.map((item) => Math.hypot(item.x - cx, item.y - cy))) }; }).sort((a, b) => b.count - a.count); }
export function computeInsights(issues = []) { const insights = [], top = clusterMetrics(issues)[0]; if (top) { const hood = neighborhoodAt(top.cx, top.cy); insights.push({ id: "concentration", kind: "area", headline: `${CATEGORY_LABEL[top.category] ?? top.category} reports are concentrated around ${hood?.name ?? "the city center"}`, body: `${top.count} reports cluster within a small area. Resources and patrols here have the highest impact right now.`, focus: { cx: top.cx, cy: top.cy, radiusKm: Math.max(0.8, top.radius * KM_PER_UNIT) }, confidence: "Based on current reports" }); } const active = issues.filter((item) => !["resolved", "closed"].includes(item.status)).length, resolvedWeek = issues.filter((item) => ["resolved", "closed"].includes(item.status) && Date.now() - new Date(item.reportedAt).getTime() <= 604800000).length; if (active) insights.push({ id: "progress", kind: "progress", headline: `${resolvedWeek} issues were resolved across the authorized area in the last 7 days`, body: `${active} issues remain open.`, focus: { cx: CITY_CENTER.x, cy: CITY_CENTER.y, radiusKm: 8 }, confidence: "Based on current reports" }); const newest = [...issues].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))[0]; if (newest) insights.push({ id: "newest", kind: "area", headline: `A new ${CATEGORY_LABEL[newest.category] ?? "issue"} report arrived`, body: `${newest.title} was reported near ${newest.location}.`, focus: { cx: newest.x, cy: newest.y, radiusKm: 0.6 }, confidence: "Based on current reports" }); return insights; }

export function parseSearchQuery(query) { const q = String(query ?? "").toLowerCase().trim(), filters = {}; if (!q) return { filters, places: [], issues: [] }; if (/(resolved|fixed)/.test(q)) filters.statuses = ["resolved"]; else if (/under review/.test(q)) filters.statuses = ["under_review"]; else if (/(in progress|ongoing)/.test(q)) filters.statuses = ["in_progress"]; else if (/(submitted|reported|new)/.test(q)) filters.statuses = ["submitted"]; if (/(critical|urgent)/.test(q)) filters.priorities = ["critical"]; else if (/high/.test(q)) filters.priorities = ["high", "critical"]; const categoryMatchers = { garbage_overflow: /waste|garbage|trash|rubbish|debris|litter/, water: /water|leak|pipe|sewage/, drainage: /drain|flood/, electric_line: /power|electric|outage|wiring/, light_pole: /streetlight|street light|lamp|lighting|dark|unlit/, road: /road|pothole|pavement|damage/, transportation: /traffic|vehicle|parking|bus/, environment: /environment|pollution|smoke|air/, safety: /safety|hazard|crime|danger/ }; const matched = Object.entries(categoryMatchers).find(([, matcher]) => matcher.test(q)); if (matched) filters.categories = [matched[0]]; const km = q.match(/(?:within\s+)?([0-9.]+)\s*km/); if (km) filters.maxKm = Number(km[1]); if (/near me|around me|nearby/.test(q)) filters.nearMe = true; const tokens = q.split(/[^a-z0-9]+/).filter((token) => token.length > 2), places = SEARCH_PLACES.filter((place) => tokens.some((token) => place.name.toLowerCase().includes(token))).slice(0, 4), issues = currentIssues.filter((issue) => tokens.some((token) => `${issue.title} ${issue.location} ${issue.description}`.toLowerCase().includes(token))).slice(0, 6); return { filters, places, issues }; }
