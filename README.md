# JWT Authentication API

A secure and robust JWT (JSON Web Token) based authentication system providing user registration, login, token refresh, and protected route access.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Register User](#1-register-user)
  - [Login User](#2-login-user)
  - [Refresh Token](#3-refresh-token)
  - [Get Current User](#4-get-current-user)
  - [Logout](#5-logout)
  - [Update User Profile](#6-update-user-profile)
  - [Change Password](#7-change-password)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [Frontend Integration Guide](#frontend-integration-guide)

---

## Features

- ✅ User registration with password hashing
- ✅ JWT-based authentication (Access & Refresh tokens)
- ✅ Token refresh mechanism
- ✅ Protected routes with middleware
- ✅ Password encryption using bcrypt
- ✅ User profile management
- ✅ Logout functionality
- ✅ Error handling and validation

---

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT (jsonwebtoken)** - Token generation and verification
- **bcrypt** - Password hashing
- **MongoDB/PostgreSQL** - Database (adjust based on your implementation)

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB/PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/Ozodbekk1/jwt-auth.git

# Navigate to project directory
cd jwt-auth

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start the server
npm start
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_ACCESS_SECRET=your_very_secure_access_token_secret
JWT_REFRESH_SECRET=your_very_secure_refresh_token_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
```

---

## API Endpoints

Base URL: `http://localhost:5000/api`

---

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Required Fields:**
- `email` (string, unique, valid email format)
- `password` (string, minimum 6 characters)
- `username` (string, unique, minimum 3 characters)

**Optional Fields:**
- `firstName` (string)
- `lastName` (string)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64a8f7e2c3d9e4f5a6b7c8d9",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-03-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Frontend Needs:**
- Form with email, password, username fields
- Email validation
- Password strength indicator (optional)
- Store tokens in localStorage/sessionStorage or httpOnly cookies

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT tokens

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Required Fields:**
- `email` (string) or `username` (string)
- `password` (string)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64a8f7e2c3d9e4f5a6b7c8d9",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Frontend Needs:**
- Login form with email/username and password
- Store both tokens securely
- Redirect to dashboard on success
- Handle "Remember me" functionality (optional)

---

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Description:** Get a new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Required Fields:**
- `refreshToken` (string)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Frontend Needs:**
- Automatic token refresh when access token expires
- Axios/fetch interceptor to handle 401 errors
- Store new tokens after refresh

---

### 4. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get current authenticated user details

**Headers:**
```
Authorization: Bearer <access_token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a8f7e2c3d9e4f5a6b7c8d9",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  }
}
```

**Frontend Needs:**
- Call on app initialization to check auth status
- Display user info in profile/navbar
- Handle 401 to redirect to login

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Invalidate refresh token and logout user

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Frontend Needs:**
- Clear tokens from storage
- Reset application state
- Redirect to login page

---

### 6. Update User Profile

**Endpoint:** `PUT /auth/profile`

**Description:** Update current user's profile information

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "64a8f7e2c3d9e4f5a6b7c8d9",
      "email": "user@example.com",
      "username": "janesmith",
      "firstName": "Jane",
      "lastName": "Smith",
      "updatedAt": "2024-03-15T12:30:00.000Z"
    }
  }
}
```

**Frontend Needs:**
- Profile edit form
- Field validation
- Update UI with new user data

---

### 7. Change Password

**Endpoint:** `POST /auth/change-password`

**Description:** Change current user's password

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Required Fields:**
- `currentPassword` (string)
- `newPassword` (string, minimum 6 characters)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewSecurePass123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Frontend Needs:**
- Password change form with current and new password fields
- Password confirmation field
- Password strength indicator

---

## Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────┐
│   Server    │
└──────┬──────┘
       │
       │ 2. Validate credentials
       │ 3. Generate tokens
       │
       ▼
┌─────────────────────────────┐
│ accessToken (15min)         │
│ refreshToken (7days)        │
└──────┬──────────────────────┘
       │
       │ 4. Return tokens to client
       ▼
┌─────────────┐
│   Client    │ Store tokens
└──────┬──────┘
       │
       │ 5. Access protected routes
       │    Authorization: Bearer <accessToken>
       ▼
┌─────────────┐
│   Server    │ Verify token
└──────┬──────┘
       │
       │ 6. Token expired?
       ├─── Yes ──► POST /auth/refresh
       │              { refreshToken }
       │
       └─── No ──► Return protected data
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes:

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 401 | `INVALID_CREDENTIALS` | Email or password is incorrect |
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 401 | `TOKEN_INVALID` | Invalid or malformed token |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 409 | `USER_EXISTS` | Email or username already registered |
| 500 | `SERVER_ERROR` | Internal server error |

**Example Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

---

## Frontend Integration Guide

### 1. Setting Up Axios Instance

Create an API service with automatic token refresh:

```javascript
// api/axios.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Call refresh endpoint
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

### 2. Authentication Service

Create auth service functions:

```javascript
// services/authService.js
import api from '../api/axios';

export const authService = {
  // Register new user
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Login user
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Logout user
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Change password
  changePassword: async (passwords) => {
    const { data } = await api.post('/auth/change-password', passwords);
    return data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

---

### 3. React Context Provider (React Example)

```javascript
// context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth init failed:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await authService.updateProfile(profileData);
    setUser(response.data.user);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### 4. Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
```

---

### 5. Example Login Component

```javascript
// pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

---

### 6. Using with Vue.js

For Vue.js projects, create a Pinia store:

```javascript
// stores/auth.js
import { defineStore } from 'pinia';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const response = await authService.login(credentials);
        this.user = response.data.user;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await authService.logout();
      this.user = null;
    },

    async fetchUser() {
      try {
        this.user = await authService.getCurrentUser();
      } catch (error) {
        this.user = null;
      }
    },
  },
});
```

---

### 7. Security Best Practices

1. **Store tokens securely:**
   - Use `httpOnly` cookies for production (most secure)
   - Use `localStorage` only for development/testing
   - Never store tokens in regular cookies accessible by JavaScript

2. **HTTPS only:**
   - Always use HTTPS in production
   - Tokens should never be transmitted over HTTP

3. **Token expiration:**
   - Access tokens: Short-lived (15 minutes)
   - Refresh tokens: Long-lived (7 days)

4. **CORS configuration:**
   - Whitelist specific origins
   - Don't use `*` in production

5. **Input validation:**
   - Always validate on both frontend and backend
   - Sanitize user inputs

---

## Testing with Postman

1. Import the collection (create a Postman collection with all endpoints)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `access_token`: (auto-updated after login)
   - `refresh_token`: (auto-updated after login)

3. Test flow:
   - Register → Login → Get User → Refresh Token → Logout

---

## License

MIT License - see LICENSE file for details

---

## Contributing

Pull requests are welcome! Please follow the contribution guidelines.

---

## Support

For issues and questions, please open a GitHub issue or contact https://www.oziy.uz

---

**Happy Coding! 🚀**
