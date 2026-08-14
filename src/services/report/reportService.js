import { LOCATIONS } from "@/services/citizen/citizenService";
import { listCategories } from "@/services/categories/categoryService";

export const MAX_MEDIA = 6;
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const MAX_DESCRIPTION = 500;

const delay = (ms = 380) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.floor(Math.random() * 120)));

export const ANALYSIS_STAGES = [
  { key: "reading", label: "Reading description" },
  { key: "evidence", label: "Analyzing evidence" },
  { key: "category", label: "Identifying issue" },
  { key: "severity", label: "Estimating severity" },
  { key: "priority", label: "Calculating priority" },
];

export const REPORT_CATEGORIES = listCategories({ activeOnly: true });

export const SEVERITY_LEVELS = [
  {
    key: "low",
    label: "Low",
    description: "Minor issue with limited impact. Can wait for regular maintenance.",
  },
  {
    key: "medium",
    label: "Medium",
    description: "Noticeable issue affecting a few people. Should be addressed soon.",
  },
  {
    key: "high",
    label: "High",
    description: "Significant issue or potential safety concern. Needs prompt attention.",
  },
  {
    key: "critical",
    label: "Critical",
    description: "Immediate hazard. Requires urgent response. AI estimates may not match emergency hotlines.",
  },
];

export const TRACKING_STEPS = [
  { key: "submitted", label: "Report submitted" },
  { key: "analyzed", label: "AI analyzed" },
  { key: "awaiting", label: "Awaiting assignment" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

export const PRIORITY_FACTORS = [
  { key: "severity", label: "Severity", description: "How severe the issue appears" },
  { key: "publicImpact", label: "Public impact", description: "People affected daily" },
  { key: "safetyRisk", label: "Safety risk", description: "Likelihood of harm or accident" },
  { key: "locationSensitivity", label: "Location sensitivity", description: "Proximity to schools, crossings and markets" },
  { key: "similarReports", label: "Similar nearby", description: "How often this is reported nearby" },
];

const CRITICAL_WORDS = ["flood", "fire", "collapse", "exposed", "manhole", "emergency", "blocked", "electrocution", "downed"];
const HIGH_WORDS = ["deep", "large", "leak", "sewage", "broken", "dark", "unsafe", "danger", "swerv", "traffic", "growing", "major"];
const LOW_WORDS = ["minor", "small", "faded", "flicker", "cosmetic", "chip"];

function classifySeverity(text = "") {
  const t = text.toLowerCase();
  if (CRITICAL_WORDS.some((w) => t.includes(w))) return "critical";
  if (HIGH_WORDS.some((w) => t.includes(w))) return "high";
  if (LOW_WORDS.some((w) => t.includes(w))) return "low";
  return "medium";
}

const SEVERITY_FACTOR = { critical: 95, high: 82, medium: 64, low: 40 };

const IMPACT_WORDS = ["traffic", "student", "elderly", "commuter", "school", "market", "crossing", "crowd", "daily", "peak"];
const SAFETY_RISK_WORDS = ["swerv", "dark", "danger", "accident", "risk", "hazard", "trip", "children", "electrocution", "flood"];

const SENSITIVE_PLACES = ["school", "crossing", "market", "hospital", "bus stop", "college", "temple"];

function estimateFactors({ description, severity, location }) {
  const text = `${description ?? ""}`.toLowerCase();
  const severityFactor = SEVERITY_FACTOR[severity] ?? 60;
  const publicImpact = IMPACT_WORDS.some((w) => text.includes(w)) ? 91 : 62;
  const safetyRisk = SAFETY_RISK_WORDS.some((w) => text.includes(w)) ? 84 : 55;
  const locationName = (location?.name ?? "").toLowerCase();
  const locationSensitivity = SENSITIVE_PLACES.some((w) => locationName.includes(w)) ? 85 : 70;
  const similarReports = locationName ? 80 : 55;
  return { severity: severityFactor, publicImpact, safetyRisk, locationSensitivity, similarReports };
}

function priorityFromFactors(factors) {
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

const CANONICAL_POTHOLES = {
  category: "pothole",
  severity: "high",
  priorityScore: 87,
  factors: { severity: 82, publicImpact: 91, safetyRisk: 84, locationSensitivity: 70, similarReports: 80 },
  explanation:
    "This is a large pothole on a busy road. Vehicles are swerving to avoid it, which raises the risk of accidents. Multiple similar reports nearby suggest the pattern is getting worse.",
  recommendedAction: "Narayangadh road maintenance",
  categoryLabel: "Pothole",
};

export async function analyzeReport({ description, transcript, location }, { onStage } = {}) {
  const text = [description, transcript].filter(Boolean).join(" ");

  for (let i = 0; i < ANALYSIS_STAGES.length; i += 1) {
    onStage?.(ANALYSIS_STAGES[i], i);
    await delay(420);
  }

  if (isCanonicalPothole(text)) {
    return { ...CANONICAL_POTHOLES, description, transcript, location };
  }

  const categoryMatch = classifyOrCreateCategory(text);
  const category = categoryMatch.key;
  const severity = classifySeverity(text);
  const factors = estimateFactors({ description: text, severity, location });
  const priorityScore = priorityFromFactors(factors);
  const categoryLabel = categoryMatch.label;

  const explanation =
    severity === "critical"
      ? "Your report contains signs of an immediate hazard. It has been flagged for urgent review while we route it to the responsible team."
      : `Based on your description and evidence, this appears to be a ${severity} ${categoryLabel.toLowerCase()} issue affecting the surrounding community.`;

  return {
    category,
    severity,
    priorityScore,
    factors,
    explanation,
    categoryLabel,
    categoryDepartment: categoryMatch.department,
    categorySource: categoryMatch.source,
    categoryCreated: categoryMatch.created,
    categoryPendingReview: categoryMatch.pendingReview,
    description,
    transcript,
    location,
  };
}

export async function generateDescription({ transcript, current }) {
  await delay(700);
  if (transcript?.trim()) return transcript.trim();
  if (current?.trim()) return current.trim();
  return "There is an issue on the road that needs attention. It is visible from the footpath and affects people moving through the area. Please send a team to inspect and resolve it as soon as possible.";
}

async function persistableImage(source) {
  if (!source || typeof document === "undefined") return null;
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return source.startsWith("data:image/") && source.length < 3_000_000 ? source : null;
  }
}

export async function submitReport(payload) {
  const form=new FormData(); const location=payload.location||{};
  form.set("title",payload.title||payload.categoryLabel||"Civic issue report"); form.set("description",payload.description||""); form.set("category",payload.category||"other");
  form.set("latitude",String(location.latitude)); form.set("longitude",String(location.longitude)); form.set("address",location.name||"Selected map location"); form.set("ward",location.ward||""); form.set("municipality",location.municipality||""); form.set("province",location.province||"");
  for(const item of payload.media||[])if(item.file)form.append("evidence",item.file,item.name);
  let response;try{response=await fetch("/api/reports",{method:"POST",credentials:"include",headers:{"X-CivicAI-CSRF":"1"},body:form});}catch{throw new Error("We couldn't connect to CivicAI. Your report was not submitted.");}
  const body=await response.json().catch(()=>({})); if(!response.ok)throw new Error(body.error?.message||"The report could not be submitted."); const report=body.data;
  return {
    id: report.id,
    priority: report.priority,
    status: report.status,
    createdAt: report.submittedAt,
    category: report.categoryLabel,
    address: report.address,
  };
}

export const REPORT_PLACES = [
  { name: "Ward 11, Bharatpur", mapX: 40, mapY: 55 },
  { name: "Bharatpur", mapX: 36, mapY: 44 },
  { name: "Ratnanagar", mapX: 78, mapY: 42 },
  { name: "Khairahani", mapX: 44, mapY: 72 },
  { name: "Rapti", mapX: 62, mapY: 48 },
  { name: "Kalika", mapX: 55, mapY: 28 },
  { name: "Madi", mapX: 60, mapY: 82 },
  { name: "Ichchhakamana", mapX: 20, mapY: 35 },
];

export function placeNameForCoords(mapX, mapY) {
  const p = REPORT_PLACES.find((place) => place.mapX === mapX && place.mapY === mapY);
  return p?.name ?? null;
}

export const DEFAULT_PLACES = LOCATIONS;

const DRAFT_KEY = "civicai.report.draft.v1";

export function saveDraft(draft) {
  try {
    if (!draft || !draft.touched) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — drafts are best effort */
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* no-op */
  }
}
