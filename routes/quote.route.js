/** @format */

import express from "express";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { createQuote } from "../controller/quote.controller.js";

const quoteRouter = express.Router();

quoteRouter.post("/create/quote", verifyAccessToken, createQuote);

export default quoteRouter;
