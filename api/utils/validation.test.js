import { describe, expect, it } from "vitest";
import { isObjectId } from "./validation.js";

describe("isObjectId", () => {
  it("accepts canonical MongoDB ObjectId strings", () => {
    expect(isObjectId("64f1a2b3c4d5e6f789012345")).toBe(true);
  });

  it("rejects malformed or non-string identifiers", () => {
    expect(isObjectId("not-an-id")).toBe(false);
    expect(isObjectId("123456789012")).toBe(false);
    expect(isObjectId(undefined)).toBe(false);
  });
});
