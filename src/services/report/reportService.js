import { LOCATIONS } from "@/services/citizen/citizenService";

export const MAX_MEDIA = 6;
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const MAX_DESCRIPTION = 2000;

export const SEVERITY_LEVELS = [
  { key: "low", label: "Low", description: "Minor issue with limited immediate impact." },
  { key: "medium", label: "Medium", description: "Meaningful issue requiring scheduled attention." },
  { key: "high", label: "High", description: "Serious issue or safety concern needing prompt attention." },
  { key: "critical", label: "Critical", description: "Possible immediate danger requiring urgent human review." },
];

export const TRACKING_STEPS = [
  { key: "submitted", label: "Report submitted" },
  { key: "analyzed", label: "AI analysis stored" },
  { key: "awaiting", label: "Awaiting assignment" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
];

export const PRIORITY_FACTORS = [
  { key: "severity", label: "Severity", description: "How serious the reported condition may be" },
  { key: "publicImpact", label: "Public impact", description: "Likely disruption to the community" },
  { key: "safetyRisk", label: "Safety risk", description: "Possible risk of harm" },
  { key: "locationSensitivity", label: "Location context", description: "Reported civic location and nearby context" },
  { key: "similarReports", label: "Related reports", description: "Deterministic nearby-report matches" },
];

export const REPORT_PLACES = [
  { name: "Ward 11, Bharatpur", mapX: 40, mapY: 55, latitude: 27.6778, longitude: 84.4359, ward: "11", municipality: "Bharatpur Metropolitan City", province: "Bagmati" },
  { name: "Bharatpur", mapX: 36, mapY: 44, latitude: 27.6766, longitude: 84.4359, municipality: "Bharatpur Metropolitan City", province: "Bagmati" },
  { name: "Ratnanagar", mapX: 78, mapY: 42, latitude: 27.6219, longitude: 84.5068, municipality: "Ratnanagar Municipality", province: "Bagmati" },
  { name: "Khairahani", mapX: 44, mapY: 72, latitude: 27.6009, longitude: 84.5741, municipality: "Khairahani Municipality", province: "Bagmati" },
  { name: "Rapti", mapX: 62, mapY: 48, latitude: 27.6026, longitude: 84.6502, municipality: "Rapti Municipality", province: "Bagmati" },
  { name: "Kalika", mapX: 55, mapY: 28, latitude: 27.7118, longitude: 84.5062, municipality: "Kalika Municipality", province: "Bagmati" },
  { name: "Madi", mapX: 60, mapY: 82, latitude: 27.4428, longitude: 84.3232, municipality: "Madi Municipality", province: "Bagmati" },
  { name: "Ichchhakamana", mapX: 20, mapY: 35, latitude: 27.8589, longitude: 84.5886, municipality: "Ichchhakamana Rural Municipality", province: "Bagmati" },
];

export function placeNameForCoords(mapX, mapY) {
  return REPORT_PLACES.find((place) => place.mapX === mapX && place.mapY === mapY)?.name ?? null;
}

export const DEFAULT_PLACES = LOCATIONS;

export async function submitReport(payload) {
  const form = new FormData();
  const location = payload.location || {};
  form.set("title", payload.title || "Civic issue report");
  form.set("description", payload.description || "");
  form.set("category", payload.category || "other");
  form.set("latitude", String(location.latitude));
  form.set("longitude", String(location.longitude));
  form.set("address", location.name || "Selected map location");
  form.set("ward", location.ward || "");
  form.set("municipality", location.municipality || "");
  form.set("province", location.province || "");
  for (const item of payload.media || []) if (item.file) form.append("evidence", item.file, item.name);
  let response;
  try { response = await fetch("/api/reports", { method: "POST", credentials: "include", headers: { "X-CivicAI-CSRF": "1" }, body: form }); }
  catch { throw new Error("We couldn't connect to CivicAI. Your report was not submitted."); }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "The report could not be submitted.");
  const report = body.data;
  return { id: report.id, priority: report.priority, aiStatus: report.aiStatus, status: report.status, createdAt: report.submittedAt, category: report.categoryLabel, address: report.address };
}

export async function submitGuestReport(payload) {
  const form = new FormData();
  const location = payload.location || {};
  form.set("title", payload.title || "Civic issue report");
  form.set("description", payload.description || "");
  form.set("category", payload.category || "other");
  form.set("latitude", String(location.latitude));
  form.set("longitude", String(location.longitude));
  form.set("address", location.name || "Selected map location");
  form.set("ward", location.ward || "");
  form.set("municipality", location.municipality || "");
  form.set("province", location.province || "");
  for (const item of payload.media || []) if (item.file) form.append("evidence", item.file, item.name);
  let response;
  try { response = await fetch("/api/guest/reports", { method: "POST", credentials: "include", headers: { "X-CivicAI-CSRF": "1" }, body: form }); }
  catch { throw new Error("We couldn't connect to CivicAI. Your report was not submitted."); }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "The report could not be submitted.");
  const report = body.data;
  return { id: report.id, trackingId: report.trackingId, accessToken: report.accessToken, priority: report.priority, aiStatus: report.aiStatus, status: report.status, createdAt: report.submittedAt, category: report.categoryLabel, categoryKey: report.category, address: report.address };
}

export async function trackGuestReport(trackingId, accessToken) {
  const response = await fetch("/api/guest/track", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "X-CivicAI-CSRF": "1" }, body: JSON.stringify({ trackingId, accessToken }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "We couldn't find that guest complaint.");
  return body.data;
}

export async function analyzeDraft({ description, category = "other", title = "Civic issue", location, guest = false }) {
  const response = await fetch(guest ? "/api/guest/analyze" : "/api/reports/analyze", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CivicAI-CSRF": "1" },
    body: JSON.stringify({ description, category, title, address: location?.name || "" }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "AI analysis is temporarily unavailable.");
  return body.data;
}

const DRAFT_KEY = "civicai.report.draft.v1";
export function saveDraft(draft) { try { if (!draft || !draft.touched) localStorage.removeItem(DRAFT_KEY); else localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* best effort */ } }
export function loadDraft() { try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
export function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* no-op */ } }
