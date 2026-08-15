import { toast } from "sonner";

const API_BASE = "/api/auth";

export class AuthError extends Error {
  constructor(code, message, status, retryAfter = 0) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", "X-CivicAI-CSRF": "1", ...options.headers },
    });
  } catch {
    throw new AuthError("network_error", "We couldn't connect to CivicAI. Please check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(data.code || "error", data.error || "Something went wrong. Please try again.", res.status, Number(res.headers.get("Retry-After") || 0));
  return data;
}

export function clearSession() {}
export function hasStoredSession() { return false; }
export function getToken() { return null; }

export async function getSession() {
  try { return await request("/me"); }
  catch { return null; }
}

export async function login({ email, password, remember = false }) {
  const { user } = await request("/login", { method: "POST", body: JSON.stringify({ email, password, remember }) });
  return user;
}

export async function register({ name, email, password, role, phone = "", location = "", organization = "", department = "" }) {
  return request("/register", { method: "POST", body: JSON.stringify({ name, email, password, role, phone, location, organization, department }) });
}

export async function resendVerification(email) {
  return request("/resend-verification", { method: "POST", body: JSON.stringify({ email }) });
}

export async function verifyEmail(email, code) {
  return request("/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });
}

export async function forgotPassword(email) {
  return request("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export async function resetPassword(token, password) {
  return request("/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}
export async function changeInitialPassword(newPassword, confirmPassword) {
  return request("/change-initial-password", { method: "POST", body: JSON.stringify({ newPassword, confirmPassword }) });
}

export async function logout() {
  try { await request("/logout", { method: "POST" }); } catch { /* local auth state is cleared by the caller */ }
}

export function isOffline() { return typeof navigator !== "undefined" && navigator.onLine === false; }
export function notifyError(error) { toast.error(isOffline() ? "We couldn't connect to CivicAI. Please check your connection and try again." : error.message || "Something went wrong. Please try again."); }
