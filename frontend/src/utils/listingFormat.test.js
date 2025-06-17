import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  getDiscountLabel,
  getListingPriceLabel,
  getListingStatusLabel,
  getListingTypeLabel,
} from "./listingFormat";

describe("listing formatting", () => {
  it("formats rent listings with monthly labels", () => {
    expect(
      getListingPriceLabel({
        type: "rent",
        offer: true,
        regularPrice: 3200,
        discountPrice: 2950,
      })
    ).toBe("$2,950 / mo");
  });

  it("formats sale listings without monthly labels", () => {
    expect(
      getListingPriceLabel({
        type: "sale",
        offer: false,
        regularPrice: 585000,
        discountPrice: 560000,
      })
    ).toBe("$585,000");
  });

  it("formats discounts and type labels", () => {
    expect(formatCurrency(250)).toBe("$250");
    expect(
      getDiscountLabel({
        offer: true,
        regularPrice: 3200,
        discountPrice: 2950,
      })
    ).toBe("$250 off");
    expect(getListingTypeLabel("rent")).toBe("For Rent");
    expect(getListingTypeLabel("sale")).toBe("For Sale");
  });

  it("formats listing status labels", () => {
    expect(getListingStatusLabel("active")).toBe("Active");
    expect(getListingStatusLabel("draft")).toBe("Draft");
    expect(getListingStatusLabel("sold")).toBe("Sold");
    expect(getListingStatusLabel("rented")).toBe("Rented");
    expect(getListingStatusLabel()).toBe("Active");
  });
});
