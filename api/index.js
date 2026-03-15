import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import { errorHandler } from "./utils/error.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const port = Number(process.env.PORT) || 3000;

if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

const requestStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 200;
app.use((req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = (requestStore.get(ip) || []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many requests, please try again later",
    });
  }

  recentRequests.push(now);
  requestStore.set(ip, recentRequests);
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

if (!process.env.MONGO || !process.env.JWT_SECRET) {
  throw new Error("MONGO and JWT_SECRET must be configured");
}

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/listing", listingRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));
app.use("/api", (req, res, next) => {
  next(errorHandler(404, "API route not found"));
});

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;
