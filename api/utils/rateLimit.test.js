import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit.js";

const createResponse = () => {
  const headers = new Map();
  return {
    headers,
    body: null,
    statusCode: null,
    setHeader(name, value) {
      headers.set(name, value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
};

describe("createRateLimiter", () => {
  it("allows requests until the configured limit is exceeded", () => {
    let currentTime = 1000;
    const limiter = createRateLimiter({
      windowMs: 10000,
      maxRequests: 2,
      now: () => currentTime,
      keyGenerator: () => "user-a",
    });

    const firstResponse = createResponse();
    const secondResponse = createResponse();
    const blockedResponse = createResponse();
    let allowed = 0;

    limiter({}, firstResponse, () => {
      allowed += 1;
    });
    limiter({}, secondResponse, () => {
      allowed += 1;
    });
    limiter({}, blockedResponse, () => {
      allowed += 1;
    });

    expect(allowed).toBe(2);
    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.body).toMatchObject({
      success: false,
      statusCode: 429,
    });
    expect(blockedResponse.headers.get("Retry-After")).toBe("10");

    currentTime += 10001;
    const resetResponse = createResponse();
    limiter({}, resetResponse, () => {
      allowed += 1;
    });

    expect(allowed).toBe(3);
    expect(resetResponse.headers.get("RateLimit-Remaining")).toBe("1");
  });

  it("tracks request keys independently", () => {
    const limiter = createRateLimiter({
      windowMs: 10000,
      maxRequests: 1,
      now: () => 1000,
      keyGenerator: (req) => req.user,
    });
    let allowed = 0;

    limiter({ user: "user-a" }, createResponse(), () => {
      allowed += 1;
    });
    limiter({ user: "user-b" }, createResponse(), () => {
      allowed += 1;
    });

    expect(allowed).toBe(2);
  });
});
