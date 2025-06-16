import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import inquiryRoute from "./routes/inquiry.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import { errorHandler } from "./utils/error.js";
import {
  connectDatabase,
  getDatabaseStatus,
  requireDatabase,
} from "./utils/database.js";
import { createRateLimiter } from "./utils/rateLimit.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const port = Number(process.env.PORT) || 3000;
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");

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

app.use(createRateLimiter());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

connectDatabase()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

app.use("/uploads", express.static(uploadDir, { maxAge: "1d" }));
app.get("/api/health", async (req, res) => {
  try {
    await connectDatabase();
    return res.status(200).json({ ok: true, database: getDatabaseStatus() });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      database: getDatabaseStatus(),
      message: error.message || "Database connection failed",
    });
  }
});
app.use("/api/users", requireDatabase, userRoute);
app.use("/api/auth", requireDatabase, authRoute);
app.use("/api/listing", requireDatabase, listingRouter);
app.use("/api/listings", requireDatabase, listingRouter);
app.use("/api/inquiries", requireDatabase, inquiryRoute);
app.use("/api", (req, res, next) => {
  next(errorHandler(404, "API route not found"));
});

app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// error middleware
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;
