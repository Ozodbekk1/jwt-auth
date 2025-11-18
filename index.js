/** @format */

import express from "express";
const app = express();
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { verifyAccessToken } from "./middleware/auth.middleware.js";

configDotenv();

// Mongo DB Connections
mongoose
  .connect(process.env.MONGODB_URI)
  .then((response) => {
    console.log("MongoDB Connection Succeeded. ✅");
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });

// Middleware Connections
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true, // cookies allowed
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
// app.use("/api/v1", userRouter);
// app.use("/api/v1", postRouter);
// app.use("/api/v1", commentRoute);

app.get("/", (req, res) => {
  res.send("JWT AUTH API IS LIVE !");
});

app.get("/api/protected", verifyAccessToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}`, userId: req.user.id });
});

// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🥳 App running in port: " + PORT);
});
