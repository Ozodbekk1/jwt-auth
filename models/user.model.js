/** @format */
// src/models/user.model.js
import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be less than 20 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
    },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    refreshToken: { type: String, default: null },

    // Email Verification Fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Verification token yaratish method
userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // 30 minut amal qiladi
  this.verificationTokenExpiry = Date.now() + 30 * 60 * 1000;

  return verificationToken;
};

userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("User", userSchema);
