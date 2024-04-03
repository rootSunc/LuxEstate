import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  //   console.log(req.body);
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (error) {
    // res.status(500).json(error.message);
    // next(error);
    next(errorHandler(501, "error from auth control function.."));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validEmail = await User.findOne({ email: email });
    if (!validEmail) return next(errorHandler(404, "User not found!"));
    const validPassword = bcryptjs.compareSync(password, validEmail.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));
    const token = jwt.sign({ id: validEmail._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validEmail._doc; // pass和rest都只是新的变量名
    res
      .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};