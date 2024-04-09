import jsonwebtoken from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

// 检查请求中是否包含有效的JWT令牌
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return next(errorHandler(401, "Unauthorized"));

  jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "Forbidden"));
    req.user = user;
    next(); // 验证成功，无参next()将请求发给下一个中间件函数
  });
};
