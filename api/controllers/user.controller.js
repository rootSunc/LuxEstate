import Listing from "../models/listing.model.js";
import Inquiry from "../models/inquiry.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenCookieOptions,
} from "../utils/auth.js";
import { isObjectId } from "../utils/validation.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const updateUser = async (req, res, next) => {
  if (!isObjectId(req.params.id)) {
    return next(errorHandler(400, "Invalid user id"));
  }

  if (req.user.id !== req.params.id)
    return next(errorHandler(403, "You can only update your own account"));

  try {
    const body = req.body || {};
    const updates = {};

    if (body.username !== undefined) {
      const username = String(body.username).trim();
      if (username.length < 3 || username.length > 30) {
        return next(errorHandler(400, "Username must be between 3 and 30 characters"));
      }
      updates.username = username;
    }

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) {
        return next(errorHandler(400, "Invalid email format"));
      }
      updates.email = email;
    }

    if (body.password) {
      const password = String(body.password);
      if (password.length < 8) {
        return next(errorHandler(400, "Password must be at least 8 characters"));
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (body.avatar !== undefined) {
      updates.avatar = String(body.avatar).trim();
    }

    if (Object.keys(updates).length === 0) {
      return next(errorHandler(400, "No valid fields to update"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...updates,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return next(errorHandler(404, "User not found"));

    const { password, ...rest } = updatedUser._doc;
    return res.status(200).json(rest);
  } catch (error) {
    if (error?.code === 11000) {
      return next(errorHandler(409, "Username or email already exists"));
    }
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!isObjectId(req.params.id)) {
    return next(errorHandler(400, "Invalid user id"));
  }

  if (req.user.id !== req.params.id)
    return next(errorHandler(403, "You can only delete your own account"));

  try {
    const ownedListings = await Listing.find({ userRef: req.params.id }, { _id: 1 });
    const ownedListingIds = ownedListings.map((listing) => listing._id);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return next(errorHandler(404, "User not found"));
    await Listing.deleteMany({ userRef: req.params.id });
    if (ownedListingIds.length > 0) {
      await User.updateMany({}, { $pull: { savedListings: { $in: ownedListingIds } } });
    }
    await Inquiry.deleteMany({
      $or: [{ ownerRef: req.params.id }, { senderRef: req.params.id }],
    });

    return res
      .clearCookie(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions())
      .status(200)
      .json("User has been deleted");
  } catch (error) {
    return next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (!isObjectId(req.params.id)) {
    return next(errorHandler(400, "Invalid user id"));
  }

  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id }).sort({
        createdAt: -1,
      });
      return res.status(200).json(listings);
    } catch (error) {
      return next(error);
    }
  } else {
    return next(errorHandler(403, "You can only view your own listings"));
  }
};

export const getSavedListings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedListings",
      options: { sort: { createdAt: -1 } },
    });
    if (!user) return next(errorHandler(404, "User not found"));

    const savedListings = user.savedListings.filter(Boolean);
    return res.status(200).json(savedListings);
  } catch (error) {
    return next(error);
  }
};

export const saveListing = async (req, res, next) => {
  try {
    const listingId = req.params.listingId;
    if (!isObjectId(listingId)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    if (String(listing.userRef) === req.user.id) {
      return next(errorHandler(400, "You cannot save your own listing"));
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { savedListings: listing._id },
    });
    return res.status(200).json({ saved: true, listingId });
  } catch (error) {
    return next(error);
  }
};

export const unsaveListing = async (req, res, next) => {
  try {
    const listingId = req.params.listingId;
    if (!isObjectId(listingId)) {
      return next(errorHandler(400, "Invalid listing id"));
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedListings: listingId },
    });
    return res.status(200).json({ saved: false, listingId });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    if (!isObjectId(req.params.id)) {
      return next(errorHandler(400, "Invalid user id"));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found!"));
    const { password: pass, savedListings, ...rest } = user._doc;
    return res.status(200).json(rest);
  } catch (error) {
    return next(error);
  }
};
