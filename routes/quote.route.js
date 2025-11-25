/** @format */

import express from "express";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import {
  createQuote,
  deleteQuote,
  getAllQuotes,
  getQuoteById,
  // getQuotesByIdAndUserId,
  getQuotesByUserId,
  updateQuote,
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

export default quoteRouter;
