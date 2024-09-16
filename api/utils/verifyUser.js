import jsonwebtoken from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import { ACCESS_TOKEN_COOKIE } from "./auth.js";

export const verifyToken = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return next(errorHandler(500, "Server auth configuration is missing"));
  }

  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) return next(errorHandler(401, "Unauthorized"));

  jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Forbidden"));
    req.user = user;
    next();
  });
};
