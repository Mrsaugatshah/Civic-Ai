import { providerJsonSchema } from "./schema.js";

export class AIProviderError extends Error {
  constructor(code, message, { retryable = false, status } = {}) { super(message); this.code = code; this.retryable = retryable; this.status = status; }
}

const SUPPORTED = new Set(["openai", "openai-compatible", "gemini", "google", "groq", "nvidia"]);

function providerOrder() {
  return [...new Set([
    process.env.AI_PROVIDER,
    ...(process.env.AI_FALLBACK_PROVIDERS || "").split(","),
  ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean))];
}

function config(provider) {
  if (!SUPPORTED.has(provider)) throw new AIProviderError("AI_CONFIGURATION_ERROR", `Configured AI provider is unsupported: ${provider}.`);
  const prefix = provider === "groq" ? "GROQ" : provider === "nvidia" ? "NVIDIA" : null;
  const apiKey = prefix ? process.env[`${prefix}_API_KEY`] : process.env.AI_API_KEY;
  const model = prefix ? process.env[`${prefix}_MODEL`] : process.env.AI_MODEL;
  if (!apiKey || !model) throw new AIProviderError("AI_CONFIGURATION_ERROR", `${provider} AI credentials or model are not configured.`);
  const defaultBaseUrl = ["gemini", "google"].includes(provider)
    ? "https://generativelanguage.googleapis.com/v1beta"
    : provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : provider === "nvidia"
        ? "https://integrate.api.nvidia.com/v1"
        : "https://api.openai.com/v1";
  const configuredBaseUrl = prefix ? process.env[`${prefix}_BASE_URL`] : process.env.AI_BASE_URL;
  const baseUrl = (configuredBaseUrl || defaultBaseUrl).replace(/\/$/, "");
  const timeoutMs = Math.min(120000, Math.max(1000, Number(process.env.AI_TIMEOUT_MS) || 20000));
  return { provider, apiKey, model, baseUrl, timeoutMs };
}

async function requestWithProvider(cfg, { system, payload, images }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  const content = [{ type: "text", text: JSON.stringify(payload) }];
  for (const image of images) content.push({ type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data.toString("base64")}`, detail: "low" } });
  try {
    const isGemini = ["gemini", "google"].includes(cfg.provider);
    const endpoint = isGemini ? `${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:generateContent` : `${cfg.baseUrl}/chat/completions`;
    const requestBody = isGemini
      ? {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: content.map((part) => part.type === "text" ? { text: `${part.text}\nReturn only valid JSON matching the requested analysis fields.` } : { inline_data: { mime_type: part.image_url.url.match(/^data:([^;]+);/)?.[1] || "image/jpeg", data: part.image_url.url.split(",")[1] } }) }],
          generationConfig: { temperature: 0, responseMimeType: "application/json", responseJsonSchema: providerJsonSchema().schema },
        }
      : {
          model: cfg.model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: `${system}\nReturn only valid JSON matching the requested analysis fields.` }, { role: "user", content }],
        };
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { ...(isGemini ? { "x-goog-api-key": cfg.apiKey } : { Authorization: `Bearer ${cfg.apiKey}` }), "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const code = response.status === 429 ? "AI_RATE_LIMITED" : response.status >= 500 ? "AI_PROVIDER_UNAVAILABLE" : response.status === 401 || response.status === 403 ? "AI_CONFIGURATION_ERROR" : "AI_ANALYSIS_FAILED";
      throw new AIProviderError(code, `AI provider request failed with status ${response.status}.`, { retryable: response.status === 429 || response.status >= 500, status: response.status });
    }
    const body = await response.json();
    const raw = isGemini ? body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") : body.choices?.[0]?.message?.content ?? body.output_text;
    if (typeof raw !== "string") throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned no structured output.", { retryable: true });
    try { return { value: JSON.parse(raw), provider: cfg.provider, model: cfg.model }; }
    catch { throw new AIProviderError("AI_INVALID_RESPONSE", "AI provider returned malformed JSON.", { retryable: true }); }
  } catch (error) {
    if (error?.name === "AbortError" || error?.name === "TimeoutError") throw new AIProviderError("AI_TIMEOUT", "AI provider request timed out.", { retryable: true });
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError("AI_PROVIDER_UNAVAILABLE", "AI provider could not be reached.", { retryable: true });
  } finally { clearTimeout(timer); }
}

export async function requestStructuredAnalysis({ system, payload, images = [] }) {
  const providers = providerOrder();
  if (!providers.length) throw new AIProviderError("AI_CONFIGURATION_ERROR", "No AI provider is configured.");
  let lastError;
  for (const provider of providers) {
    let cfg;
    try { cfg = config(provider); } catch (error) { lastError = error; continue; }
    try { return await requestWithProvider(cfg, { system, payload, images }); }
    catch (error) {
      lastError = error;
      // Fallback is intentional for expired/revoked keys (401/403), rate
      // limits, provider outages, timeouts, and malformed provider output.
      // The last provider's error is returned only after every configured
      // provider has been attempted.
    }
  }
  throw lastError || new AIProviderError("AI_PROVIDER_UNAVAILABLE", "All configured AI providers failed.", { retryable: true });
}

export function providerMetadata() {
  return { providers: providerOrder(), primary: (process.env.AI_PROVIDER || "").trim().toLowerCase() || null, model: process.env.AI_MODEL || null };
}
