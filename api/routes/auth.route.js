import express from "express";
import {
  signup,
  signin,
  google,
  signOut,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/signout", signOut);
router.get("/me", verifyToken, getCurrentUser);

export default router;
