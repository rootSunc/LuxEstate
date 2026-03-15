import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenCookieOptions,
} from "../utils/auth.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

export const signup = async (req, res, next) => {
  try {
    const username = req.body?.username?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!username || !email || !password) {
      return next(errorHandler(400, "Username, email and password are required"));
    }
    if (username.length < 3 || username.length > 30) {
      return next(errorHandler(400, "Username must be between 3 and 30 characters"));
    }
    if (!EMAIL_REGEX.test(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }
    if (password.length < 8) {
      return next(errorHandler(400, "Password must be at least 8 characters"));
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json("User created successfully!");
  } catch (error) {
    if (error?.code === 11000) {
      return next(errorHandler(409, "Username or email already exists"));
    }
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return next(errorHandler(400, "Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(401, "Invalid credentials"));

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) return next(errorHandler(401, "Invalid credentials"));

    const token = signToken(user._id);
    const { password: pass, ...rest } = user._doc;
    return res
      .cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions())
      .status(200)
      .json(rest);
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const name = req.body?.name?.trim();
    const photo = req.body?.photo?.trim();
    if (!email || !name || !EMAIL_REGEX.test(email)) {
      return next(errorHandler(400, "Invalid google sign-in payload"));
    }

    const user = await User.findOne({ email });
    if (user) {
      const token = signToken(user._id);
      const { password: pass, ...rest } = user._doc;
      return res
        .cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions())
        .status(200)
        .json(rest);
    }

    const generatedPassword = randomBytes(16).toString("hex");
    const hashedPassword = await bcryptjs.hash(generatedPassword, 10);
    const newUser = new User({
      username: `${name.split(" ").join("").toLowerCase()}${randomBytes(4).toString("hex")}`,
      email,
      password: hashedPassword,
      avatar: photo,
    });

    await newUser.save();
    const token = signToken(newUser._id);
    const { password: pass, ...rest } = newUser._doc;
    return res
      .cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions())
      .status(200)
      .json(rest);
  } catch (error) {
    if (error?.code === 11000) {
      return next(errorHandler(409, "Username or email already exists"));
    }
    return next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    return res
      .clearCookie(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions())
      .status(200)
      .json("User has been logged out!");
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));
    const { password, ...rest } = user._doc;
    return res.status(200).json(rest);
  } catch (error) {
    return next(error);
  }
};
