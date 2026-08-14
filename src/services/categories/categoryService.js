const STORAGE_KEY = "civicai.categories.v1";

export const DEFAULT_CATEGORIES = [
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
].map((category) => ({ ...category, source: "system", active: true, pendingReview: false }));

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "new_issue";
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readCustomCategories() {
  if (typeof localStorage === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function writeCustomCategories(categories) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function listCategories({ activeOnly = false } = {}) {
  const byKey = new Map(DEFAULT_CATEGORIES.map((category) => [category.key, category]));
  for (const category of readCustomCategories()) byKey.set(category.key, category);
  const categories = [...byKey.values()].sort((a, b) => {
    if (a.pendingReview !== b.pendingReview) return a.pendingReview ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
  return activeOnly ? categories.filter((category) => category.active) : categories;
}

export function getCategory(key) {
  return listCategories().find((category) => category.key === key) ?? null;
}

export function createCategory({ label, keywords = [], department = "General Administration", source = "admin", pendingReview = false }) {
  const cleanLabel = label?.trim();
  if (!cleanLabel) throw new Error("Category name is required.");
  const key = slugify(cleanLabel);
  const existing = getCategory(key);
  if (existing) return existing;
  const category = {
    key,
    label: cleanLabel,
    keywords: [...new Set(keywords.map((word) => word.trim().toLowerCase()).filter(Boolean))],
    department: department.trim() || "General Administration",
    source,
    active: true,
    pendingReview,
    createdAt: new Date().toISOString(),
  };
  const custom = readCustomCategories();
  custom.push(category);
  writeCustomCategories(custom);
  return category;
}

export function updateCategory(key, changes) {
  const current = getCategory(key);
  if (!current) return null;
  const updated = { ...current, ...changes, key };
  const custom = readCustomCategories().filter((category) => category.key !== key);
  custom.push(updated);
  writeCustomCategories(custom);
  return updated;
}

const STOP_WORDS = new Set(["there", "this", "that", "with", "from", "near", "issue", "problem", "please", "needs", "need", "very", "been", "have", "road", "area", "public"]);

function inferNewCategory(text) {
  const words = text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? [];
  const meaningful = words.filter((word) => !STOP_WORDS.has(word)).slice(0, 3);
  const key = slugify(meaningful.join(" ") || "unclassified civic issue");
  return { key, label: titleCase(key) };
}

export function classifyOrCreateCategory(text = "") {
  const normalized = text.toLowerCase();
  let best = null;
  for (const category of listCategories({ activeOnly: true })) {
    if (category.allowAutoMatch === false) continue;
    const matches = category.keywords.filter((keyword) => normalized.includes(keyword));
    const score = matches.reduce((total, keyword) => total + keyword.split(/\s+/).length, 0);
    if (score > 0 && (!best || score > best.score)) best = { category, score, matches };
  }
  if (best) return { ...best.category, confidence: Math.min(98, 72 + best.score * 6), created: false, matchedKeywords: best.matches };

  const inferred = inferNewCategory(text);
  const existing = getCategory(inferred.key);
  const category = existing ?? createCategory({
    label: inferred.label,
    keywords: [inferred.label.toLowerCase()],
    department: "General Administration",
    source: "ai",
    pendingReview: true,
  });
  return { ...category, confidence: 55, created: !existing, matchedKeywords: [] };
}
