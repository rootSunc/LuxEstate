const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 200;

const getRequestKey = (req) => req.ip || req.socket?.remoteAddress || "unknown";

const sweepExpiredEntries = (store, now) => {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
};

export const createRateLimiter = ({
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
  keyGenerator = getRequestKey,
  now = () => Date.now(),
  store = new Map(),
} = {}) => {
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("Rate limit windowMs must be a positive number");
  }
  if (!Number.isInteger(maxRequests) || maxRequests <= 0) {
    throw new Error("Rate limit maxRequests must be a positive integer");
  }

  let lastSweepAt = 0;

  const rateLimiter = (req, res, next) => {
    const timestamp = now();
    if (timestamp - lastSweepAt >= windowMs) {
      sweepExpiredEntries(store, timestamp);
      lastSweepAt = timestamp;
    }

    const key = keyGenerator(req);
    const existingEntry = store.get(key);
    const isActiveWindow = existingEntry && existingEntry.resetAt > timestamp;
    const entry = isActiveWindow
      ? { count: existingEntry.count + 1, resetAt: existingEntry.resetAt }
      : { count: 1, resetAt: timestamp + windowMs };

    store.set(key, entry);

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.resetAt - timestamp) / 1000)
    );
    const remaining = Math.max(maxRequests - entry.count, 0);

    res.setHeader("RateLimit-Limit", String(maxRequests));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(retryAfterSeconds));

    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        statusCode: 429,
        message: "Too many requests, please try again later",
      });
    }

    return next();
  };

  rateLimiter.store = store;
  return rateLimiter;
};
