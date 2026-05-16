import express from "express";
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  uploadListingImage,
} from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createListing);
router.post(
  "/upload",
  verifyToken,
  express.raw({ type: "image/*", limit: "5mb" }),
  uploadListingImage
);
router.delete("/delete/:id", verifyToken, deleteListing);
router.patch("/update/:id", verifyToken, updateListing);
router.get("/get/:id", getListing);
router.get("/get", getListings);
router.post("/", verifyToken, createListing);
router.get("/", getListings);
router.get("/:id", getListing);
router.patch("/:id", verifyToken, updateListing);
router.delete("/:id", verifyToken, deleteListing);

export default router;
