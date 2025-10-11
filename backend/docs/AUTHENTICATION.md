# Authentication System Documentation

## Overview

The authentication system uses JWT (JSON Web Tokens) with access and refresh token pattern for secure user authentication.

## Features

- User registration with email and password
- Secure password hashing using bcrypt (12 rounds)
- JWT access tokens (15-minute expiration)
- JWT refresh tokens (7-day expiration)
- Token refresh mechanism
- Token revocation on logout
- Role-based access control (user, student, instructor, admin)
- Input validation using express-validator
- Rate limiting protection

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique, indexed
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `display_name` (VARCHAR) - User's display name
- `role` (VARCHAR) - User role (user, student, instructor, admin)
- `email_verified` (BOOLEAN) - Email verification status
- `last_login` (TIMESTAMP) - Last login timestamp
- `created_at` (TIMESTAMP) - Account creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Refresh Tokens Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `token` (VARCHAR) - Refresh token string
- `expires_at` (TIMESTAMP) - Token expiration time
- `created_at` (TIMESTAMP) - Token creation time
- `revoked` (BOOLEAN) - Token revocation status

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 8 characters with uppercase, lowercase, and number
- Display name must be 2-100 characters, alphanumeric with spaces, hyphens, underscores

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  },
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /api/auth/logout
Logout and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "emailVerified": false,
    "lastLogin": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_access_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

## Authentication Middleware

### authenticateToken
Protects routes requiring authentication. Verifies access token and attaches user to `req.user`.

**Usage:**
```javascript
import { authenticateToken } from './middleware/auth.js';

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains { id, email, role }
  res.json({ message: 'Protected data', user: req.user });
});
```

### requireRole(roles)
Checks if authenticated user has one of the specified roles.

**Usage:**
```javascript
import { requireRole } from './middleware/auth.js';

router.post('/admin-only', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin only endpoint' });
});
```

### Convenience Middleware
- `requireAdmin` - Requires admin role
- `requireInstructor` - Requires instructor or admin role
- `requireStudent` - Requires student, instructor, or admin role

### optionalAuth
Attaches user if valid token provided, but doesn't require authentication.

**Usage:**
```javascript
import { optionalAuth } from './middleware/auth.js';

router.get('/public-with-user', optionalAuth, (req, res) => {
  // req.user exists if token was provided and valid
  const message = req.user ? `Hello ${req.user.email}` : 'Hello guest';
  res.json({ message });
});
```

## Token Management

The `TokenManager` utility provides centralized token operations:

```javascript
import TokenManager from './utils/tokenManager.js';

// Generate tokens
const accessToken = TokenManager.generateAccessToken(user);
const refreshToken = TokenManager.generateRefreshToken(user);

// Store refresh token
await TokenManager.storeRefreshToken(userId, refreshToken);

// Verify tokens
const decoded = TokenManager.verifyAccessToken(token);

// Revoke tokens
await TokenManager.revokeRefreshToken(token);
await TokenManager.revokeAllUserTokens(userId);

// Validate refresh token
const tokenData = await TokenManager.validateRefreshToken(token);

// Cleanup expired tokens
const deletedCount = await TokenManager.cleanupExpiredTokens();
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 422 | Input validation failed |
| EMAIL_EXISTS | 409 | Email already registered |
| AUTH_FAILED | 401 | Invalid credentials |
| TOKEN_REQUIRED | 401 | No token provided |
| TOKEN_EXPIRED | 401 | Token has expired |
| INVALID_TOKEN | 401 | Token is invalid |
| TOKEN_REVOKED | 401 | Token has been revoked |
| FORBIDDEN | 403 | Insufficient permissions |
| USER_NOT_FOUND | 404 | User does not exist |

## Security Features

1. **Password Hashing**: Bcrypt with 12 salt rounds
2. **Token Expiration**: Short-lived access tokens (15 min), longer refresh tokens (7 days)
3. **Token Revocation**: Refresh tokens can be revoked on logout
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **Input Validation**: Server-side validation for all inputs
6. **HTTPS Only**: Tokens should only be transmitted over HTTPS in production
7. **Role-Based Access**: Fine-grained permission control

## Environment Variables

Required environment variables in `.env`:

```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Setup Instructions

1. **Run Database Migration:**
   ```bash
   npm run migrate
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and update the JWT secrets.

3. **Start Server:**
   ```bash
   npm run dev
   ```

## Frontend Integration Example

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken, user } = await response.json();

// Store tokens (use httpOnly cookies in production)
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated request
const protectedResponse = await fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when access token expires
const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', newAccessToken);
```

## Best Practices

1. **Store tokens securely**: Use httpOnly cookies for production
2. **Implement token refresh**: Automatically refresh access tokens before expiration
3. **Handle token expiration**: Redirect to login when refresh token expires
4. **Use HTTPS**: Always use HTTPS in production
5. **Validate on both sides**: Client-side validation for UX, server-side for security
6. **Clean up expired tokens**: Run periodic cleanup of expired refresh tokens
7. **Monitor failed attempts**: Implement account lockout after multiple failed login attempts

## Maintenance

### Cleanup Expired Tokens

Run periodically (e.g., daily cron job):

```javascript
import TokenManager from './utils/tokenManager.js';

const deletedCount = await TokenManager.cleanupExpiredTokens();
console.log(`Cleaned up ${deletedCount} expired tokens`);
```

### Revoke All User Sessions

For security incidents or password changes:

```javascript
import TokenManager from './utils/tokenManager.js';

const revokedCount = await TokenManager.revokeAllUserTokens(userId);
console.log(`Revoked ${revokedCount} tokens for user`);
```
