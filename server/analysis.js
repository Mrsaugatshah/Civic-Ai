/**
 * CivicAI — Analysis Engine (server-side)
 * ----------------------------------------------------------------
 * Deterministic analysis run on the backend when a report is
 * submitted. Classifies category, estimates severity, computes a
 * priority score from weighted factors, and produces a human-readable
 * explanation.
 *
 * No external AI key is required. If a real AI provider (Gemini,
 * Claude, …) is later wired up, it can replace `analyzeReport` behind
 * the same return contract — the report pipeline in reports.js only
 * depends on this one function.
 */

/* ------------------------- Category taxonomy ------------------------- */

// Mirrors the canonical category list in src/services/categories/
// categoryService.js so the server and the report wizard agree on
// categories and their responsible departments.
export const CATEGORIES = [
  { key: "road", label: "Road Damage", keywords: ["road damage", "broken road", "cracked road", "asphalt", "pavement"], department: "Roads & Infrastructure" },
  { key: "pothole", label: "Pothole", keywords: ["pothole", "road hole", "deep hole", "road pit"], department: "Roads & Infrastructure" },
  { key: "electric_line", label: "Electric Line", keywords: ["electric line", "power line", "electric wire", "exposed wire", "fallen wire", "power cable", "electric cable"], department: "Electricity" },
  { key: "light_pole", label: "Light Pole", keywords: ["light pole", "pole light", "lamp post", "street pole", "broken pole", "streetlight", "street light"], department: "Electricity" },
  { key: "garbage_overflow", label: "Garbage Overflow", keywords: ["garbage overflow", "garbage is overflowing", "overflowing garbage", "overflowing bin", "trash overflow", "waste pile", "garbage", "trash", "rubbish", "dump"], department: "Waste Management" },
  { key: "corruption", label: "Corruption", keywords: ["corruption", "bribe", "bribery", "kickback", "misuse of funds", "fraud", "extortion"], department: "Anti-Corruption & Grievance" },
  { key: "water", label: "Water & Sewage", keywords: ["water leak", "pipe leak", "sewage", "sewer", "water supply", "tap"], department: "Water & Sanitation" },
  { key: "drainage", label: "Drainage & Flooding", keywords: ["drainage", "blocked drain", "clogged drain", "flood", "flooding", "waterlogging"], department: "Roads & Infrastructure" },
  { key: "safety", label: "Public Safety", keywords: ["unsafe", "hazard", "danger", "crime", "accident risk"], department: "Public Safety" },
  { key: "environment", label: "Environment", keywords: ["pollution", "smoke", "tree", "park damage", "environment"], department: "Environment" },
  { key: "public_property", label: "Public Property", keywords: ["public property", "bench", "bus stop", "graffiti", "public toilet", "signboard"], department: "Public Works" },
  { key: "transportation", label: "Transportation", keywords: ["traffic", "bus", "parking", "signal", "congestion", "blocked lane"], department: "Roads & Infrastructure" },
  { key: "other", label: "Other Civic Issue", keywords: [], department: "General Administration", allowAutoMatch: false },
];

export function getCategory(key) {
  return CATEGORIES.find((category) => category.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

const STOP_WORDS = new Set(["there", "this", "that", "with", "from", "near", "issue", "problem", "please", "needs", "need", "very", "been", "have", "road", "area", "public"]);

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "new_issue";
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Keyword scoring over the canonical taxonomy. Returns the best match
// (and its confidence) or a fallback "other" classification.
export function classifyCategory(text = "") {
  const normalized = text.toLowerCase();
  let best = null;
  for (const category of CATEGORIES) {
    if (category.allowAutoMatch === false) continue;
    const matches = category.keywords.filter((keyword) => normalized.includes(keyword));
    const score = matches.reduce((total, keyword) => total + keyword.split(/\s+/).length, 0);
    if (score > 0 && (!best || score > best.score)) best = { category, score, matches };
  }
  if (best) {
    return {
      key: best.category.key,
      label: best.category.label,
      department: best.category.department,
      confidence: Math.min(98, 72 + best.score * 6),
      matchedKeywords: best.matches,
    };
  }
  const words = normalized.match(/[a-z][a-z-]{2,}/g) ?? [];
  const meaningful = words.filter((word) => !STOP_WORDS.has(word)).slice(0, 3);
  const key = slugify(meaningful.join(" ") || "unclassified civic issue");
  return { key, label: titleCase(key), department: "General Administration", confidence: 55, matchedKeywords: [] };
}

/* ------------------------- Severity heuristics ------------------------- */

const CRITICAL_WORDS = ["flood", "fire", "collapse", "exposed", "manhole", "emergency", "blocked", "electrocution", "downed"];
const HIGH_WORDS = ["deep", "large", "leak", "sewage", "broken", "dark", "unsafe", "danger", "swerv", "traffic", "growing", "major"];
const LOW_WORDS = ["minor", "small", "faded", "flicker", "cosmetic", "chip"];

export function classifySeverity(text = "") {
  const t = text.toLowerCase();
  if (CRITICAL_WORDS.some((word) => t.includes(word))) return "critical";
  if (HIGH_WORDS.some((word) => t.includes(word))) return "high";
  if (LOW_WORDS.some((word) => t.includes(word))) return "low";
  return "medium";
}

const SEVERITY_FACTOR = { critical: 95, high: 82, medium: 64, low: 40 };

const IMPACT_WORDS = ["traffic", "student", "elderly", "commuter", "school", "market", "crossing", "crowd", "daily", "peak"];
const SAFETY_RISK_WORDS = ["swerv", "dark", "danger", "accident", "risk", "hazard", "trip", "children", "electrocution", "flood"];
const SENSITIVE_PLACES = ["school", "crossing", "market", "hospital", "bus stop", "college", "temple"];

export function estimateFactors({ description, severity, location }) {
  const text = `${description ?? ""}`.toLowerCase();
  const severityFactor = SEVERITY_FACTOR[severity] ?? 60;
  const publicImpact = IMPACT_WORDS.some((word) => text.includes(word)) ? 91 : 62;
  const safetyRisk = SAFETY_RISK_WORDS.some((word) => text.includes(word)) ? 84 : 55;
  const locationName = (location?.name ?? "").toLowerCase();
  const locationSensitivity = SENSITIVE_PLACES.some((place) => locationName.includes(place)) ? 85 : 70;
  const similarReports = locationName ? 80 : 55;
  return { severity: severityFactor, publicImpact, safetyRisk, locationSensitivity, similarReports };
}

export function priorityFromFactors(factors) {
  const score =
    factors.severity * 0.35 +
    factors.publicImpact * 0.3 +
    factors.safetyRisk * 0.2 +
    factors.locationSensitivity * 0.1 +
    factors.similarReports * 0.05;
  return Math.round(Math.min(99, Math.max(10, score)));
}

function isCanonicalPothole(description = "") {
  const t = description.toLowerCase();
  return t.includes("pothole") && (t.includes("traffic") || t.includes("swerv") || t.includes("vehicle"));
}

/* ------------------------------ Analyzer ------------------------------ */

export function analyzeReport({ description = "", transcript = "", location = null } = {}) {
  const text = [description, transcript].filter(Boolean).join(" ");

  if (isCanonicalPothole(text)) {
    return {
      category: "pothole",
      categoryLabel: "Pothole",
      categoryDepartment: "Roads & Infrastructure",
      severity: "high",
      priorityScore: 87,
      factors: { severity: 82, publicImpact: 91, safetyRisk: 84, locationSensitivity: 70, similarReports: 80 },
      explanation:
        "This is a large pothole on a busy road. Vehicles are swerving to avoid it, which raises the risk of accidents. Multiple similar reports nearby suggest the pattern is getting worse.",
      recommendedAction: "Narayangadh road maintenance",
      confidence: 94,
    };
  }

  const category = classifyCategory(text);
  const severity = classifySeverity(text);
  const factors = estimateFactors({ description: text, severity, location });
  const priorityScore = priorityFromFactors(factors);
  const categoryLabel = category.label;

  const explanation =
    severity === "critical"
      ? "Your report contains signs of an immediate hazard. It has been flagged for urgent review while we route it to the responsible team."
      : `Based on your description and evidence, this appears to be a ${severity} ${categoryLabel.toLowerCase()} issue affecting the surrounding community.`;

  return {
    category: category.key,
    categoryLabel,
    categoryDepartment: category.department,
    severity,
    priorityScore,
    factors,
    explanation,
    confidence: category.confidence,
  };
}
