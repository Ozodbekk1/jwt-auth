/** @format */

// src/models/User.js
import mongoose from "mongoose";

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
    userName: { type: String, required: true, unique: true, trim: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
