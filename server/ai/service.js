import fs from "node:fs";
import path from "node:path";
import { requestStructuredAnalysis } from "./provider.js";
import { reportPayload, systemPrompt } from "./prompt.js";
import { validateAnalysis } from "./schema.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// OpenAI-compatible providers occasionally return a semantically equivalent
// compact object even when JSON mode is enabled. Repair only documented,
// unambiguous aliases/defaults before the strict schema validator runs.
function normalizeProviderObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const normalized = { ...value };
  if (normalized.authenticity_assessment === undefined && normalized.authenticity !== undefined) normalized.authenticity_assessment = normalized.authenticity;
  if (normalized.requires_immediate_attention === undefined && normalized.immediate_attention !== undefined) normalized.requires_immediate_attention = normalized.immediate_attention;
  if (normalized.safety_risk === true) normalized.safety_risk = "moderate";
  if (normalized.safety_risk === false) normalized.safety_risk = "none";
  if (normalized.severity === undefined && typeof normalized.priority === "string") normalized.severity = normalized.priority;
  if (normalized.requires_immediate_attention === undefined) normalized.requires_immediate_attention = ["high", "critical"].includes(normalized.priority) || ["high", "critical"].includes(normalized.safety_risk);
  if (normalized.subcategory === undefined) normalized.subcategory = null;
  if (normalized.possible_duplicate_keywords === undefined) normalized.possible_duplicate_keywords = [];
  if (normalized.tags === undefined) normalized.tags = [];
  if (normalized.detected_language === undefined) normalized.detected_language = "English";
  if (normalized.suspicion_indicators === undefined) normalized.suspicion_indicators = [];
  delete normalized.authenticity;
  delete normalized.immediate_attention;
  return normalized;
}

function imageInputs(evidence, uploadDir) {
  if (process.env.AI_ENABLE_IMAGE_ANALYSIS !== "true") return [];
  return evidence.filter((item) => ["image/jpeg", "image/png", "image/webp"].includes(item.mime_type) && item.file_size <= 4 * 1024 * 1024).slice(0, 3).map((item) => ({ mimeType: item.mime_type, data: fs.readFileSync(path.join(uploadDir, item.storage_name)) }));
}

export async function analyzeReportWithAI({ report, duplicateCandidates = [], evidence = [], uploadDir }) {
  const configuredRetries = Number(process.env.AI_MAX_RETRIES);
  const maxRetries = Math.min(4, Math.max(0, Number.isFinite(configuredRetries) ? configuredRetries : 2));
  let lastError;
  let attempts = 0;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
    attempts = attempt;
    try {
      const response = await requestStructuredAnalysis({ system: systemPrompt(), payload: reportPayload(report, duplicateCandidates), images: imageInputs(evidence, uploadDir) });
      return { ...validateAnalysis(normalizeProviderObject(response.value)), provider: response.provider, model: response.model, attemptCount: attempt };
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt > maxRetries) break;
      await wait(Math.min(2000, 250 * (2 ** (attempt - 1))));
    }
  }
  lastError.attemptCount = attempts;
  throw lastError;
}
