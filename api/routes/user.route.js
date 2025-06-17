import express from "express";
import {
  deleteUser,
  updateUser,
  getUserListings,
  getUser,
  getSavedListings,
  saveListing,
  unsaveListing,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.patch("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/saved-listings", verifyToken, getSavedListings);
router.post("/saved-listings/:listingId", verifyToken, saveListing);
router.delete("/saved-listings/:listingId", verifyToken, unsaveListing);
router.get("/:id", verifyToken, getUser);

export default router;
