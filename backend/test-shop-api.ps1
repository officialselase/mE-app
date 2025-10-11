# Test Shop API Endpoints
# This script tests the shop backend infrastructure (products, cart, orders, payments)
# Note: These endpoints are not connected to the frontend yet

$baseUrl = "http://localhost:3010/api"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🛍️ Testing Shop API Endpoints" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test 1: Get Products (should work without auth)
Write-Host "`n1. Testing GET /api/products" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    Write-Host "✅ Products endpoint working" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Products endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Try to access cart without auth (should fail)
Write-Host "`n2. Testing GET /api/cart (without auth - should fail)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $headers
    Write-Host "❌ Cart endpoint should require authentication" -ForegroundColor Red
} catch {
    Write-Host "✅ Cart endpoint correctly requires authentication" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Cyan
}

# Test 3: Try to initialize payment without auth (should fail)
Write-Host "`n3. Testing POST /api/payments/initialize (without auth - should fail)" -ForegroundColor Yellow
$paymentData = @{
    amount = 29.99
    currency = "GHS"
    email = "test@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payments/initialize" -Method POST -Headers $headers -Body $paymentData
    Write-Host "❌ Payment endpoint should require authentication" -ForegroundColor Red
} catch {
    Write-Host "✅ Payment endpoint correctly requires authentication" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Cyan
}

# Test 4: Check server health
Write-Host "`n4. Testing server health" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/health" -Method GET
    Write-Host "✅ Server is healthy" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Shop API infrastructure test completed!" -ForegroundColor Green
Write-Host "Note: Full functionality requires authentication and Paystack configuration" -ForegroundColor Yellow