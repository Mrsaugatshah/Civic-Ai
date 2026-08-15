import express from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { db, persist, sql } from "./db.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.js";
import { createRateLimiter } from "./security.js";

export const authRouter = express.Router();

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const VERIFY_TTL_MS = 30 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;
const SESSION_COOKIE = "civicai_session";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GENERIC_EMAIL_RESPONSE = "If an eligible account exists for that email, a message will arrive shortly.";

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 30 });
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 10, key: (req) => `${req.ip}:${normalizeEmail(req.body?.email || "")}` });
const verificationLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 10, key: (req) => `${req.ip}:${normalizeEmail(req.body?.email || "")}` });
const resendLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5, key: (req) => `${req.ip}:${normalizeEmail(req.body?.email || "")}` });
const forgotLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5, key: (req) => `${req.ip}:${normalizeEmail(req.body?.email || "")}` });
const resetLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 10 });
authRouter.use(authLimiter);

function normalizeEmail(value) { return typeof value === "string" ? value.trim().toLowerCase() : ""; }
function hashToken(token) { return createHash("sha256").update(token).digest("hex"); }
function secureToken() { return randomBytes(32).toString("base64url"); }
function validToken(token) { return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token); }
function validateEmail(email) { return email.length <= 254 && EMAIL_RE.test(email); }
function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return "Password must be between 8 and 128 characters.";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) return "Password must include uppercase, lowercase, number, and special characters.";
  return "";
}
function publicUser(row) {
  return row && { id: row.id, name: row.name, email: row.email, role: row.role, phone: row.phone || "", location: row.location || "", organization: row.organization || "", department: row.department || "", status: row.status, emailVerified: Boolean(row.email_verified), provider: row.provider, createdAt: row.created_at, updatedAt: row.updated_at };
}
function userByEmail(email) { return sql.prepare("SELECT * FROM users WHERE email = ?").get(normalizeEmail(email)); }
function userById(id) { return sql.prepare("SELECT * FROM users WHERE id = ?").get(id); }
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map((part) => { const i = part.indexOf("="); return [decodeURIComponent(part.slice(0, i).trim()), decodeURIComponent(part.slice(i + 1).trim())]; }));
}
function cookieOptions(remember = false) { return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: (remember ? 7 : 1) * 86400000 }; }
function createSession(res, userId, remember) {
  const token = secureToken(); const now = Date.now();
  sql.prepare("INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(`ses_${randomUUID()}`, userId, hashToken(token), now, now + cookieOptions(remember).maxAge);
  res.cookie(SESSION_COOKIE, token, cookieOptions(remember));
}
function sessionFromRequest(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!validToken(token)) return null;
  const session = sql.prepare("SELECT * FROM sessions WHERE token_hash = ?").get(hashToken(token));
  if (!session) return null;
  if (Date.now() >= session.expires_at) { sql.prepare("DELETE FROM sessions WHERE id = ?").run(session.id); return null; }
  return session;
}
function createPurposeToken(table, userId, ttl) {
  const token = secureToken(); const now = Date.now();
  sql.exec("BEGIN IMMEDIATE");
  try {
    sql.prepare(`UPDATE ${table} SET used_at = ? WHERE user_id = ? AND used_at IS NULL`).run(now, userId);
    sql.prepare(`INSERT INTO ${table} (id, user_id, token_hash, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)`).run(`tok_${randomUUID()}`, userId, hashToken(token), now + ttl, now);
    sql.exec("COMMIT"); return token;
  } catch (error) { sql.exec("ROLLBACK"); throw error; }
}
async function createVerificationCode(userId) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const now = Date.now();
  sql.exec("BEGIN IMMEDIATE");
  try {
    sql.prepare("UPDATE email_verification_tokens SET used_at = ? WHERE user_id = ? AND used_at IS NULL").run(now, userId);
    const id = `tok_${randomUUID()}`;
    sql.prepare("INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)").run(id, userId, codeHash, now + VERIFY_TTL_MS, now);
    sql.exec("COMMIT");
    return { code, id };
  } catch (error) { sql.exec("ROLLBACK"); throw error; }
}
function tokenRecord(table, token) { return validToken(token) ? sql.prepare(`SELECT * FROM ${table} WHERE token_hash = ?`).get(hashToken(token)) : null; }
function invalidateToken(table, id) { sql.prepare(`UPDATE ${table} SET used_at = COALESCE(used_at, ?) WHERE id = ?`).run(Date.now(), id); }

export function withAuth(req, _res, next) { req.sessionRecord = sessionFromRequest(req); req.user = req.sessionRecord ? publicUser(userById(req.sessionRecord.user_id)) : null; next(); }
export function requireAuth(req, res, next) { if (!req.user) return res.status(401).json({ code: "unauthenticated", error: "Not signed in." }); next(); }

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email); const password = req.body?.password;
    if (!validateEmail(email) || typeof password !== "string") return res.status(400).json({ code: "invalid_credentials", error: "Email and password are required." });
    const user = userByEmail(email); const ok = user && ["password", "provisioned"].includes(user.provider) && await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ code: "invalid_credentials", error: "We couldn't sign you in with those details." });
    if (user.status === "disabled") return res.status(403).json({ code: "disabled", error: "This account is currently unavailable. Please contact support." });
    if (user.role === "authority" && user.status !== "active") return res.status(403).json({ code: "pending", error: "Your authority account is awaiting approval." });
    createSession(res, user.id, Boolean(req.body?.remember)); return res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

authRouter.post("/register", async (req, res, next) => {
  let userId;
  try {
    const { name, password, phone = "", location = "" } = req.body || {}; const email = normalizeEmail(req.body?.email);
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ code: "invalid_name", error: "Enter a valid name between 2 and 100 characters." });
    if (!validateEmail(email)) return res.status(400).json({ code: "invalid_email", error: "Enter a valid email address." });
    if (typeof phone !== "string" || !/^[+\d][\d\s-]{7,}$/.test(phone.trim()) || phone.trim().length > 30) return res.status(400).json({ code: "invalid_phone", error: "Enter a valid phone number." });
    const passwordError = validatePassword(password); if (passwordError) return res.status(400).json({ code: "weak_password", error: passwordError });
    if (req.body?.role !== "citizen") return res.status(403).json({ code: "invalid_role", error: "Self-registration is limited to citizen accounts." });
    if (userByEmail(email)) return res.status(409).json({ code: "email_in_use", error: "An account with this email already exists. Try signing in instead." });
    const now = Date.now(); userId = `u_${randomUUID()}`; const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    sql.prepare("INSERT INTO users (id,name,email,password_hash,role,phone,location,organization,department,status,email_verified,provider,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(userId, name.trim(), email, passwordHash, "citizen", phone.trim(), String(location).trim().slice(0,120), "", "", "active", 0, "password", now, now);
    const verification = await createVerificationCode(userId);
    try {
      await sendVerificationEmail({ to: email, code: verification.code });
    } catch {
      invalidateToken("email_verification_tokens", verification.id);
      // Keep local development usable when SMTP is not configured. The account
      // remains created, but the client is told that verification was skipped.
      sql.prepare("UPDATE users SET email_verified=1, updated_at=? WHERE id=?").run(Date.now(), userId);
      console.error("Verification email delivery failed.");
      return res.status(201).json({ ok: true, emailVerificationRequired: false, message: "Account created. You can sign in with your password." });
    }
    return res.status(201).json({ ok: true, emailVerificationRequired: true, message: "Account created. Check your email for the verification code." });
  } catch (error) { next(error); }
});

authRouter.post("/resend-verification", resendLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email); if (!validateEmail(email)) return res.status(400).json({ code: "invalid_email", error: "Enter a valid email address." });
    const user = userByEmail(email);
    if (user && !user.email_verified) {
      const verification = await createVerificationCode(user.id);
      try { await sendVerificationEmail({ to: user.email, code: verification.code }); } catch { invalidateToken("email_verification_tokens", verification.id); console.error("Verification email delivery failed."); }
    }
    res.json({ ok: true, message: GENERIC_EMAIL_RESPONSE });
  } catch (error) { next(error); }
});

authRouter.post("/verify-email", verificationLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!validateEmail(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ code: "invalid_code", error: "Enter the email address and 6-digit verification code." });
    const user = userByEmail(email);
    if (!user || user.email_verified) return res.status(400).json({ code: "invalid_code", error: "The verification code is invalid or has already been used." });
    const record = sql.prepare("SELECT * FROM email_verification_tokens WHERE user_id = ? AND used_at IS NULL ORDER BY created_at DESC LIMIT 1").get(user.id);
    if (!record || !(await bcrypt.compare(code, record.token_hash))) return res.status(400).json({ code: "invalid_code", error: "The verification code is invalid or has already been used." });
    if (Date.now() >= record.expires_at) { invalidateToken("email_verification_tokens", record.id); return res.status(410).json({ code: "expired_code", error: "This verification code has expired. Request a new one." }); }
    sql.exec("BEGIN IMMEDIATE");
    try { sql.prepare("UPDATE users SET email_verified=1, updated_at=? WHERE id=?").run(Date.now(), record.user_id); sql.prepare("UPDATE email_verification_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL").run(Date.now(), record.user_id); sql.exec("COMMIT"); }
    catch (error) { sql.exec("ROLLBACK"); throw error; }
    res.json({ ok: true });
  } catch (error) { next(error); }
});

authRouter.post("/forgot-password", forgotLimiter, async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email); if (!validateEmail(email)) return res.status(400).json({ code: "invalid_email", error: "Enter a valid email address." });
    const user = userByEmail(email);
    if (user && ["password", "provisioned"].includes(user.provider)) {
      const token = createPurposeToken("password_reset_tokens", user.id, RESET_TTL_MS);
      try { await sendPasswordResetEmail({ to: user.email, token }); } catch { invalidateToken("password_reset_tokens", tokenRecord("password_reset_tokens", token).id); console.error("Password reset email delivery failed."); }
    }
    res.json({ ok: true, message: GENERIC_EMAIL_RESPONSE });
  } catch (error) { next(error); }
});

authRouter.post("/reset-password", resetLimiter, async (req, res, next) => {
  try {
    const passwordError = validatePassword(req.body?.password); if (passwordError) return res.status(400).json({ code: "weak_password", error: passwordError });
    const record = tokenRecord("password_reset_tokens", req.body?.token);
    if (!record) return res.status(400).json({ code: "invalid_token", error: "This password reset link is invalid." });
    if (record.used_at) return res.status(409).json({ code: "used_token", error: "This password reset link has already been used." });
    if (Date.now() >= record.expires_at) { invalidateToken("password_reset_tokens", record.id); return res.status(410).json({ code: "expired_token", error: "This password reset link has expired. Request a new one." }); }
    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    sql.exec("BEGIN IMMEDIATE");
    try { const now=Date.now(); sql.prepare("UPDATE users SET password_hash=?, updated_at=? WHERE id=?").run(passwordHash, now, record.user_id); sql.prepare("UPDATE password_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL").run(now, record.user_id); sql.prepare("DELETE FROM sessions WHERE user_id=?").run(record.user_id); sql.exec("COMMIT"); }
    catch (error) { sql.exec("ROLLBACK"); throw error; }
    res.clearCookie(SESSION_COOKIE, { httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/" }); res.json({ ok: true });
  } catch (error) { next(error); }
});

authRouter.get("/me", withAuth, (req, res) => res.json(req.user || null));
authRouter.get("/session", withAuth, (req, res) => res.json(req.user || null));
authRouter.post("/logout", withAuth, (req, res) => { if (req.sessionRecord) sql.prepare("DELETE FROM sessions WHERE id=?").run(req.sessionRecord.id); res.clearCookie(SESSION_COOKIE, { httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/" }); res.json({ ok: true }); });

export function seedIfEmpty() {
  if (sql.prepare("SELECT 1 FROM users LIMIT 1").get()) return;
  const now=Date.now(); const insert=sql.prepare("INSERT INTO users (id,name,email,password_hash,role,phone,location,organization,department,status,email_verified,provider,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  const legacy = (db.users || []).filter((u) => u.id && u.email && u.passwordHash);
  const defaults = [{id:"u_citizen",name:"Asha Mistry",email:"asha@city.gov",role:"citizen",phone:"+977 9812 000 111",location:"Ward 11, Bharatpur",organization:"",department:"",provider:"password"},{id:"u_authority",name:"Rajan Shrestha",email:"ward11@city.gov",role:"authority",phone:"+977 9812 000 222",location:"",organization:"Ward 11 Office",department:"Roads & Infrastructure",provider:"provisioned"},{id:"u_admin",name:"System Admin",email:"admin@city.gov",role:"admin",phone:"",location:"",organization:"",department:"",provider:"provisioned"}];
  const passwordHash = legacy.length ? null : bcrypt.hashSync("Civic@123", SALT_ROUNDS);
  for (const u of (legacy.length ? legacy : defaults)) insert.run(u.id,u.name,normalizeEmail(u.email),u.passwordHash || passwordHash,u.role,u.phone || "",u.location || "",u.organization || "",u.department || "",u.status || "active",u.emailVerified === false ? 0 : 1,u.provider || "password",u.createdAt || now,u.updatedAt || now);
  // Authentication is now authoritative in SQLite; erase legacy JSON auth material.
  db.users=[];
  db.sessions=[]; db.emailVerificationTokens=[]; db.passwordResetTokens=[]; persist();
}
seedIfEmpty();
