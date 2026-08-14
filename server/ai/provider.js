import { providerJsonSchema } from "./schema.js";

export class AIProviderError extends Error {
  constructor(code, message, { retryable = false, status } = {}) { super(message); this.code = code; this.retryable = retryable; this.status = status; }
}

function config() {
  const provider = (process.env.AI_PROVIDER || "").trim().toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!provider || !apiKey || !model) throw new AIProviderError("AI_CONFIGURATION_ERROR", "AI provider configuration is incomplete.");
  if (!["openai", "openai-compatible"].includes(provider)) throw new AIProviderError("AI_CONFIGURATION_ERROR", "Configured AI provider is unsupported.");
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const timeoutMs = Math.min(120000, Math.max(1000, Number(process.env.AI_TIMEOUT_MS) || 20000));
  return { provider, apiKey, model, baseUrl, timeoutMs };
}

export async function requestStructuredAnalysis({ system, payload, images = [] }) {
  const cfg = config();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  const content = [{ type: "text", text: JSON.stringify(payload) }];
  for (const image of images) content.push({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data.toString("base64")}`, detail: "low" } });
  try {
    const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        response_format: { type: "json_schema", json_schema: providerJsonSchema() },
        messages: [{ role: "system", content: system }, { role: "user", content }],
      }),
    });
    if (!response.ok) {
      const code = response.status === 429 ? "AI_RATE_LIMITED" : response.status >= 500 ? "AI_PROVIDER_UNAVAILABLE" : response.status === 401 || response.status === 403 ? "AI_CONFIGURATION_ERROR" : "AI_ANALYSIS_FAILED";
      throw new AIProviderError(code, `AI provider request failed with status ${response.status}.`, { retryable: response.status === 429 || response.status >= 500, status: response.status });
    }
    const body = await response.json();
    const raw = body.choices?.[0]?.message?.content ?? body.output_text;
    if (typeof raw !== "string") throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned no structured output.", { retryable: true });
    try { return { value: JSON.parse(raw), provider: cfg.provider, model: cfg.model }; }
    catch { throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned malformed JSON.", { retryable: true }); }
  } catch (error) {
    if (error?.name === "AbortError" || error?.name === "TimeoutError") throw new AIProviderError("AI_TIMEOUT", "AI provider request timed out.", { retryable: true });
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "AI provider could not be reached.", { retryable: true });
  } finally { clearTimeout(timer); }
}

export function providerMetadata() {
  return { provider: (process.env.AI_PROVIDER || "").trim().toLowerCase() || null, model: process.env.AI_MODEL || null };
}
