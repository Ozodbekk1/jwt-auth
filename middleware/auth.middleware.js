/** @format */

import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Invalid or expired access token" });
    req.user = decoded;
    next();
  });
};
