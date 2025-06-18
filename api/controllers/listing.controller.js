import Listing from "../models/listing.model.js";
import Inquiry from "../models/inquiry.model.js";
import { errorHandler } from "../utils/error.js";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  LISTING_STATUSES,
  MAX_UPLOAD_SIZE_BYTES,
  SORT_FIELDS,
  detectImageMimeType,
  validateListingPayload,
} from "../validators/listing.validator.js";
import { isObjectId } from "../utils/validation.js";
import User from "../models/user.model.js";

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBooleanFilter = (value) =>
  value === undefined || value === "false" ? { $in: [false, true] } : true;

const hasInvalidDiscountPrice = ({ offer, discountPrice, regularPrice }) =>
  offer ? discountPrice >= regularPrice : discountPrice > regularPrice;

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

export const createListing = async (req, res, next) => {
  try {
    const { data, error } = validateListingPayload(req.body);
    if (error) return next(errorHandler(400, error));

    if (hasInvalidDiscountPrice(data)) {
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
    if (detectImageMimeType(buffer) !== payload.mimeType) {
      return next(errorHandler(400, "Uploaded file does not match the declared image format"));
    }

    const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
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
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    if (req.user.id !== String(listing.userRef)) {
      return next(errorHandler(403, "You can only delete your own listing"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    await Inquiry.deleteMany({ listingRef: req.params.id });
    await User.updateMany({}, { $pull: { savedListings: listing._id } });
    return res.status(200).json("Listing has been deleted");
  } catch (error) {
    return next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

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
    const offer = data.offer ?? listing.offer;
    if (hasInvalidDiscountPrice({ offer, discountPrice, regularPrice })) {
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
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

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
    const offer = parseBooleanFilter(req.query.offer);
    const furnished = parseBooleanFilter(req.query.furnished);
    const parking = parseBooleanFilter(req.query.parking);

    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    } else if (!["sale", "rent"].includes(type)) {
      return next(errorHandler(400, "Invalid listing type"));
    }

    const requestedStatus = String(req.query.status || "active").toLowerCase();
    const status = LISTING_STATUSES.has(requestedStatus) ? requestedStatus : "active";
    const statusFilter = status === "active" ? { $in: ["active", null] } : status;

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
      status: statusFilter,
    })
      .sort({ [sort]: order })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json(listings);
  } catch (error) {
    return next(error);
  }
};
