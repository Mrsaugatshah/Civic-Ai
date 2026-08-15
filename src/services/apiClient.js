/**
 * CivicAI — Shared API client
 * ----------------------------------------------------------------
 * Small fetch wrapper used by the reports/citizen/authority/admin
 * services so they all attach the session token and surface server
 * errors consistently. Same convention as the auth service: same-origin
 * in production, Vite proxies /api to the Express server in dev.
 */

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-CivicAI-CSRF": "1",
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(path, { credentials: "include", ...options, headers });
  } catch {
    throw new ApiError("network_error", "We couldn't connect to CivicAI. Please check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error?.code || data.code || "error", data.error?.message || data.error || "Something went wrong. Please try again.");
  }
  return data;
}
