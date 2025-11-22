/** @format */

import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/user.model.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingEmail = await userModel.findOne({ email });

    if (!existingEmail) {
      return res.status(404).json({
        success: false,
        message: {
          eng: "User with this email not found",
          rus: "Пользователь с таким email не найден",
          uzb: "Bu email bilan foydalanuvchi topilmadi",
        },
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });

    const successMessage =
      "If an account exists with this email, a reset link has been sent.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage,
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.log(error);

    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
