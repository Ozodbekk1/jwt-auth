/** @format */

import express from "express";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import {
  createQuote,
  deleteComment,
  deleteQuote,
  getAllQuotes,
  getQuoteById,
  // getQuotesByIdAndUserId,
  getQuotesByUserId,
  updateComment,
  updateQuote,
  writeComment,
} from "../controller/quote.controller.js";

const quoteRouter = express.Router();

quoteRouter.post("/create/quote", verifyAccessToken, createQuote);
quoteRouter.put("/update/quote/:quoteId", verifyAccessToken, updateQuote);
quoteRouter.delete("/delete/quote/:quoteId", verifyAccessToken, deleteQuote);
quoteRouter.get("/get/quote/my-quote", verifyAccessToken, getQuotesByUserId);
// quoteRouter.get(
//   "/get/quote/my-quote-quoteId/:quoteId",
//   verifyAccessToken,
//   getQuotesByIdAndUserId
// );
quoteRouter.get("/get/quote", getAllQuotes);
quoteRouter.get("/get/quote/:quoteId", getQuoteById);

quoteRouter.post("/write/comment/:quoteId", verifyAccessToken, writeComment);
quoteRouter.put("/update/comment/:commentId", verifyAccessToken, updateComment);
quoteRouter.delete(
  "/delete/comment/:quoteId/:commentId",
  verifyAccessToken,
  deleteComment
);

export default quoteRouter;
