/** @format */

import express from "express";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { getCurrentUser, updateUser } from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.put("/update/user", verifyAccessToken, updateUser);
userRouter.get("/user/profile", verifyAccessToken, getCurrentUser);

export default userRouter;
