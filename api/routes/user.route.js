import express from "express";
import { deleteUser, updateUser, userController } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", userController);
router.post("/update/:id", verifyToken, updateUser); // 路由定义中连续使用多个函数时，这些函数将按照他们列出的顺序执行，前一个函数通过调用`next()`将req传递给下一个函数
router.delete("/delete/:id", verifyToken, deleteUser);
export default router;
