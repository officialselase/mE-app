# Authentication System Quick Reference

## Quick Start

```bash
# 1. Setup database
npm run migrate

# 2. Start server
npm run dev

# 3. Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","displayName":"Test User"}'
```

## API Endpoints Cheat Sheet

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | No | Logout (revoke token) |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/refresh` | No | Refresh access token |

## Protecting Routes

```javascript
import { authenticateToken, requireAdmin, requireStudent } from './middleware/auth.js';

// Require authentication
router.get('/protected', authenticateToken, handler);

// Require specific role
router.post('/admin', authenticateToken, requireAdmin, handler);

// Require student or higher
router.get('/courses', authenticateToken, requireStudent, handler);

// Optional authentication
router.get('/public', optionalAuth, handler);
```

## Using TokenManager

```javascript
import TokenManager from './utils/tokenManager.js';

// Generate tokens
const accessToken = TokenManager.generateAccessToken(user);
const refreshToken = TokenManager.generateRefreshToken(user);

// Store refresh token
await TokenManager.storeRefreshToken(userId, refreshToken);

// Verify token
const decoded = TokenManager.verifyAccessToken(token);

// Revoke token
await TokenManager.revokeRefreshToken(token);

// Cleanup expired
await TokenManager.cleanupExpiredTokens();
```

## User Model Methods

```javascript
import User from './models/User.js';

// Create user
const user = await User.create({ email, password, displayName });

// Find user
const user = await User.findByEmail(email);
const user = await User.findById(id);

// Verify password
const isValid = await User.verifyPassword(plainPassword, hashedPassword);

// Update user
await User.updateLastLogin(userId);
await User.update(userId, { display_name: 'New Name' });

// Delete user
await User.delete(userId);
```

## Request/Response Examples

### Register
```javascript
// Request
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}

// Response (201)
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "displayName": "...", "role": "user" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Login
```javascript
// Request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response (200)
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "displayName": "...", "role": "user" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Get Current User
```javascript
// Request
GET /api/auth/me
Authorization: Bearer <access_token>

// Response (200)
{
  "user": {
    "id": "...",
    "email": "...",
    "displayName": "...",
    "role": "user",
    "emailVerified": false,
    "lastLogin": "...",
    "createdAt": "..."
  }
}
```

### Refresh Token
```javascript
// Request
POST /api/auth/refresh
{
  "refreshToken": "..."
}

// Response (200)
{
  "accessToken": "...",
  "user": { "id": "...", "email": "...", "displayName": "...", "role": "user" }
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 422 | Invalid input |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `AUTH_FAILED` | 401 | Wrong credentials |
| `TOKEN_REQUIRED` | 401 | No token provided |
| `TOKEN_EXPIRED` | 401 | Token expired |
| `INVALID_TOKEN` | 401 | Invalid token |
| `TOKEN_REVOKED` | 401 | Token revoked |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `USER_NOT_FOUND` | 404 | User doesn't exist |

## Validation Rules

### Email
- Valid email format
- Automatically normalized (lowercase, trimmed)

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Display Name
- 2-100 characters
- Letters, numbers, spaces, hyphens, underscores only

## Environment Variables

```env
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Common Tasks

### Add Admin User Manually
```sql
-- In PostgreSQL
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Revoke All User Sessions
```javascript
await TokenManager.revokeAllUserTokens(userId);
```

### Clean Expired Tokens
```javascript
const count = await TokenManager.cleanupExpiredTokens();
console.log(`Deleted ${count} expired tokens`);
```

### Check User's Active Sessions
```javascript
const tokens = await TokenManager.getUserActiveTokens(userId);
console.log(`User has ${tokens.length} active sessions`);
```

## Frontend Integration Pattern

```javascript
// Store tokens after login
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Add token to requests
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

// Handle token expiration
if (response.status === 401) {
  // Try to refresh
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      refreshToken: localStorage.getItem('refreshToken') 
    })
  });
  
  if (refreshResponse.ok) {
    const { accessToken } = await refreshResponse.json();
    localStorage.setItem('accessToken', accessToken);
    // Retry original request
  } else {
    // Redirect to login
  }
}
```

## Troubleshooting

### "Connection refused"
- Check PostgreSQL is running
- Verify DB credentials in `.env`

### "Invalid token"
- Check JWT_SECRET matches
- Verify token format: `Bearer <token>`
- Check token hasn't expired

### "Email already exists"
- User already registered
- Use login instead of register

### "Validation failed"
- Check password meets requirements
- Verify email format
- Check display name length

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] Short-lived access tokens (15 min)
- [x] Refresh tokens with revocation
- [x] Input validation on all endpoints
- [x] Rate limiting enabled
- [x] SQL injection prevention (parameterized queries)
- [x] CORS configured
- [ ] HTTPS in production
- [ ] httpOnly cookies in production
- [ ] Account lockout after failed attempts (future)

## Performance Tips

1. Use connection pooling (already configured)
2. Add indexes on frequently queried fields (already done)
3. Clean up expired tokens regularly
4. Monitor database query performance
5. Use caching for frequently accessed data

## Documentation Links

- Full API Documentation: `AUTHENTICATION.md`
- Setup Guide: `SETUP_GUIDE.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
