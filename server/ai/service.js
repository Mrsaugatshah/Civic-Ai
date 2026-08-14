import fs from "node:fs";
import path from "node:path";
import { requestStructuredAnalysis } from "./provider.js";
import { reportPayload, systemPrompt } from "./prompt.js";
import { validateAnalysis } from "./schema.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      return { ...validateAnalysis(response.value), provider: response.provider, model: response.model, attemptCount: attempt };
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt > maxRetries) break;
      await wait(Math.min(2000, 250 * (2 ** (attempt - 1))));
    }
  }
  lastError.attemptCount = attempts;
  throw lastError;
}
