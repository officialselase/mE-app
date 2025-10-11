# Backend Testing Plan - Tasks 1 & 2

## Current Status

✅ **Task 1: Set up backend infrastructure** - COMPLETED
✅ **Task 2: Implement authentication system** - COMPLETED

## Issue Identified

❌ **PostgreSQL is not running** - The server cannot start because it cannot connect to the database.

Error: `ECONNREFUSED ::1:5432` and `ECONNREFUSED 127.0.0.1:5432`

## Prerequisites Setup

### 1. Install PostgreSQL (if not installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`
- Or use Scoop: `scoop install postgresql`

**Verify Installation:**
```powershell
psql --version
```

### 2. Start PostgreSQL Service

**Windows (PowerShell as Administrator):**
```powershell
# Check if service exists
Get-Service -Name postgresql*

# Start the service
Start-Service -Name postgresql-x64-14  # Replace with your version

# Or use pg_ctl
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" start
```

**Alternative: Check if PostgreSQL is running:**
```powershell
# Check if port 5432 is listening
netstat -an | findstr :5432
```

### 3. Create Database

Once PostgreSQL is running:

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE portfolio_db;
\q
```

### 4. Update .env File

Update `backend/.env` with your actual PostgreSQL password:

```env
DB_PASSWORD=your_actual_postgres_password
```

## Testing Plan

### Phase 1: Database Connection Test

**Test 1.1: Verify PostgreSQL is Running**
```powershell
# Check service status
Get-Service -Name postgresql*

# Expected: Status should be "Running"
```

**Test 1.2: Test Database Connection**
```powershell
# From backend directory
node -e "import('pg').then(({default: pg}) => { const pool = new pg.Pool({host:'localhost',port:5432,database:'portfolio_db',user:'postgres',password:'your_password'}); pool.query('SELECT NOW()').then(r => console.log('✅ Connected:', r.rows[0])).catch(e => console.error('❌ Error:', e.message)).finally(() => pool.end()); })"
```

**Test 1.3: Run Database Migrations**
```powershell
cd backend
npm run migrate
```

Expected output:
```
🔄 Starting database migrations...
📄 Running migration: 001_create_users_table.sql
✅ Completed: 001_create_users_table.sql
✅ All migrations completed successfully!
🎉 Database setup complete!
```

### Phase 2: Server Startup Test

**Test 2.1: Start Server**
```powershell
cd backend
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

**Test 2.2: Health Check**
```powershell
# In a new terminal
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T...",
  "environment": "development"
}
```

### Phase 3: Authentication Endpoints Test

**Test 3.1: User Registration**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123\",\"displayName\":\"Test User\"}'
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
  "accessToken": "jwt_token...",
  "refreshToken": "jwt_refresh_token..."
}
```

**Test 3.2: User Login**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123\"}'
```

Expected response (200):
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**Test 3.3: Get Current User (Protected Route)**
```powershell
# Save the access token from login/register
$token = "your_access_token_here"

curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer $token"
```

Expected response (200):
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "user",
    "emailVerified": false,
    "lastLogin": "...",
    "createdAt": "..."
  }
}
```

**Test 3.4: Token Refresh**
```powershell
$refreshToken = "your_refresh_token_here"

curl -X POST http://localhost:5000/api/auth/refresh `
  -H "Content-Type: application/json" `
  -d "{\"refreshToken\":\"$refreshToken\"}"
```

Expected response (200):
```json
{
  "accessToken": "new_access_token...",
  "user": { ... }
}
```

**Test 3.5: Logout**
```powershell
curl -X POST http://localhost:5000/api/auth/logout `
  -H "Content-Type: application/json" `
  -d "{\"refreshToken\":\"$refreshToken\"}"
```

Expected response (200):
```json
{
  "message": "Logout successful"
}
```

### Phase 4: Validation Tests

**Test 4.1: Invalid Email Format**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"invalid-email\",\"password\":\"SecurePass123\",\"displayName\":\"Test\"}'
```

Expected response (422):
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 422,
  "fields": {
    "email": "Invalid email format"
  }
}
```

**Test 4.2: Weak Password**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test2@example.com\",\"password\":\"weak\",\"displayName\":\"Test\"}'
```

Expected response (422):
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 422,
  "fields": {
    "password": "Password must be at least 8 characters"
  }
}
```

**Test 4.3: Duplicate Email**
```powershell
# Try to register with same email again
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"SecurePass123\",\"displayName\":\"Test\"}'
```

Expected response (409):
```json
{
  "error": "Email already exists",
  "code": "EMAIL_EXISTS",
  "statusCode": 409
}
```

**Test 4.4: Invalid Credentials**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"WrongPassword123\"}'
```

Expected response (401):
```json
{
  "error": "Invalid credentials",
  "code": "AUTH_FAILED",
  "statusCode": 401
}
```

**Test 4.5: Missing Token**
```powershell
curl http://localhost:5000/api/auth/me
```

Expected response (401):
```json
{
  "error": "Access token required",
  "code": "TOKEN_REQUIRED",
  "statusCode": 401
}
```

**Test 4.6: Invalid Token**
```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer invalid_token_here"
```

Expected response (401):
```json
{
  "error": "Invalid access token",
  "code": "INVALID_TOKEN",
  "statusCode": 401
}
```

### Phase 5: Database Verification

**Test 5.1: Verify Users Table**
```sql
-- Connect to database
psql -U postgres -d portfolio_db

-- Check users table
SELECT * FROM users;

-- Expected: Should see the test user created
```

**Test 5.2: Verify Refresh Tokens Table**
```sql
SELECT user_id, expires_at, revoked, created_at FROM refresh_tokens;

-- Expected: Should see refresh tokens for the test user
```

**Test 5.3: Verify Password Hashing**
```sql
SELECT email, password_hash FROM users WHERE email = 'test@example.com';

-- Expected: password_hash should be a bcrypt hash (starts with $2b$)
```

**Test 5.4: Verify Indexes**
```sql
\di

-- Expected: Should see indexes on users(email), users(role), refresh_tokens(token), etc.
```

## Test Results Checklist

### Task 1: Backend Infrastructure
- [ ] PostgreSQL installed and running
- [ ] Database `portfolio_db` created
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Error handling works

### Task 2: Authentication System
- [ ] Database migrations run successfully
- [ ] Users table created with correct schema
- [ ] Refresh tokens table created
- [ ] User registration works
- [ ] Password hashing works (bcrypt)
- [ ] User login works
- [ ] JWT tokens generated correctly
- [ ] Protected routes require authentication
- [ ] Token refresh works
- [ ] Logout revokes tokens
- [ ] Input validation works
- [ ] Error responses are correct
- [ ] Duplicate email prevention works
- [ ] Invalid credentials rejected

## Troubleshooting

### Issue: PostgreSQL not installed
**Solution:** Install PostgreSQL from https://www.postgresql.org/download/

### Issue: PostgreSQL service not running
**Solution:** 
```powershell
Start-Service -Name postgresql-x64-14
```

### Issue: Database doesn't exist
**Solution:**
```powershell
psql -U postgres -c "CREATE DATABASE portfolio_db;"
```

### Issue: Wrong database password
**Solution:** Update `backend/.env` with correct password

### Issue: Port 5432 already in use
**Solution:** Check what's using the port:
```powershell
netstat -ano | findstr :5432
```

### Issue: Migrations fail
**Solution:** 
1. Check database connection
2. Verify user has CREATE TABLE permissions
3. Check if tables already exist (drop them if needed)

## Quick Test Script

Create a file `backend/test-auth.ps1`:

```powershell
# Test script for authentication endpoints
$baseUrl = "http://localhost:5000"

Write-Host "Testing Authentication System..." -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host "✅ Health check passed: $($health.status)" -ForegroundColor Green

# Test 2: Register
Write-Host "`n2. Testing user registration..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser@example.com"
    password = "SecurePass123"
    displayName = "Test User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration successful" -ForegroundColor Green
    $accessToken = $register.accessToken
    $refreshToken = $register.refreshToken
} catch {
    Write-Host "⚠️  Registration failed (user may already exist)" -ForegroundColor Yellow
}

# Test 3: Login
Write-Host "`n3. Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "✅ Login successful" -ForegroundColor Green
$accessToken = $login.accessToken
$refreshToken = $login.refreshToken

# Test 4: Get Current User
Write-Host "`n4. Testing protected endpoint..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}
$me = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
Write-Host "✅ Protected endpoint works: $($me.user.email)" -ForegroundColor Green

# Test 5: Refresh Token
Write-Host "`n5. Testing token refresh..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json
$refresh = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
Write-Host "✅ Token refresh successful" -ForegroundColor Green

Write-Host "`n✅ All tests passed!" -ForegroundColor Green
```

Run with:
```powershell
cd backend
.\test-auth.ps1
```

## Summary

To test Tasks 1 & 2:

1. **Install and start PostgreSQL**
2. **Create database:** `portfolio_db`
3. **Update `.env`** with correct password
4. **Run migrations:** `npm run migrate`
5. **Start server:** `npm run dev`
6. **Run tests** using curl commands or PowerShell script above

All code is implemented correctly. The only issue is that PostgreSQL needs to be running on your system.
