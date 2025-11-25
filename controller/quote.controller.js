/** @format */

import quoteModel from "../models/quote.model.js";
import userModel from "../models/user.model.js";

export const createQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "content are required" });
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

export const getQuotesByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    const quotes = await quoteModel
      .find({ author: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// export const getQuotesByIdAndUserId = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { quoteId } = req.params;

//     const quote = await quoteModel.findOne({ _id: quoteId, author: userId });

//     if (!quote) {
//       return res.status(404).json({
//         success: false,
//         message: "Quote not found or not authorized",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: quote,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await quoteModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getQuoteById = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await quoteModel.findById(quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const userId = req.user.id;

    const { quoteId } = req.params;

    const { title, body } = req.body;

    const updatinQuote = await quoteModel.findByIdAndUpdate(
      quoteId,
      {
        title: title,
        body: body,
      },
      { new: true }
    );

    if (!updatinQuote) {
      return res.status(404).json({
        success: false,
        message: {
          en: "Quote not found",
          ru: "Цитата не найдена",
          uz: "Iqtibos topilmadi",
        },
      });
    }

    if (updatinQuote.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: {
          en: "Not authorized to update this post",
          ru: "У вас нет прав на редактирование этого поста",
          uz: "Bu postni tahrirlash uchun ruxsat yo‘q",
        },
      });
    }

    res.status(200).json({
      succes: true,
      data: updatinQuote,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: {
        en: "Something went wrong while creating the quote",
        ru: "Произошла ошибка при создании цитаты",
        uz: "Iqtibos yaratishda xatolik yuz berdi",
      },
    });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const userId = req.user.id;

    const { quoteId } = req.params;

    const deletedQuote = await quoteModel.findByIdAndDelete(quoteId);

    if (!deletedQuote) {
      return res.status(404).json({
        success: false,
        message: {
          en: "Post not found",
          ru: "Пост не найден",
          uz: "Post topilmadi",
        },
      });
    }

    if (deletedQuote.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: {
          en: "Not authorized to delete this post",
          ru: "У вас нет прав на удаление этого поста",
          uz: "Bu postni o‘chirish uchun ruxsat yo‘q",
        },
      });
    }

    res.status(200).json({
      succes: true,
      data: deletedQuote,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: {
        en: "Something went wrong while deleting the quote",
        ru: "Произошла ошибка при удалении цитаты",
        uz: "Iqtibosni o‘chirishda xatolik yuz berdi",
      },
    });
  }
};
