import { CATEGORIES } from "../analysis.js";

export const PRIORITIES = ["low", "medium", "high", "critical"];
export const SEVERITIES = ["low", "medium", "high", "critical"];
export const SAFETY_RISKS = ["none", "low", "moderate", "high", "critical"];
export const AUTHENTICITY_ASSESSMENTS = ["likely_normal", "needs_review", "suspicious"];
export const DEPARTMENTS = [...new Set(CATEGORIES.map((item) => item.department))];
export const CATEGORY_KEYS = CATEGORIES.map((item) => item.key);

const PRIORITY_SCORES = { low: 25, medium: 50, high: 75, critical: 95 };
const ALLOWED_KEYS = new Set([
  "category", "subcategory", "priority", "severity", "department", "confidence", "summary",
  "reasoning_summary", "safety_risk", "requires_immediate_attention", "possible_duplicate_keywords",
  "tags", "detected_language", "authenticity_assessment", "suspicion_indicators",
]);

function text(value, name, { min = 0, max = 500, optional = false } = {}) {
  if (optional && (value === null || value === undefined || value === "")) return null;
  if (typeof value !== "string") throw invalid(`${name} must be text.`);
  const clean = [...value].map((character) => { const code = character.charCodeAt(0); return code < 32 || code === 127 ? " " : character; }).join("").replace(/\s+/g, " ").trim();
  if (clean.length < min || clean.length > max) throw invalid(`${name} has an invalid length.`);
  return clean;
}

function stringList(value, name, maxItems, maxLength) {
  if (!Array.isArray(value) || value.length > maxItems) throw invalid(`${name} must be a bounded list.`);
  return [...new Set(value.map((item) => text(item, name, { min: 1, max: maxLength })).map((item) => item.toLowerCase()))];
}

export function invalid(message) {
  return Object.assign(new Error(message), { code: "AI_INVALID_RESPONSE", retryable: true });
}

export function validateAnalysis(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid("AI response must be an object.");
  for (const key of Object.keys(value)) if (!ALLOWED_KEYS.has(key)) throw invalid(`AI response contains an unexpected field: ${key}.`);
  if (!CATEGORY_KEYS.includes(value.category)) throw invalid("AI returned an unknown category.");
  if (!PRIORITIES.includes(value.priority)) throw invalid("AI returned an unknown priority.");
  if (!SEVERITIES.includes(value.severity)) throw invalid("AI returned an unknown severity.");
  if (!DEPARTMENTS.includes(value.department)) throw invalid("AI returned an unknown department.");
  if (!SAFETY_RISKS.includes(value.safety_risk)) throw invalid("AI returned an unknown safety risk.");
  if (!AUTHENTICITY_ASSESSMENTS.includes(value.authenticity_assessment)) throw invalid("AI returned an unknown authenticity assessment.");
  if (typeof value.confidence !== "number" || !Number.isFinite(value.confidence) || value.confidence < 0 || value.confidence > 1) throw invalid("AI confidence must be between 0 and 1.");
  if (typeof value.requires_immediate_attention !== "boolean") throw invalid("Immediate-attention must be boolean.");
  if (["high", "critical"].includes(value.safety_risk) && !value.requires_immediate_attention) throw invalid("High safety risk must require immediate attention.");

  const summary = text(value.summary, "summary", { min: 10, max: 500 });
  const reasoningSummary = text(value.reasoning_summary, "reasoning_summary", { min: 10, max: 500 });
  const subcategory = text(value.subcategory, "subcategory", { max: 100, optional: true });
  const detectedLanguage = text(value.detected_language, "detected_language", { min: 2, max: 50 });
  const possibleDuplicateKeywords = stringList(value.possible_duplicate_keywords, "possible_duplicate_keywords", 12, 60);
  const tags = stringList(value.tags, "tags", 12, 40);
  const suspicionIndicators = stringList(value.suspicion_indicators, "suspicion_indicators", 8, 160);

  return {
    category: value.category,
    subcategory,
    priority: value.priority,
    priorityScore: PRIORITY_SCORES[value.priority],
    severity: value.severity,
    department: value.department,
    confidence: value.confidence,
    summary,
    reasoningSummary,
    safetyRisk: value.safety_risk,
    requiresImmediateAttention: value.requires_immediate_attention,
    possibleDuplicateKeywords,
    tags,
    detectedLanguage,
    authenticityAssessment: value.authenticity_assessment,
    suspicionIndicators,
  };
}

export function providerJsonSchema() {
  const stringArray = (maxItems, maxLength) => ({ type: "array", maxItems, items: { type: "string", minLength: 1, maxLength } });
  return {
    name: "civic_report_analysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [...ALLOWED_KEYS],
      properties: {
        category: { type: "string", enum: CATEGORY_KEYS },
        subcategory: { type: ["string", "null"], maxLength: 100 },
        priority: { type: "string", enum: PRIORITIES },
        severity: { type: "string", enum: SEVERITIES },
        department: { type: "string", enum: DEPARTMENTS },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        summary: { type: "string", minLength: 10, maxLength: 500 },
        reasoning_summary: { type: "string", minLength: 10, maxLength: 500 },
        safety_risk: { type: "string", enum: SAFETY_RISKS },
        requires_immediate_attention: { type: "boolean" },
        possible_duplicate_keywords: stringArray(12, 60),
        tags: stringArray(12, 40),
        detected_language: { type: "string", minLength: 2, maxLength: 50 },
        authenticity_assessment: { type: "string", enum: AUTHENTICITY_ASSESSMENTS },
        suspicion_indicators: stringArray(8, 160),
      },
    },
  };
}
