/** @format */

import mongoose from "mongoose";
import { commentSchema } from "./comment.model.js";

const quoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema],
});

export default mongoose.model("Quote", quoteSchema);
