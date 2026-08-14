import { CATEGORIES } from "./analysis.js";

const categories = new Set(CATEGORIES.map((item) => item.key));
const departments = new Set(CATEGORIES.map((item) => item.department));
const priorities = new Set(["low", "medium", "high", "critical"]);

function priorityScore(value) {
  if (Number.isInteger(value) && value >= 0 && value <= 100) return value;
  if (priorities.has(value)) return { low: 25, medium: 50, high: 75, critical: 95 }[value];
  return null;
}

export async function analyzeWithProvider(report) {
  if (!process.env.AI_API_KEY || !process.env.AI_MODEL || !process.env.AI_API_URL) {
    throw Object.assign(new Error("AI provider is not configured."), { code: "AI_NOT_CONFIGURED" });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 15000));
  try {
    const response = await fetch(process.env.AI_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `Classify a civic report. Return JSON only with category, priority (0-100), department, confidence (0-1), summary. Categories: ${[...categories].join(", ")}. Departments: ${[...departments].join(", ")}.` },
          { role: "user", content: JSON.stringify({ title: report.title, description: report.description, category: report.category, address: report.address }) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const payload = await response.json();
    const raw = payload.choices?.[0]?.message?.content ?? payload.output_text;
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    const priority = priorityScore(value?.priority);
    if (!categories.has(value?.category) || !departments.has(value?.department) || priority === null || typeof value?.summary !== "string" || value.summary.length > 500 || typeof value?.confidence !== "number" || value.confidence < 0 || value.confidence > 1) {
      throw new Error("AI provider returned an invalid controlled response.");
    }
    return { category: value.category, priority, department: value.department, confidence: value.confidence, summary: value.summary.trim() };
  } finally { clearTimeout(timer); }
}
