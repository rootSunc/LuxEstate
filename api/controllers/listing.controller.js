import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "regularPrice",
  "discountPrice",
  "bedrooms",
  "bathrooms",
]);
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseImageDataUrl = (dataUrl) => {
  if (typeof dataUrl !== "string") return null;
  const matched = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!matched) return null;
  return { mimeType: matched[1], base64: matched[2] };
};

const getImagePayloadFromRequest = (req) => {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    const mimeType = String(req.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    return { mimeType, buffer: req.body };
  }

  const parsedDataUrl = parseImageDataUrl(req.body?.dataUrl);
  if (!parsedDataUrl) return null;

  return {
    mimeType: parsedDataUrl.mimeType.toLowerCase(),
    buffer: Buffer.from(parsedDataUrl.base64, "base64"),
  };
};

const resolveBaseUrl = (req) => {
  const configuredBaseUrl = process.env.PUBLIC_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const validateListingPayload = (payload, { isUpdate = false } = {}) => {
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
  }

  if (validated.type !== undefined && !["sale", "rent"].includes(validated.type)) {
    return { error: "Type must be sale or rent" };
  }

  for (const field of ["bedrooms", "bathrooms", "regularPrice", "discountPrice"]) {
    if (validated[field] !== undefined) {
      const parsed = toNumber(validated[field]);
      if (Number.isNaN(parsed)) return { error: `${field} must be a valid number` };
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
    if (!validated.imageUrls.every((item) => typeof item === "string")) {
      return { error: "Invalid image URLs" };
    }
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

export const createListing = async (req, res, next) => {
  try {
    const { data, error } = validateListingPayload(req.body);
    if (error) return next(errorHandler(400, error));

    if (data.discountPrice > data.regularPrice) {
      return next(errorHandler(400, "Discount price must be lower than regular price"));
    }

    const listing = await Listing.create({
      ...data,
      userRef: req.user.id,
    });
    return res.status(201).json(listing);
  } catch (error) {
    return next(error);
  }
};

export const uploadListingImage = async (req, res, next) => {
  try {
    const payload = getImagePayloadFromRequest(req);
    if (!payload) {
      return next(errorHandler(400, "Invalid image payload"));
    }

    const extension = ALLOWED_IMAGE_MIME_TYPES.get(payload.mimeType);
    if (!extension) {
      return next(errorHandler(400, "Unsupported image format"));
    }

    const { buffer } = payload;
    if (!buffer.length || buffer.length > MAX_UPLOAD_SIZE_BYTES) {
      return next(errorHandler(400, "Image size must be less than or equal to 5MB"));
    }

    const uploadDir = path.resolve("uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    const baseUrl = resolveBaseUrl(req);
    return res.status(201).json({
      url: `${baseUrl}/uploads/${fileName}`,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    if (req.user.id !== String(listing.userRef)) {
      return next(errorHandler(403, "You can only delete your own listing"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    return res.status(200).json("Listing has been deleted");
  } catch (error) {
    return next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    if (req.user.id !== String(listing.userRef)) {
      return next(errorHandler(403, "You can only update your own listing"));
    }

    if (req.body?.userRef && req.body.userRef !== req.user.id) {
      return next(errorHandler(403, "You cannot change listing ownership"));
    }

    const { data, error } = validateListingPayload(req.body, { isUpdate: true });
    if (error) return next(errorHandler(400, error));
    if (Object.keys(data).length === 0) {
      return next(errorHandler(400, "No valid fields to update"));
    }

    const regularPrice = data.regularPrice ?? listing.regularPrice;
    const discountPrice = data.discountPrice ?? listing.discountPrice;
    if (discountPrice > regularPrice) {
      return next(errorHandler(400, "Discount price must be lower than regular price"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: data,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json(updatedListing);
  } catch (error) {
    return next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }
    return res.status(200).json(listing);
  } catch (error) {
    return next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    } else {
      offer = true;
    }

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    } else {
      furnished = true;
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    } else {
      parking = true;
    }

    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    } else if (!["sale", "rent"].includes(type)) {
      return next(errorHandler(400, "Invalid listing type"));
    }

    const rawSearchTerm = String(req.query.searchTerm || "").trim().slice(0, 100);
    const searchTerm = escapeRegex(rawSearchTerm);

    const requestedSort = String(req.query.sort || "createdAt");
    const sort = SORT_FIELDS.has(requestedSort) ? requestedSort : "createdAt";

    const order = req.query.order === "asc" ? 1 : -1;
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Number.isNaN(rawLimit) ? 9 : Math.min(Math.max(rawLimit, 1), 50);
    const rawStartIndex = parseInt(req.query.startIndex, 10);
    const startIndex = Number.isNaN(rawStartIndex) ? 0 : Math.max(rawStartIndex, 0);

    const listings = await Listing.find({
      ...(searchTerm ? { name: { $regex: searchTerm, $options: "i" } } : {}),
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json(listings);
  } catch (error) {
    return next(error);
  }
};
