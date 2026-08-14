export function createRateLimiter({ windowMs, limit, key = (req) => req.ip }) {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = key(req);
    const current = buckets.get(bucketKey);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    buckets.set(bucketKey, bucket);
    res.setHeader("RateLimit-Limit", limit);
    res.setHeader("RateLimit-Remaining", Math.max(0, limit - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));
    if (bucket.count > limit) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ code: "rate_limited", error: "Too many requests. Please wait and try again." });
    }
    next();
  };
}

export function requireTrustedMutation(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (req.get("X-CivicAI-CSRF") !== "1") {
    return res.status(403).json({ code: "csrf_failed", error: "The request could not be verified. Refresh and try again." });
  }
  const origin = req.get("Origin");
  const allowed = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  if (origin && origin.replace(/\/$/, "") !== allowed) {
    return res.status(403).json({ code: "origin_rejected", error: "The request origin is not allowed." });
  }
  next();
}
