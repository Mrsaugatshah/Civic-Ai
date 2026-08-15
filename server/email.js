import nodemailer from "nodemailer";

let testTransport = null;

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required email configuration: ${name}`);
  return value;
}

function transport() {
  if (testTransport) return testTransport;
  const provider = (process.env.EMAIL_PROVIDER || "smtp").toLowerCase();
  if (provider !== "smtp") throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}`);
  return nodemailer.createTransport({
    host: required("EMAIL_HOST"),
    port: Number(required("EMAIL_PORT")),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true" || Number(process.env.EMAIL_PORT) === 465,
    auth: { user: required("EMAIL_USER"), pass: required("EMAIL_PASSWORD") },
    requireTLS: String(process.env.EMAIL_REQUIRE_TLS ?? "true").toLowerCase() !== "false",
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

async function send({ to, subject, text, html }) {
  await transport().sendMail({ from: required("EMAIL_FROM"), to, subject, text, html });
}

function frontendLink(pathname, token) {
  const base = required("FRONTEND_URL").replace(/\/$/, "");
  return `${base}${pathname}?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail({ to, code }) {
  await send({
    to,
    subject: `${code} is your CivicAI verification code`,
    text: `Welcome to CivicAI. Your email verification code is: ${code}\n\nThis code expires in 30 minutes and works once. If you did not create this account, ignore this email.`,
    html: codeEmailHtml({ code }),
  });
}

function codeEmailHtml({ code }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#17352d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dce7e3"><tr><td style="padding:24px 32px;background:#0f766e;color:#fff;font-size:22px;font-weight:700">CivicAI</td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-size:24px">Verify your email</h1><p style="line-height:1.6;color:#49635c">Welcome to CivicAI. Enter this code on the verification screen:</p><p style="margin:28px 0;padding:18px;background:#f0fdfa;border-radius:10px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#0f766e">${escapeHtml(code)}</p><p style="font-size:14px;color:#607871">This code expires in 30 minutes and can be used only once.</p><hr style="border:0;border-top:1px solid #e4ece9;margin:24px 0"><p style="font-size:12px;color:#6d817b">If you did not create a CivicAI account, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
}

export async function sendPasswordResetEmail({ to, token }) {
  const url = frontendLink("/reset-password", token);
  await send({
    to,
    subject: "Reset your CivicAI password",
    text: `Reset your CivicAI password by opening this link:\n\n${url}\n\nThis link expires in 15 minutes and works once. If you did not request this, ignore this email; your password will remain unchanged.`,
    html: emailHtml({ heading: "Reset your password", explanation: "We received a request to choose a new password for your CivicAI account.", button: "Reset password", url, expiry: "15 minutes", notice: "If you did not request this change, ignore this email. Your password will remain unchanged." }),
  });
}

function emailHtml({ heading, explanation, button, url, expiry, notice }) {
  const safeUrl=escapeHtml(url);
  return `<!doctype html><html><body style="margin:0;background:#f4f7f6;font-family:Arial,sans-serif;color:#17352d"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dce7e3"><tr><td style="padding:24px 32px;background:#0f766e;color:#fff;font-size:22px;font-weight:700">CivicAI</td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-size:24px">${escapeHtml(heading)}</h1><p style="line-height:1.6;color:#49635c">${escapeHtml(explanation)}</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">${escapeHtml(button)}</a></p><p style="font-size:14px;color:#607871">This secure link expires in ${escapeHtml(expiry)} and can be used only once.</p><p style="font-size:12px;color:#6d817b;word-break:break-all">If the button does not work, copy this URL into your browser:<br><a href="${safeUrl}" style="color:#0f766e">${safeUrl}</a></p><hr style="border:0;border-top:1px solid #e4ece9;margin:24px 0"><p style="font-size:12px;color:#6d817b">${escapeHtml(notice)}</p></td></tr></table></td></tr></table></body></html>`;
}

export function setEmailTransportForTests(value) {
  if (process.env.NODE_ENV !== "test") throw new Error("Test transport is available only in tests.");
  testTransport = value;
}
