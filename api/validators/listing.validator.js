export const SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "regularPrice",
  "discountPrice",
  "bedrooms",
  "bathrooms",
]);

export const LISTING_STATUSES = new Set(["active", "draft", "sold", "rented"]);

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const NUMBER_RULES = {
  bedrooms: { label: "Bedrooms", min: 1, max: 50, integer: true },
  bathrooms: { label: "Bathrooms", min: 1, max: 50, integer: true },
  regularPrice: { label: "Regular price", min: 0, max: 100000000 },
  discountPrice: { label: "Discount price", min: 0, max: 100000000 },
};

export const detectImageMimeType = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buffer.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))
  ) {
    return "image/gif";
  }
  return null;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const isAllowedImageUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export const validateListingPayload = (payload, { isUpdate = false } = {}) => {
  const source = payload || {};
  const validated = {};
  const allowedFields = [
    "name",
    "description",
    "address",
    "type",
    "bedrooms",
    "bathrooms",
    "regularPrice",
    "discountPrice",
    "offer",
    "parking",
    "furnished",
    "imageUrls",
    "status",
  ];

  for (const field of allowedFields) {
    if (source[field] !== undefined) {
      validated[field] = source[field];
    }
  }

  if (validated.name !== undefined) {
    validated.name = String(validated.name).trim();
    if (validated.name.length < 3 || validated.name.length > 100) {
      return { error: "Listing name must be between 3 and 100 characters" };
    }
  }

  if (validated.description !== undefined) {
    validated.description = String(validated.description).trim();
    if (validated.description.length < 10 || validated.description.length > 2000) {
      return { error: "Description must be between 10 and 2000 characters" };
    }
  }

  if (validated.address !== undefined) {
    validated.address = String(validated.address).trim();
    if (!validated.address) return { error: "Address is required" };
    if (validated.address.length > 300) {
      return { error: "Address must be 300 characters or fewer" };
    }
  }

  if (validated.type !== undefined && !["sale", "rent"].includes(validated.type)) {
    return { error: "Type must be sale or rent" };
  }

  if (validated.status !== undefined) {
    validated.status = String(validated.status).trim().toLowerCase();
    if (!LISTING_STATUSES.has(validated.status)) {
      return { error: "Status must be active, draft, sold or rented" };
    }
  }

  for (const field of ["bedrooms", "bathrooms", "regularPrice", "discountPrice"]) {
    if (validated[field] !== undefined) {
      const parsed = toNumber(validated[field]);
      if (Number.isNaN(parsed)) return { error: `${field} must be a valid number` };
      const rule = NUMBER_RULES[field];
      if (rule.integer && !Number.isInteger(parsed)) {
        return { error: `${rule.label} must be a whole number` };
      }
      if (parsed < rule.min || parsed > rule.max) {
        return { error: `${rule.label} must be between ${rule.min} and ${rule.max}` };
      }
      validated[field] = parsed;
    }
  }

  for (const field of ["offer", "parking", "furnished"]) {
    if (validated[field] !== undefined) {
      if (typeof validated[field] === "string") {
        if (validated[field] === "true") validated[field] = true;
        else if (validated[field] === "false") validated[field] = false;
        else return { error: `${field} must be a boolean` };
      } else {
        validated[field] = Boolean(validated[field]);
      }
    }
  }

  if (validated.imageUrls !== undefined) {
    if (
      !Array.isArray(validated.imageUrls) ||
      validated.imageUrls.length === 0 ||
      validated.imageUrls.length > 6
    ) {
      return { error: "You must provide 1 to 6 images" };
    }
    const normalizedImageUrls = validated.imageUrls.map((item) =>
      typeof item === "string" ? item.trim() : ""
    );
    if (
      normalizedImageUrls.some((item) => !item) ||
      !normalizedImageUrls.every(isAllowedImageUrl)
    ) {
      return { error: "Invalid image URLs" };
    }
    validated.imageUrls = normalizedImageUrls;
  }

  if (!isUpdate) {
    const requiredFields = [
      "name",
      "description",
      "address",
      "type",
      "bedrooms",
      "bathrooms",
      "regularPrice",
      "discountPrice",
      "offer",
      "parking",
      "furnished",
      "imageUrls",
    ];
    for (const field of requiredFields) {
      if (validated[field] === undefined) {
        return { error: `${field} is required` };
      }
    }
  }

  return { data: validated };
};
