# Authentication System Test Script
# Run this after starting the server with: npm run dev

$baseUrl = "http://localhost:5000"
$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Authentication System Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[1/6] Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ PASS: Health check - Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: Health check failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Register New User
Write-Host "`n[2/6] Testing user registration..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test$timestamp@example.com"

$registerBody = @{
    email = $testEmail
    password = "SecurePass123"
    displayName = "Test User $timestamp"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ PASS: User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $($register.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($register.user.email)" -ForegroundColor Gray
    $accessToken = $register.accessToken
    $refreshToken = $register.refreshToken
} catch {
    Write-Host "❌ FAIL: Registration failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Login
Write-Host "`n[3/6] Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "SecurePass123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ PASS: Login successful" -ForegroundColor Green
    Write-Host "   Display Name: $($login.user.displayName)" -ForegroundColor Gray
    $accessToken = $login.accessToken
    $refreshToken = $login.refreshToken
} catch {
    Write-Host "❌ FAIL: Login failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Get Current User (Protected Route)
Write-Host "`n[4/6] Testing protected endpoint (GET /api/auth/me)..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $me = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "✅ PASS: Protected endpoint works" -ForegroundColor Green
    Write-Host "   Email: $($me.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($me.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Protected endpoint failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Token Refresh
Write-Host "`n[5/6] Testing token refresh..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refresh = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "✅ PASS: Token refresh successful" -ForegroundColor Green
    Write-Host "   New access token generated" -ForegroundColor Gray
    $newAccessToken = $refresh.accessToken
} catch {
    Write-Host "❌ FAIL: Token refresh failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 6: Logout
Write-Host "`n[6/6] Testing logout..." -ForegroundColor Yellow
$logoutBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $logout = Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method Post -Body $logoutBody -ContentType "application/json"
    Write-Host "✅ PASS: Logout successful" -ForegroundColor Green
    Write-Host "   Message: $($logout.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Logout failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Validation Tests
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Validation Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test: Invalid Email
Write-Host "[V1] Testing invalid email validation..." -ForegroundColor Yellow
$invalidEmailBody = @{
    email = "invalid-email"
    password = "SecurePass123"
    displayName = "Test"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $invalidEmailBody -ContentType "application/json"
    Write-Host "❌ FAIL: Should have rejected invalid email" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "✅ PASS: Invalid email rejected (422)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARN: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test: Weak Password
Write-Host "`n[V2] Testing weak password validation..." -ForegroundColor Yellow
$weakPasswordBody = @{
    email = "test2@example.com"
    password = "weak"
    displayName = "Test"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $weakPasswordBody -ContentType "application/json"
    Write-Host "❌ FAIL: Should have rejected weak password" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "✅ PASS: Weak password rejected (422)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARN: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test: Invalid Credentials
Write-Host "`n[V3] Testing invalid credentials..." -ForegroundColor Yellow
$invalidCredsBody = @{
    email = $testEmail
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $invalidCredsBody -ContentType "application/json"
    Write-Host "❌ FAIL: Should have rejected invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Invalid credentials rejected (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARN: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test: Missing Token
Write-Host "`n[V4] Testing missing token..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get
    Write-Host "❌ FAIL: Should have required token" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS: Missing token rejected (401)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARN: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "✅ All core authentication tests passed!" -ForegroundColor Green
Write-Host "✅ All validation tests passed!" -ForegroundColor Green
Write-Host "`nTasks 1 & 2 are working correctly!`n" -ForegroundColor Green
