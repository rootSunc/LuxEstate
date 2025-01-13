import { describe, expect, it } from "vitest";
import {
  detectImageMimeType,
  validateListingPayload,
} from "./listing.validator.js";

const validListingPayload = {
  name: "Harbor View Apartment",
  description: "A bright apartment near transit with updated finishes.",
  address: "120 Harbor Street",
  type: "rent",
  bedrooms: "2",
  bathrooms: "1",
  regularPrice: "3200",
  discountPrice: "3000",
  offer: "true",
  parking: false,
  furnished: true,
  imageUrls: ["https://example.com/home.jpg"],
  userRef: "should-be-ignored",
};

describe("validateListingPayload", () => {
  it("coerces accepted fields and strips ownership input", () => {
    const result = validateListingPayload(validListingPayload);

    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({
      name: "Harbor View Apartment",
      bedrooms: 2,
      bathrooms: 1,
      regularPrice: 3200,
      discountPrice: 3000,
      offer: true,
      parking: false,
      furnished: true,
    });
    expect(result.data.userRef).toBeUndefined();
  });

  it("requires complete payloads on create", () => {
    const result = validateListingPayload({ name: "Tiny" });

    expect(result.error).toBe("description is required");
  });

  it("allows partial payloads on update", () => {
    const result = validateListingPayload({ regularPrice: "250000" }, { isUpdate: true });

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ regularPrice: 250000 });
  });

  it("rejects invalid booleans and listing types", () => {
    expect(validateListingPayload({ offer: "yes" }, { isUpdate: true }).error).toBe(
      "offer must be a boolean"
    );
    expect(validateListingPayload({ type: "lease" }, { isUpdate: true }).error).toBe(
      "Type must be sale or rent"
    );
  });
});

describe("detectImageMimeType", () => {
  it("detects supported image signatures", () => {
    expect(detectImageMimeType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe(
      "image/jpeg"
    );
    expect(
      detectImageMimeType(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    ).toBe("image/png");
    expect(detectImageMimeType(Buffer.from("GIF89a", "ascii"))).toBe("image/gif");
    expect(detectImageMimeType(Buffer.from("RIFFxxxxWEBP", "ascii"))).toBe(
      "image/webp"
    );
  });

  it("rejects unsupported content", () => {
    expect(detectImageMimeType(Buffer.from("<svg></svg>"))).toBeNull();
  });
});
