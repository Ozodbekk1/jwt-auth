/** @format */

import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token)
    return res.status(401).json({
      success: false,
      message: {
        eng: "Authentication required. Please log in.",
        rus: "Требуется авторизация. Пожалуйста, войдите в аккаунт.",
        uzb: "Autentifikatsiya talab qilinadi. Iltimos, tizimga kiring.",
      },
      action: "LOGIN_REQUIRED",
    });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({
        success: false,
        message: {
          eng: "Session expired. Please log in again.",
          rus: "Сессия истекла. Пожалуйста, войдите снова.",
          uzb: "Sessiya muddati tugadi. Iltimos, qayta kiring.",
        },
      });
    req.user = decoded;
    next();
  });
};
