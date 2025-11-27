<!-- @format -->

# QuoteVerse API – Full Documentation  
A modern RESTful API for a quote-sharing social platform built with Node.js, Express.js, MongoDB & JWT authentication.

## Base URL
```
https://your-domain.com/api/v1
```
(or `http://localhost:5000/api/v1` in development)

## Features
- User registration & login with email verification  
- JWT access + refresh token system  
- Password reset flow  
- Create, update, delete quotes  
- Comment system on quotes  
- Protected routes with `verifyAccessToken` middleware  
- Get public quotes & user-specific quotes  

## Tech Stack
- Node.js + Express  
- MongoDB + Mongoose  
- JWT (access & refresh tokens)  
- bcrypt for password hashing  
- nodemailer for emails  

## Environment Variables (.env)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quoteverse
JWT_ACCESS_SECRET=your_very_long_access_secret
JWT_REFRESH_SECRET=your_very_long_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

## Installation & Running
```bash
git clone <repo>
npm install
npm run dev    # development with nodemon
npm start      # production
```

---

## API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint                        | Auth Required | Description                       |
|-------|----------------------------------|---------------|-----------------------------------|
| POST  | `/auth/register`                 | No            | Register new user                 |
| POST  | `/auth/login`                    | No            | Login → returns access & refresh  |
| POST  | `/auth/refresh`                  | Yes           | Get new access token              |
| POST  | `/auth/logout`                   | Yes           | Invalidate refresh token          |
| GET   | `/auth/verify-email/:token`      | No            | Verify email address              |
| POST  | `/auth/resend-verification`      | No            | Resend verification email         |
| POST  | `/auth/forgot-password`          | No            | Send password reset link          |
| POST  | `/auth/reset-password/:token`    | No            | Reset password with token         |

#### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "StrongPass123!"
  }'
```
**Success Response (201)**
```json
{
  "success": true,
  "message": "User registered. Please check your email to verify."
}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "StrongPass123!"
  }'
```
**Response (200)**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

#### Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Authorization: Bearer <access_token>"
```
→ Returns new `accessToken`

#### Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

#### Verify Email
Open link sent to email:
```
GET /api/v1/auth/verify-email/:token
```

#### Forgot Password
```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com"}'
```

#### Reset Password
```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password/:token \
  -H "Content-Type: application/json" \
  -d '{"password": "NewStrongPass123!"}'
```

---

### Quote Routes (`/quote`)

| Method | Endpoint                              | Auth | Description                      |
|--------|--------------------------------------|------|----------------------------------|
| POST   | `/quote/create/quote`                | Yes  | Create new quote                 |
| PUT    | `/quote/update/quote/:quoteId`       | Yes  | Update own quote                 |
| DELETE | `/quote/delete/quote/:quoteId`       | Yes  | Delete own quote                 |
| GET    | `/quote/get/quote/my-quote`          | Yes  Yes | Get all quotes of logged-in user |
| GET    | `/quote/get/quote`                   | No   | Get all public quotes (latest first) |
| GET    | `/quote/get/quote/:quoteId`          | No   | Get single quote with comments   |
| POST   | `/quote/write/comment/:quoteId`      | Yes  | Add comment                      |
| PUT    | `/quote/update/comment/:commentId`   | Yes  | Update own comment               |
| DELETE | `/quote/delete/comment/:quoteId/:commentId` | Yes | Delete own comment        |

#### Create Quote
```bash
curl -X POST http://localhost:5000/api/v1/quote/create/quote \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs"
  }'
```

#### Update Quote
```bash
curl -X PUT http://localhost:5000/api/v1/quote/update/quote/64f8a1b2c9d3e2f1a2345678 \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "text": "Updated quote text here"
  }'
```

#### Get All Quotes (Public)
```bash
curl http://localhost:5000/api/v1/quote/get/quote
```

#### Get My Quotes
```bash
curl http://localhost:5000/api/v1/quote/get/quote/my-quote \
  -H "Authorization: Bearer <access_token>"
```

#### Write Comment
```bash
curl -X POST http://localhost:5000/api/v1/quote/write/comment/64f8a1b2c9d3e2f1a2345678 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "So inspiring!"
  }'
```

#### Update Comment
```bash
curl -X PUT http://localhost:5000/api/v1/quote/update/comment/64f9b3d4e5f6a7b8c9d0e1f2 \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "text": "Actually even more inspiring!"
  }'
```

#### Delete Comment
```bash
curl -X DELETE http://localhost:5000/api/v1/quote/delete/comment/64f8a1b2c9d3e2f1a2345678/64f9b3d4e5f6a7b8c9d0e1f2 \
  -H "Authorization: Bearer <access_token>"
```

---

### User Routes (`/user`)

| Method | Endpoint                     | Auth | Description                     |
|--------|-----------------------------|------|---------------------------------|
| PUT    | `/user/update/user`         | Yes  | Update profile (name, bio, avatar…) |
| GET    | `/user/profile`             | Yes  | Get current logged-in user      |
| GET    | `/user/profile/:userName`   | No   | Get public profile by username   |

#### Update Profile
```bash
curl -X PUT http://localhost:5000/api/v1/user/update/user \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "bio": "Full-stack dev & quote lover"
  }'
```

#### Get Current User
```bash
curl http://localhost:5000/api/v1/user/profile \
  -H "Authorization: Bearer <access_token>"
```

#### Get User by Username (public)
```bash
curl http://localhost:5000/api/v1/user/profile/johndoe
```

---

## Authentication Flow (How Frontend Should Handle)

1. **Register → Login** → store `accessToken` & `refreshToken` (secure httpOnly cookie or localStorage)
2. Attach `Authorization: Bearer <access_token>` to every protected request
3. When 401 → call `/auth/refresh` → replace access token
4. On logout → call `/auth/logout` + clear tokens

---

## Expected Request/Response Shapes

### Register / Login Body
```json
{
  "name": "string",
  "userName": "string (unique)",
  "email": "string (unique)",
  "password": "string (min 6)"
}
```

### Quote Body (create/update)
```json
{
  "text": "string (required)",
  "author": "string (optional)"
}
```

### Comment Body
```json
{
  "text": "string (required)"
}
```

### Typical Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

## Postman Collection (Optional)
You can import this ready-made collection:  
[QuoteVerse API Postman Collection]( https://web.postman.co/workspace/backend-courses~96521b08-be54-4009-81e1-9c86aa937e18/collection/40851069-e3654225-1c0c-498e-842c-5e8aece997a5?action=share&source=copy-link&creator=40851069 )

---

## Contributing
1. Fork → Create feature branch  
2. Write clean code & tests  
3. Open Pull Request with clear description  

## License
MIT © QuoteVerse Team

---
Made with https://www.oziy.uz for quote lovers everywhere!
