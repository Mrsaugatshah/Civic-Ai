import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { authRouter, withAuth } from "./auth.js";
import { reportsRouter, resumePendingAnalyses } from "./reports.js";
import { isTrustedFrontendOrigin, requireTrustedMutation } from "./security.js";

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
const frontendOrigin = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
app.use(cors({ origin: (origin, callback) => callback(null, !origin || isTrustedFrontendOrigin(origin) ? (origin || frontendOrigin) : false), credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CivicAI-CSRF"] }));
app.use(express.json({ limit: "64kb" }));
app.use(requireTrustedMutation);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api", withAuth, reportsRouter);

app.use("/api", (_req, res) => res.status(404).json({ code: "not_found", error: "API endpoint not found." }));
app.use((error, _req, res, _next) => {
  if (error?.emailDelivery) {
    console.error("Transactional email delivery failed.");
    return res.status(503).json({ code: "email_delivery_failed", error: "We couldn't send the email right now. Please try again shortly." });
  }
  if (error instanceof SyntaxError || error?.code === "LIMIT_FILE_SIZE" || error?.code === "LIMIT_FILE_COUNT") return res.status(400).json({ success:false,error:{code:"INVALID_REQUEST",message:"The request or evidence upload is invalid."} });
  console.error("Request failed:", error?.message || "Unknown error");
  return res.status(error?.status || 500).json({ success:false,error:{code:error?.code || "SERVER_ERROR",message:error?.status ? error.message : "Something went wrong. Please try again."} });
});

// `npm run build && npm start` serves the complete demo from one process.
// API routes stay above the SPA fallback so missing APIs still return 404.
const distDir = path.resolve(import.meta.dirname, "../dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    return res.sendFile(path.join(distDir, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`CivicAI API running on http://localhost:${PORT}`);
    console.log("Auth: bcrypt + hashed server-side sessions + real transactional email");
    resumePendingAnalyses();
  });
}
