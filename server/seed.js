/**
 * CivicAI — Seed reports
 * ----------------------------------------------------------------
 * A deterministic, canonical city dataset seeded into db.reports the
 * first time the server boots (only when the reports table is empty).
 *
 * Every report uses the exact canonical shape the citizen submission
 * flow creates (see reports.js buildReport), so the whole UI — map,
 * citizen tracking, authority dashboard, admin analytics — reads real,
 * persisted rows immediately, and new citizen submissions land in the
 * same table.
 *
 * Department names use the short vocabulary expected by the
 * authority/admin dashboards ("Roads & Infrastructure", "Waste
 * Management", …). The demo authority ward11@city.gov owns
 * "Roads & Infrastructure", so its department view is populated.
 */

import { db, persist } from "./db.js";

/* ---------------------------- Deterministic RNG ---------------------------- */

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

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);

/* ------------------------------ Location map ------------------------------ */
// 0–100 map coordinates roughly matching the city map neighbourhoods.

const PLACES = {
  bharatpur: { name: "Bharatpur", x: 36, y: 43, ward: "Ward 11" },
  narayangadh: { name: "Main Road, Narayangadh", x: 41, y: 52, ward: "Ward 11" },
  ratnanagar: { name: "Ratnanagar", x: 87, y: 43, ward: "Ward 9" },
  kalika: { name: "Kalika", x: 54, y: 20, ward: "Ward 6" },
  rapti: { name: "Rapti", x: 63, y: 43, ward: "Ward 13" },
  khairahani: { name: "Khairahani", x: 39, y: 80, ward: "Ward 4" },
  madi: { name: "Madi", x: 76, y: 78, ward: "Ward 2" },
  ichchhakamana: { name: "Ichchhakamana", x: 20, y: 33, ward: "Ward 2" },
};

function place(key, label) {
  const base = PLACES[key];
  return {
    location: label ?? base.name,
    locationData: { name: label ?? base.name, mapX: base.x, mapY: base.y },
    ward: base.ward,
  };
}

/* ---------------------------- Category labels ---------------------------- */

const CATEGORY_LABELS = {
  pothole: "Pothole",
  road: "Road Damage",
  light_pole: "Light Pole",
  garbage_overflow: "Garbage Overflow",
  water: "Water & Sewage",
  electric_line: "Electric Line",
  drainage: "Drainage & Flooding",
  safety: "Public Safety",
  environment: "Environment",
  public_property: "Public Property",
  transportation: "Transportation",
  corruption: "Corruption",
  other: "Other Civic Issue",
};

/* ---------------------------- Report builder ---------------------------- */

function buildReport({
  id,
  category,
  categoryLabel,
  title,
  description,
  status,
  severity,
  priority,
  reportedAt,
  assignedAt = null,
  inProgressAt = null,
  resolvedAt = null,
  reporterId = null,
  reporterName = "Citizen",
  reportCount = 1,
  department,
  loc,
  explanation = null,
  resolution = null,
  community = null,
  votes = {},
}) {
  const label = categoryLabel ?? CATEGORY_LABELS[category] ?? title;
  const activity = [
    { key: "reported", at: reportedAt, text: "Issue reported by a citizen." },
    { key: "ai_analyzed", at: reportedAt, text: `CivicAI classified this as ${label.toLowerCase()} with ${severity} severity (priority ${priority}/100).` },
  ];
  if (assignedAt) {
    activity.push({ key: "routing_suggested", at: assignedAt, text: `Suggested routing: ${department}.` });
    activity.push({ key: "department_assigned", at: assignedAt, text: `Report assigned to ${department}.` });
  }
  if (inProgressAt) {
    activity.push({ key: "status_changed", at: inProgressAt, text: "Status changed from Assigned to In Progress." });
  }
  if (resolvedAt) {
    activity.push({
      key: "resolved",
      at: resolvedAt,
      text: "The issue was marked as resolved and resolution evidence was uploaded.",
    });
  }

  return {
    id,
    category,
    categoryLabel: label,
    title,
    description,
    ...loc,
    department,
    severity,
    priority,
    status,
    reportedAt,
    assignedAt,
    inProgressAt,
    resolvedAt,
    reporterId,
    reporterName,
    reportCount,
    imageDataUrl: null,
    aiConfidence: { classification: 90 + (priority % 8), severity: 84 + (priority % 10), department: 88 + (priority % 6) },
    explanation: explanation ?? `CivicAI classified this as ${categoryLabel} with ${severity} severity. The issue was routed to ${department}.`,
    notes: [],
    resolution,
    community,
    communityVerification: { votes, updatedAt: resolvedAt ?? assignedAt ?? reportedAt },
    activity,
  };
}

const LEGIT = ["u_102", "u_203", "u_304", "u_405", "u_506", "u_607", "u_708", "u_809", "u_910", "u_111", "u_222", "u_333", "u_444", "u_555", "u_666", "u_777", "u_888", "u_999"];

function communityVotes(count, fake = 1) {
  const votes = {};
  const pool = [...LEGIT].slice(0, count + fake);
  for (let i = 0; i < count; i += 1) votes[pool[i]] = "legit";
  for (let i = count; i < count + fake; i += 1) votes[pool[i]] = "fake";
  return votes;
}

function resolvedCommunity(id, confirmed, notConfirmed, confidence) {
  return {
    reportId: id,
    confirmed,
    notConfirmed,
    target: confirmed + notConfirmed,
    confidence,
  };
}

/* ------------------------------ Catalogue ------------------------------ */

export function buildSeedReports() {
  const reports = [];

  // ---------------------------------------------------------------
  // Flagship demo story — a citizen-reported pothole on Main Road,
  // now in progress. Attributed to the demo citizen (asha@city.gov).
  // ---------------------------------------------------------------
  reports.push(
    buildReport({
      id: "CIV-2026-008421",
      category: "pothole",
      categoryLabel: "Pothole",
      title: "Road Damage — Main Road",
      description: "Large pothole on Main Road near the school crossing. Vehicles are swerving into the other lane to avoid it — dangerous during peak hours.",
      status: "in_progress",
      severity: "high",
      priority: 87,
      reportedAt: hoursAgo(2),
      assignedAt: hoursAgo(1.5),
      inProgressAt: hoursAgo(1),
      reporterId: "u_citizen",
      reporterName: "Asha Mistry",
      reportCount: 3,
      department: "Roads & Infrastructure",
      loc: place("narayangadh"),
      explanation: "Large pothole near a school crossing. Vehicles swerve to avoid it, raising accident risk. Multiple similar reports nearby.",
      votes: communityVotes(4),
    }),
    buildReport({
      id: "CIV-2026-008102",
      category: "road",
      categoryLabel: "Road Damage",
      title: "Road Damage — Main Road",
      description: "Cracked surface widening near the same stretch on Main Road.",
      status: "under_review",
      severity: "medium",
      priority: 64,
      reportedAt: hoursAgo(6),
      reporterId: "u_citizen",
      reporterName: "Asha Mistry",
      reportCount: 2,
      department: "Roads & Infrastructure",
      loc: place("narayangadh"),
      votes: communityVotes(2),
    }),
  );

  // Asha's other active reports — so the citizen dashboard and civic
  // score are populated with her own real rows.
  const ashaActive = [
    { id: "CIV-2026-008397", category: "light_pole", categoryLabel: "Light Pole", title: "Streetlight flickering near the crossing", description: "Irregular flicker for two nights, dimming the whole crossing after dark.", status: "in_progress", severity: "medium", priority: 63, reportedAt: daysAgo(1), assignedAt: hoursAgo(20), inProgressAt: hoursAgo(8), department: "Electricity", loc: "ratnanagar", reportCount: 2 },
    { id: "CIV-2026-008340", category: "garbage_overflow", categoryLabel: "Garbage Overflow", title: "Garbage collection missed two rounds", description: "Bins overflowing near the market. Smell and strays are increasing.", status: "assigned", severity: "high", priority: 76, reportedAt: daysAgo(2), assignedAt: hoursAgo(30), department: "Waste Management", loc: "bharatpur", reportCount: 3 },
    { id: "CIV-2026-008281", category: "water", categoryLabel: "Water & Sewage", title: "Leaking water pipe", description: "Leak running from a utility box onto the footpath, wasting water all day.", status: "under_review", severity: "high", priority: 71, reportedAt: hoursAgo(5), department: "Water & Sanitation", loc: "khairahani", reportCount: 1 },
  ];
  for (const r of ashaActive) reports.push(buildReport({ ...r, reporterId: "u_citizen", reporterName: "Asha Mistry", loc: place(r.loc) }));

  // Asha's resolved reports (community wins).
  const ashaResolved = [
    { id: "CIV-2026-008198", category: "road", categoryLabel: "Road Damage", title: "Faded pedestrian crossing repainted", description: "Markings were refreshed near the school crossing.", severity: "medium", priority: 52, reportedAt: daysAgo(11), assignedAt: hoursAgo(250), inProgressAt: hoursAgo(210), resolvedAt: hoursAgo(170), department: "Roads & Infrastructure", loc: "ratnanagar", confirmed: 7, fake: 1, confidence: 82, resolution: "The pedestrian crossing was repainted by the Roads crew." },
    { id: "CIV-2026-008152", category: "safety", categoryLabel: "Public Safety", title: "Unsafe crossing near the market", description: "Missing road sign and worn markings where many shoppers cross.", severity: "high", priority: 73, reportedAt: daysAgo(9), assignedAt: hoursAgo(200), inProgressAt: hoursAgo(150), resolvedAt: hoursAgo(110), department: "Public Safety", loc: "bharatpur", confirmed: 12, fake: 1, confidence: 88, resolution: "New signage was installed and the crossing markings were repainted." },
    { id: "CIV-2026-008103", category: "garbage_overflow", categoryLabel: "Garbage Overflow", title: "Waste pile cleared near Bis Hazari lake", description: "The pile was removed and a collection schedule was added.", severity: "high", priority: 71, reportedAt: daysAgo(8), assignedAt: hoursAgo(180), inProgressAt: hoursAgo(120), resolvedAt: hoursAgo(96), department: "Waste Management", loc: "ratnanagar", confirmed: 15, fake: 1, confidence: 90, resolution: "Waste was collected and the area was cleaned." },
    { id: "CIV-2026-008051", category: "light_pole", categoryLabel: "Light Pole", title: "Dark stretch relit near the market", description: "Three lamps along the stretch were repaired.", severity: "low", priority: 44, reportedAt: daysAgo(12), assignedAt: hoursAgo(260), inProgressAt: hoursAgo(240), resolvedAt: hoursAgo(215), department: "Electricity", loc: "bharatpur", confirmed: 6, fake: 0, confidence: 78, resolution: "The streetlights were repaired and are working again." },
    { id: "CIV-2026-008029", category: "water", categoryLabel: "Water & Sewage", title: "Water pipe leak fixed", description: "The leaking pipe was repaired and the footpath dried out.", severity: "medium", priority: 66, reportedAt: daysAgo(10), assignedAt: hoursAgo(228), inProgressAt: hoursAgo(216), resolvedAt: hoursAgo(192), department: "Water & Sanitation", loc: "khairahani", confirmed: 9, fake: 1, confidence: 84, resolution: "The water pipe was repaired by the Water & Sanitation crew." },
  ];
  for (const r of ashaResolved) {
    reports.push(
      buildReport({
        id: r.id,
        category: r.category,
        categoryLabel: r.categoryLabel,
        title: r.title,
        description: r.description,
        status: "resolved",
        severity: "low",
        priority: r.priority,
        reportedAt: r.reportedAt,
        assignedAt: r.assignedAt,
        inProgressAt: r.inProgressAt,
        resolvedAt: r.resolvedAt,
        reporterId: "u_citizen",
        reporterName: "Asha Mistry",
        reportCount: 1,
        department: r.department,
        loc: place(r.loc),
        explanation: `CivicAI classified this as ${r.categoryLabel} with ${r.severity} severity. The issue was resolved by ${r.department}.`,
        resolution: { description: r.resolution, resolvedAt: r.resolvedAt, resolvedBy: "Ward maintenance crew", uploadedAt: r.resolvedAt },
        community: resolvedCommunity(r.id, r.confirmed, r.fake, r.confidence),
        votes: communityVotes(r.confirmed, r.fake),
      })
    );
  }

  // City-wide active queue — not attributed to the demo citizen, so
  // other departments/wards have live tasks too.
  const activeQueue = [
    { id: "CIV-2026-009001", category: "drainage", title: "Drain overflow after rain", description: "Water pooling knee-deep in the mornings near the bus stand.", severity: "critical", priority: 93, status: "assigned", age: 14, assigned: 8, department: "Roads & Infrastructure", loc: "rapti", reportCount: 5 },
    { id: "CIV-2026-009004", category: "electric_line", title: "Power line down after storm", description: "Downed line across the lane. Residents are without power.", severity: "critical", priority: 91, status: "assigned", age: 5, assigned: 2, department: "Electricity", loc: "ichchhakamana", reportCount: 4 },
    { id: "CIV-2026-009007", category: "water", title: "Sewage overflow near the bazaar", description: "Sewage spilling onto the footpath, blocking the walkway.", severity: "high", priority: 88, status: "in_progress", age: 20, assigned: 16, inProgress: 9, department: "Water & Sanitation", loc: "bharatpur", reportCount: 4 },
    { id: "CIV-2026-009010", category: "road", title: "Cracked road surface on the bypass", description: "Surface damage widening with every rain. Vehicles are slowing sharply.", severity: "high", priority: 84, status: "in_progress", age: 24, assigned: 20, inProgress: 10, department: "Roads & Infrastructure", loc: "rapti", reportCount: 3 },
    { id: "CIV-2026-009013", category: "garbage_overflow", title: "Waste pile near the market", description: "Waste not collected for days. Smell and strays are increasing.", severity: "high", priority: 79, status: "in_progress", age: 30, assigned: 24, inProgress: 12, department: "Waste Management", loc: "bharatpur", reportCount: 4 },
    { id: "CIV-2026-009016", category: "light_pole", title: "Streetlight out at the bus stop", description: "The corner is completely dark at night near the bus shelter.", severity: "medium", priority: 68, status: "in_progress", age: 40, assigned: 32, inProgress: 18, department: "Electricity", loc: "ratnanagar", reportCount: 2 },
    { id: "CIV-2026-009019", category: "water", title: "Waterlogging after rain", description: "Road floods knee-deep during monsoon. Vehicles stall in the mornings.", severity: "critical", priority: 89, status: "under_review", age: 6, department: "Water & Sanitation", loc: "khairahani", reportCount: 6 },
    { id: "CIV-2026-009022", category: "transportation", title: "Abandoned vehicle blocking lane", description: "Car parked for over a month with no plates. Narrowing the lane.", severity: "medium", priority: 55, status: "under_review", age: 50, department: "Roads & Infrastructure", loc: "bharatpur", reportCount: 2 },
    { id: "CIV-2026-009025", category: "environment", title: "Smoke from open burning", description: "Open burning near the settlement is affecting air quality.", severity: "medium", priority: 57, status: "under_review", age: 26, department: "Environment", loc: "ichchhakamana", reportCount: 1 },
    { id: "CIV-2026-009028", category: "public_property", title: "Damaged public shelter near Tandi", description: "Shelter roof is bent and the bench is broken after the storm.", severity: "low", priority: 42, status: "under_review", age: 18, department: "General Administration", loc: "rapti", reportCount: 2 },
    { id: "CIV-2026-009031", category: "light_pole", title: "Dark stretch near the park gate", description: "Three lamps out along the path. Elderly residents avoid it after dark.", severity: "medium", priority: 61, status: "reported", age: 3, department: "Electricity", loc: "ratnanagar", reportCount: 2 },
    { id: "CIV-2026-009034", category: "safety", title: "Hazardous alley near the hospital", description: "Deep potholes and missing light near the hospital entrance.", severity: "high", priority: 82, status: "reported", age: 2, department: "Public Safety", loc: "bharatpur", reportCount: 2 },
    { id: "CIV-2026-009037", category: "garbage_overflow", title: "Construction debris near the bridge", description: "Sand and rubble left on the pavement after a demolition.", severity: "medium", priority: 58, status: "reported", age: 4, department: "Waste Management", loc: "bharatpur", reportCount: 2 },
    { id: "CIV-2026-009040", category: "road", title: "Pothole on East-West Highway", description: "Deep pothole near the junction, growing with every rain.", severity: "critical", priority: 92, status: "reported", age: 1, department: "Roads & Infrastructure", loc: "narayangadh", reportCount: 3 },
  ];
  for (const r of activeQueue) {
    reports.push(
      buildReport({
        id: r.id,
        category: r.category,
        categoryLabel: r.category === "electric_line" ? "Electric Line" : r.category === "garbage_overflow" ? "Garbage Overflow" : r.category === "light_pole" ? "Light Pole" : undefined,
        title: r.title,
        description: r.description,
        status: r.status,
        severity: r.severity,
        priority: r.priority,
        reportedAt: hoursAgo(r.age),
        assignedAt: r.assigned ? hoursAgo(r.assigned) : null,
        inProgressAt: r.inProgress ? hoursAgo(r.inProgress) : null,
        reportCount: r.reportCount,
        department: r.department,
        loc: place(r.loc),
        votes: communityVotes(1 + (r.reportCount % 3)),
      })
    );
  }

  // Resolved community wins across the city.
  const resolvedWins = [
    { id: "CIV-2026-008047", category: "road", title: "Pothole patched on East-West Highway", description: "The deep pothole was patched and traffic flows smoothly again.", priority: 82, age: 9, department: "Roads & Infrastructure", loc: "narayangadh", confirmed: 16, fake: 1, confidence: 91, resolution: "The pothole was patched by the maintenance team." },
    { id: "CIV-2026-008039", category: "electric_line", categoryLabel: "Electric Line", title: "Power line restored after outage", description: "Power was restored after the line was repaired.", priority: 78, age: 11, department: "Electricity", loc: "ichchhakamana", confirmed: 14, fake: 1, confidence: 89, resolution: "The power line was repaired by the Electricity crew." },
    { id: "CIV-2026-008022", category: "drainage", title: "Waterlogging drain unclogged", description: "The drain was cleared and morning flooding has stopped.", priority: 67, age: 15, department: "Roads & Infrastructure", loc: "kalika", confirmed: 11, fake: 0, confidence: 87, resolution: "The drain was desilted and unclogged." },
    { id: "CIV-2026-008015", category: "garbage_overflow", categoryLabel: "Garbage Overflow", title: "Debris removed from the bridge", description: "Sand and rubble were cleared from the pavement.", priority: 58, age: 14, department: "Waste Management", loc: "bharatpur", confirmed: 10, fake: 1, confidence: 85, resolution: "Debris was removed by the Waste Management team." },
    { id: "CIV-2026-008003", category: "transportation", title: "Abandoned vehicle removed from lane", description: "The vehicle blocking the lane was towed by the city.", priority: 55, age: 16, department: "Roads & Infrastructure", loc: "bharatpur", confirmed: 9, fake: 1, confidence: 83, resolution: "The abandoned vehicle was removed by the city." },
    { id: "CIV-2026-007998", category: "environment", title: "Fallen tree branch cleared from footpath", description: "The branch was removed and the path is walkable again.", priority: 49, age: 13, department: "Environment", loc: "madi", confirmed: 8, fake: 0, confidence: 80, resolution: "The branch was removed by the Parks & Greenery team." },
    { id: "CIV-2026-007985", category: "light_pole", categoryLabel: "Light Pole", title: "Streetlight restored at the park gate", description: "The lamp was replaced and the corner is lit again at night.", priority: 48, age: 9, department: "Electricity", loc: "ratnanagar", confirmed: 12, fake: 1, confidence: 86, resolution: "The streetlight was replaced by the Street Lighting unit." },
  ];
  for (const r of resolvedWins) {
    const resolvedAt = hoursAgo(r.age * 24 - 24);
    const categoryLabel = r.categoryLabel ?? (r.category === "garbage_overflow" ? "Garbage Overflow" : r.category === "electric_line" ? "Electric Line" : r.category === "light_pole" ? "Light Pole" : r.category === "drainage" ? "Drainage & Flooding" : r.category === "environment" ? "Environment" : r.category === "transportation" ? "Transportation" : "Road Damage");
    reports.push(
      buildReport({
        id: r.id,
        category: r.category,
        categoryLabel,
        title: r.title,
        description: r.description,
        status: "resolved",
        severity: "low",
        priority: r.priority,
        reportedAt: daysAgo(r.age),
        assignedAt: hoursAgo(r.age * 24 - 20),
        inProgressAt: hoursAgo(r.age * 24 - 12),
        resolvedAt,
        reportCount: 1,
        department: r.department,
        loc: place(r.loc),
        explanation: `CivicAI classified this as ${categoryLabel} and the issue was resolved by ${r.department}.`,
        resolution: { description: r.resolution, resolvedAt, resolvedBy: "Municipal maintenance team", uploadedAt: resolvedAt },
        community: resolvedCommunity(r.id, r.confirmed, r.fake, r.confidence),
        votes: communityVotes(r.confirmed, r.fake),
      })
    );
  }

  return reports;
}

export function seedReportsIfEmpty() {
  if (db.reports.length > 0) return false;
  db.reports = buildSeedReports();
  db.confirmations = {};
  persist();
  return true;
}
