/** @format */
import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  resetPassword,
} from "../controller/auth.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { forgotPassword } from "../controller/forgotPassword.controller.js";

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/verify-email/:token", verifyEmail); // Email verification
authRouter.post("/resend-verification", resendVerification); // Qayta yuborish

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

// Protected routes
authRouter.post("/refresh", verifyAccessToken, refresh);
authRouter.post("/logout", verifyAccessToken, logout);

export default authRouter;
