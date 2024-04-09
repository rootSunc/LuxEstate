import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";

export const userController = (req, res) => {
  res.json({
    message: "User Router test successed!",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          // ...req.body  // 这种数据注入方式存在安全隐患，用户可能通过postman等工具更新一些他们不应该更新的字段，比如权限登记或者其他敏感信息
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updateUser._doc;
    res.status(200).json(rest); // 出于安全考虑，http 响应不返回密码字段
  } catch (error) {
    next(error);
  }
};
