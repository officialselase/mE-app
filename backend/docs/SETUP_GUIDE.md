# Authentication System Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

All required dependencies are already in `package.json`:
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `express-validator` - Input validation
- `pg` - PostgreSQL client

Dependencies are already installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 2. Configure Database

Create a PostgreSQL database for the project:

```sql
CREATE DATABASE portfolio_db;
```

Or use an existing database by updating the `.env` file.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=postgres
DB_PASSWORD=your_actual_password

# JWT Configuration (IMPORTANT: Change these in production!)
JWT_SECRET=your_secure_random_string_here_min_32_chars
JWT_REFRESH_SECRET=your_different_secure_random_string_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Security Note:** Generate strong random secrets for production:
```bash
# Generate random secrets (Linux/Mac)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

Execute the migration script to create the necessary tables:

```bash
npm run migrate
```

This will create:
- `users` table with authentication fields
- `refresh_tokens` table for token management
- Necessary indexes for performance
- Triggers for automatic timestamp updates

Expected output:
```
🔄 Starting database migrations...

📄 Running migration: 001_create_users_table.sql
✅ Completed: 001_create_users_table.sql

✅ All migrations completed successfully!

🎉 Database setup complete!
```

### 5. Verify Database Setup

Connect to your database and verify the tables were created:

```sql
-- Check users table
\d users

-- Check refresh_tokens table
\d refresh_tokens

-- Verify indexes
\di
```

### 6. Start the Server

Start the development server:

```bash
npm run dev
```

Expected output:
```
✅ Database connection verified
✅ Database connected successfully
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:5173
```

### 7. Test the Authentication Endpoints

#### Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development"
}
```

#### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "displayName": "Test User"
  }'
```

Expected response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "user"
  },
  "accessToken": "jwt_token_here",
  "refreshToken": "jwt_refresh_token_here"
}
```

#### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

#### Test Get Current User
```bash
# Replace YOUR_ACCESS_TOKEN with the token from login/register
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Token Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### Test Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Troubleshooting

### Database Connection Issues

**Error:** `Connection refused`
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l`

**Error:** `password authentication failed`
- Verify `DB_USER` and `DB_PASSWORD` in `.env`
- Check PostgreSQL `pg_hba.conf` for authentication method

### Migration Issues

**Error:** `relation "users" already exists`
- Tables already exist. Drop them if you want to re-run:
  ```sql
  DROP TABLE IF EXISTS refresh_tokens CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```

### Token Issues

**Error:** `Invalid token`
- Verify `JWT_SECRET` matches between token generation and verification
- Check token hasn't expired
- Ensure token is sent in correct format: `Bearer <token>`

**Error:** `Token expired`
- Access tokens expire after 15 minutes by default
- Use refresh token to get a new access token
- Adjust `JWT_EXPIRES_IN` in `.env` if needed for development

### Validation Errors

**Error:** `Password must be at least 8 characters`
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Error:** `Invalid email format`
- Ensure email is in valid format: `user@domain.com`

## Next Steps

1. **Frontend Integration**: See `AUTHENTICATION.md` for frontend integration examples
2. **Protected Routes**: Add authentication to other API endpoints
3. **Role-Based Access**: Implement role-specific features
4. **Email Verification**: Add email verification flow (future enhancement)
5. **Password Reset**: Implement password reset functionality (future enhancement)

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS only
- [ ] Configure httpOnly cookies for token storage
- [ ] Set up database backups
- [ ] Configure proper CORS origins
- [ ] Enable database SSL connection
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting per user (not just per IP)
- [ ] Add account lockout after failed login attempts
- [ ] Set up automated cleanup of expired tokens

## Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
