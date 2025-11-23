/** @format */

import quoteModel from "../models/quote.model.js";
import userModel from "../models/user.model.js";

export const createQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ message: "user_id and content are required" });
    }

    const existingUser = await userModel.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const quote = await quoteModel.create({
      title,
      body,
      author: req.user.id,
      comments: [],
    });

    return res.status(201).json({ message: "Post created", quote });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      succes: false,
      message: "something went wrong !",
    });
  }
};
