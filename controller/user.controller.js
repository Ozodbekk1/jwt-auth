/** @format */

import userModel from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("-password")
      .select("-refreshToken")
      .populate({
        path: "quotes",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          eng: "User not found",
          rus: "Пользователь не найден",
          uzb: "Foydalanuvchi topilmadi",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: {
        eng: "Profile fetched successfully",
        rus: "Профиль успешно загружен",
        uzb: "Profil muvaffaqiyatli yuklandi",
      },
      user: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: {
        eng: "Server error. Please try again later.",
        rus: "Ошибка сервера. Попробуйте позже.",
        uzb: "Server xatosi. Keyinroq urinib ko‘ring.",
      },
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = {};

    if ("userName" in req.body) {
      let userName = req.body.userName?.trim();

      if (!userName || userName.length === 0) {
        return res.status(400).json({
          success: false,
          message: {
            eng: "Username is required.",
            rus: "Имя пользователя обязательно.",
            uzb: "Foydalanuvchi nomi talab qilinadi.",
          },
        });
      }

      if (userName.length < 4 || userName.length > 20) {
        return res.status(400).json({
          success: false,
          message: {
            eng: "Username must be 4–20 characters long.",
            rus: "Имя пользователя должно быть от 3 до 20 символов.",
            uzb: "Foydalanuvchi nomi 3–20 ta belgidan iborat bo‘lishi kerak.",
          },
        });
      }

      const validUsernameRegex = /^[a-zA-Z0-9._]+$/;
      if (!validUsernameRegex.test(userName)) {
        return res.status(400).json({
          success: false,
          message: {
            eng: "Username can only contain letters, numbers, dot (.), and underscore (_).",
            rus: "Имя пользователя может содержать только буквы, цифры, точку (.) и подчёркивание (_).",
            uzb: "Foydalanuvchi nomida faqat harflar, raqamlar, nuqta (.) va pastki chiziq (_) bo‘lishi mumkin.",
          },
        });
      }

      if (/^[._]/.test(userName) || /[._]$/.test(userName)) {
        return res.status(400).json({
          success: false,
          message: {
            eng: "Username cannot start or end with dot (.) or underscore (_).",
            rus: "Имя пользователя не может начинаться или заканчиваться точкой (.) или подчёркиванием (_).",
            uzb: "Foydalanuvchi nomi nuqta (.) yoki pastki chiziq (_) bilan boshlanib yoki tugashi mumkin emas.",
          },
        });
      }

      if (/[._]{2,}/.test(userName)) {
        return res.status(400).json({
          success: false,
          message: {
            eng: "Username cannot have consecutive dots (.) or underscores (_).",
            rus: "Имя пользователя не может содержать идущие подряд точки или подчёркивания.",
            uzb: "Foydalanuvchi nomida ketma-ket nuqta yoki pastki chiziq bo‘lmasligi kerak.",
          },
        });
      }

      updates.userName = userName.toLowerCase();
    }

    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar.trim();
    if (req.body.bio !== undefined) updates.bio = req.body.bio.trim();

    if (Object.keys(updates).length === 0) {
      const current = await userModel.findById(userId).select("-password");
      return res.status(200).json({
        success: true,
        message: { eng: "No changes made" },
        user: {
          id: current._id,
          email: current.email,
          userName: current.userName,
          avatar: current.avatar,
          bio: current.bio,
        },
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: "-password" }
    );

    return res.status(200).json({
      success: true,
      message: {
        eng: "Profile updated successfully!",
        rus: "Профиль успешно обновлён!",
        uzb: "Profil muvaffaqiyatli yangilandi!",
      },
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        userName: updatedUser.userName,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "This username is already taken.",
          rus: "Это имя пользователя уже занято.",
          uzb: "Bu foydalanuvchi nomi band.",
        },
      });
    }

    return res.status(500).json({
      success: false,
      message: { eng: "Server error. Try again later." },
    });
  }
};

export const getUserByUserName = async (req, res) => {
  try {
    const { userName } = req.params;

    if (!userName || userName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Username is required",
          rus: "Требуется имя пользователя",
          uzb: "Foydalanuvchi nomi talab qilinadi",
        },
      });
    }

    const user = await userModel
      .findOne({ userName: userName.trim() })
      .select("-password -refreshToken")
      .populate({
        path: "quotes",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          eng: "User not found",
          rus: "Пользователь не найден",
          uzb: "Foydalanuvchi topilmadi",
        },
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      message: {
        eng: "Success",
        rus: "Успешно",
        uzb: "Muvaffaqiyatli",
      },
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    res.status(500).json({
      success: false,
      message: {
        eng: "Internal server error",
        rus: "Внутренняя ошибка сервера",
        uzb: "Ichki server xatosi",
      },
    });
  }
};
