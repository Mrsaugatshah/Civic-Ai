import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "civicai-auth-"));
Object.assign(process.env, { NODE_ENV: "test", DB_PATH: path.join(tempDir, "db.json"), SQLITE_PATH: path.join(tempDir, "civicai.sqlite"), BCRYPT_ROUNDS: "4", FRONTEND_URL: "http://localhost:5173", EMAIL_FROM: "CivicAI <no-reply@civicai.test>" });
const sentMail = [];
const { setEmailTransportForTests } = await import("./email.js");
setEmailTransportForTests({ sendMail: async (message) => { sentMail.push(message); return { messageId: `test-${sentMail.length}` }; } });
const { app } = await import("./server.js");
const { sql } = await import("./db.js");
let server;
let base;

before(() => new Promise((resolve) => { server = app.listen(0, "127.0.0.1", () => { base = `http://127.0.0.1:${server.address().port}/api/auth`; resolve(); }); }));
after(() => new Promise((resolve) => {
  server.close(() => { sql.close(); fs.rmSync(tempDir, { recursive: true, force: true }); resolve(); });
  server.closeAllConnections();
}));

async function api(pathname, body, cookie = "") {
  const response = await fetch(`${base}${pathname}`, { method: body === undefined ? "GET" : "POST", headers: { "Content-Type": "application/json", "X-CivicAI-CSRF": "1", ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { response, data: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] || "" };
}

function emailToken(message) {
  const match = message.text.match(/[?&]token=([A-Za-z0-9_-]{43})/);
  assert.ok(match);
  return match[1];
}

function emailCode(message) {
  const match = message.text.match(/verification code is: (\d{6})/);
  assert.ok(match);
  return match[1];
}

test("registration hashes code, sends email and verifies only once", async () => {
  const registered = await api("/register", { name: "Test Citizen", email: " Test@Example.com ", password: "Strong@123", phone: "+977 9812345678", role: "citizen" });
  assert.equal(registered.response.status, 201);
  let user = sql.prepare("SELECT * FROM users WHERE email=?").get("test@example.com");
  const record = sql.prepare("SELECT * FROM email_verification_tokens WHERE user_id=?").get(user.id);
  const code = emailCode(sentMail.at(-1));
  assert.ok(user && !user.email_verified && user.password_hash !== "Strong@123");
  assert.match(record.token_hash, /^\$2[aby]\$/);
  assert.equal(JSON.stringify(record).includes(code), false);
  assert.equal((await api("/verify-email", { email: "test@example.com", code })).response.status, 200);
  user = sql.prepare("SELECT * FROM users WHERE id=?").get(user.id);
  assert.equal(user.email_verified, 1);
  assert.equal((await api("/verify-email", { email: "test@example.com", code })).data.code, "invalid_code");
});

test("resend invalidates the previous verification code", async () => {
  await api("/register", { name: "Resend Citizen", email: "resend@example.com", password: "Strong@123", phone: "+977 9812345679", role: "citizen" });
  const first = emailCode(sentMail.at(-1));
  assert.equal((await api("/resend-verification", { email: "resend@example.com" })).response.status, 200);
  const second = emailCode(sentMail.at(-1));
  assert.notEqual(first, second);
  assert.equal((await api("/verify-email", { email: "resend@example.com", code: first })).data.code, "invalid_code");
  assert.equal((await api("/verify-email", { email: "resend@example.com", code: second })).response.status, 200);
});

test("reset is generic and one-time, invalidates sessions, and changes login", async () => {
  const unknown = await api("/forgot-password", { email: "missing@example.com" });
  const known = await api("/forgot-password", { email: "asha@city.gov" });
  assert.equal(unknown.data.message, known.data.message);
  const token = emailToken(sentMail.at(-1));
  const record = sql.prepare("SELECT * FROM password_reset_tokens ORDER BY created_at DESC").get();
  assert.match(record.token_hash, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(record).includes(token), false);
  const login = await api("/login", { email: "asha@city.gov", password: "Civic@123" });
  assert.equal(login.response.status, 200);
  assert.equal((await api("/reset-password", { token, password: "NewStrong@456" })).response.status, 200);
  assert.equal((await api("/me", undefined, login.cookie)).data, null);
  assert.equal((await api("/reset-password", { token, password: "Another@789" })).data.code, "used_token");
  assert.equal((await api("/login", { email: "asha@city.gov", password: "Civic@123" })).response.status, 401);
  assert.equal((await api("/login", { email: "asha@city.gov", password: "NewStrong@456" })).response.status, 200);
});

test("malformed, expired and weak-password cases are rejected", async () => {
  assert.equal((await api("/verify-email", { email: "invalid@example.com", code: "invalid" })).data.code, "invalid_code");
  assert.equal((await api("/reset-password", { token: "invalid", password: "weak" })).data.code, "weak_password");
  await api("/forgot-password", { email: "admin@city.gov" });
  const token = emailToken(sentMail.at(-1));
  sql.prepare("UPDATE password_reset_tokens SET expires_at=? WHERE token_hash=(SELECT token_hash FROM password_reset_tokens ORDER BY created_at DESC LIMIT 1)").run(Date.now()-1);
  assert.equal((await api("/reset-password", { token, password: "Strong@123" })).data.code, "expired_token");
});

test("citizen, authority and admin role logins remain compatible", async () => {
  for (const [email, role] of [["asha@city.gov", "citizen"], ["ward11@city.gov", "authority"], ["admin@city.gov", "admin"]]) {
    const result = await api("/login", { email, password: email === "asha@city.gov" ? "NewStrong@456" : "Civic@123" });
    assert.equal(result.response.status, 200);
    assert.equal(result.data.user.role, role);
  }
});

test("recovery rate limiting and CSRF checks reject abuse", async () => {
  let last;
  for (let index = 0; index < 6; index += 1) last = await api("/forgot-password", { email: "rate-limit@example.com" });
  assert.equal(last.response.status, 429);
  assert.equal(last.data.code, "rate_limited");
  const response = await fetch(`${base}/logout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "csrf_failed");
});
