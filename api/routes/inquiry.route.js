import express from "express";
import {
  createInquiry,
  getSentInquiries,
  getMyInquiries,
  markInquiryRead,
  replyToInquiry,
} from "../controllers/inquiry.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/", verifyToken, createInquiry);
router.get("/mine", verifyToken, getMyInquiries);
router.get("/sent", verifyToken, getSentInquiries);
router.patch("/:id/read", verifyToken, markInquiryRead);
router.post("/:id/replies", verifyToken, replyToInquiry);

export default router;
