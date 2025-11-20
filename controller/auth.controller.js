/** @format */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

export const register = async (req, res) => {
  try {
    const { email, password, userName } = req.body;

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!userName) missingFields.push("username");

    if (missingFields.length > 0) {
      const fieldText = missingFields.join(", ");

      return res.status(400).json({
        success: false,
        message: {
          eng: `The following field(s) are required: ${fieldText}`,
          rus: `Обязательные поля: ${fieldText}`,
          uzb: `Quyidagi maydon(lar) talab qilinadi: ${fieldText}`,
        },
      });
    }

    const existing = await userModel.findOne({ email });
    if (existing)
      return res.status(409).json({
        message: {
          eng: "An account with this email already exists.",
          rus: "Аккаунт с таким email уже зарегистрирован.",
          uzb: "Bu email bilan allaqachon hisob ochilgan.",
        },
      });

    const existingUserName = await userModel.findOne({ userName });
    if (existingUserName)
      return res.status(409).json({
        message: {
          eng: "Username is already taken.",
          rus: "Такое имя пользователя уже занято.",
          uzb: "Bu foydalanuvchi nomi band.",
        },
      });

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ email, userName, password: hashed });

    return res.status(201).json({
      message: {
        eng: "Welcome! Your account has been created successfully.",
        rus: "Добро пожаловать! Ваш аккаунт успешно создан.",
        uzb: "Xush kelibsiz! Hisobingiz muvaffaqiyatli yaratildi.",
      },
      userId: user._id,
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: {
        eng: "Oops! Something went wrong on our end. We're working on it!",
        rus: "Упс! Что-то пошло не так с нашей стороны. Мы уже исправляем!",
        uzb: "Voy! Biz tomondan xatolik yuz berdi. Hozir tuzatamiz!",
      },
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missingFieldsLogin = [];
    if (!email) missingFieldsLogin.push("email");
    if (!password) missingFieldsLogin.push("password");

    if (missingFieldsLogin.length > 0) {
      const fieldText = missingFieldsLogin.join(", ");

      return res.status(400).json({
        success: false,
        message: {
          eng: `The following field(s) are required: ${fieldText}`,
          rus: `Обязательные поля: ${fieldText}`,
          uzb: `Quyidagi maydon(lar) talab qilinadi: ${fieldText}`,
        },
      });
    }

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(401).json({
        message: {
          eng: "Incorrect email.",
          rus: "Неправильный email.",
          uzb: "Email xato.",
        },
      });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({
        message: {
          eng: "Incorrect password.",
          rus: "Неправильный пароль.",
          uzb: "Parol xato.",
        },
      });

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: {
        eng: "Logged in successfully!",
        rus: "Вы успешно вошли!",
        uzb: "Kirish muvaffaqiyatli amalga oshirildi!",
      },
      token: accessToken,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        // add any other safe fields you want to send
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: {
        eng: "Oops! Something went wrong on our end. We're working on it!",
        rus: "Упс! Что-то пошло не так с нашей стороны. Мы уже исправляем!",
        uzb: "Voy! Biz tomondan xatolik yuz berdi. Hozir tuzatamiz!",
      },
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({
        success: false,
        message: {
          eng: "Session expired. Please log in again.",
          rus: "Сессия истекла. Пожалуйста, войдите снова.",
          uzb: "Sessiya muddati tugadi. Iltimos, qayta kiring.",
        },
      });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: {
          eng: "No refresh token provided.",
          rus: "Refresh-токен не предоставлен.",
          uzb: "Refresh token taqdim etilmagan.",
        },
      });
    }

    const user = await userModel.findById(payload.id);
    if (!user)
      return res.status(404).json({
        success: false,
        message: {
          eng: "User not found.",
          rus: "Пользователь не найден.",
          uzb: "Foydalanuvchi topilmadi.",
        },
      });

    if (!user.refreshToken || user.refreshToken !== token) {
      user.refreshToken = null;
      await user.save();
      return res.status(403).json({
        success: false,
        message: {
          eng: "Refresh token does not match user.",
          rus: "Refresh-токен не соответствует пользователю.",
          uzb: "Refresh token foydalanuvchiga mos kelmaydi.",
        },
      });
    }

    const newAccessToken = generateAccessToken({
      id: user._id,
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: {
        eng: "Tokens refreshed successfully",
        rus: "Токены успешно обновлены",
        uzb: "Tokenlar muvaffaqiyatli yangilandi",
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: {
        eng: "Oops! Something went wrong on our end. We're working on it!",
        rus: "Упс! Что-то пошло не так с нашей стороны. Мы уже исправляем!",
        uzb: "Voy! Biz tomondan xatolik yuz berdi. Hozir tuzatamiz!",
      },
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await userModel.findById(payload.id);
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch (e) {
        console.log(e);
      }
    }

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: {
        eng: "Logged out successfully",
        rus: "Вы успешно вышли из аккаунта",
        uzb: "Muvaffaqiyatli chiqish amalga oshirildi",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: {
        eng: "Oops! Something went wrong on our end. We're working on it!",
        rus: "Упс! Что-то пошло не так с нашей стороны. Мы уже исправляем!",
        uzb: "Voy! Biz tomondan xatolik yuz berdi. Hozir tuzatamiz!",
      },
    });
  }
};
