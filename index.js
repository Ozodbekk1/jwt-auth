/** @format */

import express from "express";
const app = express();
import { configDotenv } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import { verifyAccessToken } from "./middleware/auth.middleware.js";
import morgan from "morgan";
import userRouter from "./routes/user.route.js";

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
    origin: ["http://localhost:8080", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(cookieParser());

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", userRouter);
// app.use("/api/v1", postRouter);
// app.use("/api/v1", commentRoute);

app.get("/", (req, res) => {
  res.send("JWT AUTH API IS LIVE !");
});

app.get("/api/protected", verifyAccessToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: {
      eng: "Access granted. You are authenticated.",
      rus: "Доступ разрешён. Вы авторизованы.",
      uzb: "Ruxsat berildi. Siz autentifikatsiyadan o‘tdingiz.",
    },
    data: {
      userId: req.user.id,
      email: req.user.email,
      userName: req.user.userName || null,
    },
  });
});

// Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🥳 App running in port: " + PORT);
});
