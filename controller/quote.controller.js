/** @format */

import commentModel from "../models/comment.model.js";
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

export const writeComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.userName;

    const { text } = req.body;
    const { quoteId } = req.params;
    if (!quoteId) {
      return res.status(404).json({
        message: {
          en: "Quote not found!",
          ru: "Цитата не найдена!",
          uz: "Iqtibos topilmadi!",
        },
      });
    }

    if (!text) {
      return res.status(400).json({
        message: {
          en: "Text is required!",
          ru: "Текст обязателен!",
          uz: "Matn kiritilishi shart!",
        },
      });
    }

    if (!userName) {
      return res.status(400).json({
        message: {
          en: "Username is required!",
          ru: "Имя пользователя обязательно!",
          uz: "Foydalanuvchi nomi majburiy!",
        },
      });
    }

    const writeComment = await quoteModel.findByIdAndUpdate(
      quoteId,
      {
        $push: {
          comments: {
            text: text,
            author: userId,
            userName: userName,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: {
        en: "Comment added successfully!",
        ru: "Комментарий успешно добавлен!",
        uz: "Izoh muvaffaqiyatli qo‘shildi!",
      },
      data: writeComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: {
        en: "Something went wrong while wtiting the comment",
        ru: "Произошла ошибка при удалении цитаты",
        uz: "Izoh yozishda xatolik yuz berdi",
      },
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: {
          en: "Comment text is required",
          ru: "Текст комментария обязателен",
          uz: "Izoh matni talab qilinadi",
        },
      });
    }

    const quote = await quoteModel.findOneAndUpdate(
      {
        "comments._id": commentId,
        "comments.author": userId,
      },
      {
        $set: {
          "comments.$.text": text.trim(),
        },
      },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: {
          en: "Comment not found or you don't have permission to edit it",
          ru: "Комментарий не найден или у вас нет прав на его редактирование",
          uz: "Izoh topilmadi yoki uni tahrirlash huquqingiz yo‘q",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({
      success: false,
      message: {
        en: "Something went wrong while updating the comment",
        ru: "Произошла ошибка при обновлении комментария",
        uz: "Izohni yangilashda xatolik yuz berdi",
      },
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { quoteId, commentId } = req.params;
    const userId = req.user.id;

    const quote = await quoteModel.findOneAndUpdate(
      {
        _id: quoteId,
        "comments._id": commentId,
        "comments.author": userId,
      },
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: {
          en: "Quote not found, comment not found, or you don't have permission",
          ru: "Цитата не найдена, комментарий не найден или у вас нет прав",
          uz: "Iqtibos topilmadi, izoh yo‘q yoki ruxsat yo‘q",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: {
        en: "Comment deleted successfully",
        ru: "Комментарий успешно удалён",
        uz: "Izoh muvaffaqiyatli o‘chirildi",
      },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: {
        en: "Something went wrong while deleting the comment",
        ru: "Произошла ошибка при удалении комментария",
        uz: "Izohni o‘chirishda xatolik yuz berdi",
      },
    });
  }
};
