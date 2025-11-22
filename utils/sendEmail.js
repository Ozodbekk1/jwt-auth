/** @format */
// src/utils/sendEmail.js
import nodemailer from "nodemailer";

// Email yuborish funksiyasi
export const sendEmail = async (options) => {
  // 1. Transporter yaratish
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Email yuborish
  await transporter.sendMail(mailOptions);
};

// Verification email HTML template (3 tilda)
export const getVerificationEmailHTML = (
  userName,
  verificationUrl,
  lang = "eng"
) => {
  const content = {
    uzb: {
      title: "Email Tasdiqlash",
      greeting: `Salom ${userName},`,
      message:
        "Ro'yxatdan o'tganingiz uchun tashakkur! Emailingizni tasdiqlash uchun quyidagi tugmani bosing:",
      button: "Emailni Tasdiqlash",
      orText: "Yoki quyidagi linkni brauzeringizga nusxalang:",
      expiry: "Bu link 30 minut davomida amal qiladi.",
      ignore:
        "Agar siz bu ro'yxatdan o'tmaganingiz bo'lsa, bu emailni e'tiborsiz qoldiring.",
    },
    eng: {
      title: "Email Verification",
      greeting: `Hello ${userName},`,
      message:
        "Thanks for signing up! Please verify your email by clicking the button below:",
      button: "Verify Email",
      orText: "Or copy this link to your browser:",
      expiry: "This link will expire in 30 minutes.",
      ignore: "If you didn't sign up, please ignore this email.",
    },
    rus: {
      title: "Подтверждение Email",
      greeting: `Здравствуйте ${userName},`,
      message:
        "Спасибо за регистрацию! Пожалуйста, подтвердите свой email, нажав на кнопку ниже:",
      button: "Подтвердить Email",
      orText: "Или скопируйте эту ссылку в браузер:",
      expiry: "Эта ссылка действительна 30 минут.",
      ignore: "Если вы не регистрировались, просто проигнорируйте это письмо.",
    },
  };

  const text = content[lang];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>${text.title}</h2>
          <p>${text.greeting}</p>
          <p>${text.message}</p>
          <a href="${verificationUrl}" class="button">${text.button}</a>
          <p>${text.orText}</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <div class="footer">
            <p>${text.expiry}</p>
            <p>${text.ignore}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
