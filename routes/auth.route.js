/** @format */

import express from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controller/auth.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", verifyAccessToken, refresh);
authRouter.post("/logout", verifyAccessToken, logout);

export default authRouter;
