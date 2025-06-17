export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const getListingPrice = (listing) =>
  listing.offer ? listing.discountPrice : listing.regularPrice;

export const getListingPriceLabel = (listing) =>
  `${formatCurrency(getListingPrice(listing))}${listing.type === "rent" ? " / mo" : ""}`;

export const getDiscountLabel = (listing) => {
  if (!listing.offer) return "";
  return `${formatCurrency(listing.regularPrice - listing.discountPrice)} off`;
};

export const getListingTypeLabel = (type) =>
  type === "rent" ? "For Rent" : "For Sale";

export const getListingStatusLabel = (status = "active") => {
  const labels = {
    active: "Active",
    draft: "Draft",
    sold: "Sold",
    rented: "Rented",
  };
  return labels[status] || labels.active;
};
