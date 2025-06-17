import Inquiry from "../models/inquiry.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import { isObjectId } from "../utils/validation.js";

const validateMessage = (value) => {
  const message = String(value || "").trim();
  if (message.length < 10 || message.length > 1000) {
    return { error: "Message must be between 10 and 1000 characters" };
  }
  return { message };
};

const validateReplyMessage = (value) => {
  const message = String(value || "").trim();
  if (message.length < 2 || message.length > 1000) {
    return { error: "Reply must be between 2 and 1000 characters" };
  }
  return { message };
};

const populateInquiry = (query) =>
  query
    .populate("senderRef", "username email avatar")
    .populate("ownerRef", "username email avatar")
    .populate(
      "listingRef",
      "name imageUrls type offer regularPrice discountPrice address status"
    )
    .populate("replies.authorRef", "username email avatar");

export const createInquiry = async (req, res, next) => {
  try {
    const listingId = req.body?.listingId;
    if (!isObjectId(listingId)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

    const { message, error } = validateMessage(req.body?.message);
    if (error) return next(errorHandler(400, error));

    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, "Listing not found"));

    if (String(listing.userRef) === req.user.id) {
      return next(errorHandler(400, "You cannot inquire on your own listing"));
    }

    const inquiry = await Inquiry.create({
      listingRef: listing._id,
      senderRef: req.user.id,
      ownerRef: listing.userRef,
      message,
    });

    return res.status(201).json(inquiry);
  } catch (error) {
    return next(error);
  }
};

export const getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await populateInquiry(
      Inquiry.find({ ownerRef: req.user.id }).sort({ createdAt: -1 })
    );

    return res.status(200).json(inquiries);
  } catch (error) {
    return next(error);
  }
};

export const getSentInquiries = async (req, res, next) => {
  try {
    const inquiries = await populateInquiry(
      Inquiry.find({ senderRef: req.user.id }).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json(inquiries);
  } catch (error) {
    return next(error);
  }
};

export const markInquiryRead = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid inquiry id"));
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return next(errorHandler(404, "Inquiry not found"));
    if (String(inquiry.ownerRef) !== req.user.id) {
      return next(errorHandler(403, "You can only update your own inquiries"));
    }

    inquiry.status = "read";
    await inquiry.save();
    return res.status(200).json(inquiry);
  } catch (error) {
    return next(error);
  }
};

export const replyToInquiry = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid inquiry id"));
    }

    const { message, error } = validateReplyMessage(req.body?.message);
    if (error) return next(errorHandler(400, error));

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return next(errorHandler(404, "Inquiry not found"));

    const isOwner = String(inquiry.ownerRef) === req.user.id;
    const isSender = String(inquiry.senderRef) === req.user.id;
    if (!isOwner && !isSender) {
      return next(errorHandler(403, "You can only reply to your own inquiries"));
    }

    inquiry.replies.push({
      authorRef: req.user.id,
      message,
    });
    inquiry.status = isOwner ? "replied" : "new";
    await inquiry.save();

    const populatedInquiry = await populateInquiry(
      Inquiry.findById(inquiry._id)
    );
    return res.status(200).json(populatedInquiry);
  } catch (error) {
    return next(error);
  }
};
