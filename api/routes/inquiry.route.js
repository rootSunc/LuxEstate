import express from "express";
import {
  createInquiry,
  getMyInquiries,
  markInquiryRead,
} from "../controllers/inquiry.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createInquiry);
router.get("/mine", verifyToken, getMyInquiries);
router.patch("/:id/read", verifyToken, markInquiryRead);

export default router;
