/** @format */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModel from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";
import { sendEmail, getVerificationEmailHTML } from "../utils/sendEmail.js";

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

    if (userName.length < 4) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Username must be at least 4 characters long.",
          rus: "Имя пользователя должно содержать минимум 4 символа.",
          uzb: "Username kamida 4 ta belgidan iborat bo'lishi kerak.",
        },
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Username can only contain letters, numbers, and underscores.",
          rus: "Имя пользователя может содержать только буквы, цифры и подчеркивания.",
          uzb: "Username faqat harflar, raqamlar va pastki chiziqdan iborat bo'lishi mumkin.",
        },
      });
    }

    // PASSWORD VALIDATION - Bu qo'shing
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Password must be at least 6 characters long.",
          rus: "Пароль должен содержать минимум 6 символов.",
          uzb: "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
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
    const user = await userModel.create({
      email,
      userName,
      password: hashed,
      isVerified: false, // Default false
    });

    // Verification token yaratish
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Verification URL yaratish
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify-email/${verificationToken}`;

    // Email yuborish
    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification | Email Tasdiqlash",
        html: getVerificationEmailHTML(user.userName, verificationUrl, "eng"),
      });

      return res.status(201).json({
        success: true,
        message: {
          eng: "Account created! Please check your email to verify your account.",
          rus: "Аккаунт создан! Проверьте почту для подтверждения.",
          uzb: "Hisob yaratildi! Emailingizni tekshiring va tasdiqlab oling.",
        },
        userId: user._id,
      });
    } catch (emailError) {
      // Agar email yuborishda xatolik bo'lsa, userni o'chiramiz
      await userModel.findByIdAndDelete(user._id);
      console.error("Email sending error:", emailError);

      return res.status(500).json({
        success: false,
        message: {
          eng: "Failed to send verification email. Please try again.",
          rus: "Не удалось отправить письмо. Попробуйте снова.",
          uzb: "Email yuborishda xatolik. Qaytadan urinib ko'ring.",
        },
      });
    }
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

// VERIFY EMAIL - Emailni tasdiqlash
export const verifyEmail = async (req, res) => {
  try {
    // Tokenni hash qilish
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Userni topish
    const user = await userModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Invalid or expired verification link.",
          rus: "Неверная или истекшая ссылка.",
          uzb: "Link yaroqsiz yoki muddati tugagan.",
        },
      });
    }

    // Userni verify qilish
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Auto-login: Token berish
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: {
        eng: "Email verified successfully! You are now logged in.",
        rus: "Email успешно подтвержден! Вы вошли в систему.",
        uzb: "Email muvaffaqiyatli tasdiqlandi! Siz tizimga kirdingiz.",
      },
      token: accessToken,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: {
        eng: "Verification failed. Please try again.",
        rus: "Ошибка верификации. Попробуйте снова.",
        uzb: "Tasdiqlashda xatolik. Qaytadan urinib ko'ring.",
      },
    });
  }
};

// RESEND VERIFICATION - Qayta yuborish
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Email is required.",
          rus: "Email обязателен.",
          uzb: "Email kiritilishi shart.",
        },
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: {
          eng: "User not found.",
          rus: "Пользователь не найден.",
          uzb: "Foydalanuvchi topilmadi.",
        },
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Email is already verified.",
          rus: "Email уже подтвержден.",
          uzb: "Email allaqachon tasdiqlangan.",
        },
      });
    }

    // Yangi token yaratish
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Email yuborish
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Email Verification - Resend | Qayta yuborish",
      html: getVerificationEmailHTML(user.userName, verificationUrl, "uzb"),
    });

    return res.status(200).json({
      success: true,
      message: {
        eng: "Verification email resent successfully.",
        rus: "Письмо с подтверждением отправлено повторно.",
        uzb: "Tasdiqlash linki qayta yuborildi.",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: {
        eng: "Failed to resend verification email.",
        rus: "Не удалось повторно отправить письмо.",
        uzb: "Email qayta yuborishda xatolik.",
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

    // Email verify tekshirish
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        isVerified: false,
        message: {
          eng: "Please verify your email first. Check your inbox.",
          rus: "Пожалуйста, сначала подтвердите email. Проверьте почту.",
          uzb: "Iltimos avval emailingizni tasdiqlang. Pochtangizni tekshiring.",
        },
      });
    }

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      userName: user.userName,
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
      success: true,
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
        avatar: user.avatar,
        bio: user.bio,
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
      userName: user.userName,
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

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Password must be at least 6 characters long.",
          rus: "Пароль должен содержать минимум 6 символов.",
          uzb: "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
        },
      });
    }

    // Optional: Add stronger rule (recommended)
    if (newPassword.length > 50) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Password is too long (maximum 50 characters).",
          rus: "Пароль слишком длинный (максимум 50 символов).",
          uzb: "Parol juda uzun (maksimum 50 belgi).",
        },
      });
    }

    // Optional: Block very weak/common passwords
    const weakPasswords = [
      "123456",
      "password",
      "qwerty",
      "parol",
      "123456789",
      "111111",
    ];
    if (weakPasswords.includes(newPassword.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "This password is too common. Please choose a stronger one.",
          rus: "Этот пароль слишком простой. Выберите более надёжный.",
          uzb: "Bu parol juda oddiy. Kuchliroq parol tanlang.",
        },
      });
    }

    const user = await userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // token not expired
      })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: {
          eng: "Invalid or expired token",
          rus: "Недействительный или просроченный токен",
          uzb: "Noto‘g‘ri yoki muddati o‘tgan token",
        },
      });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: {
        eng: "Password reset successful",
        rus: "Пароль успешно изменён",
        uzb: "Parol muvaffaqiyatli yangilandi",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: {
        eng: "Server error. Please try again later.",
        rus: "Ошибка сервера. Попробуйте позже.",
        uzb: "Server xatosi. Iltimos, keyinroq urinib ko‘ring.",
      },
    });
  }
};
